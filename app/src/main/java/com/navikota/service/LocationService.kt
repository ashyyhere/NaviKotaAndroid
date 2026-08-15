package com.navikota.service

import android.annotation.SuppressLint
import android.content.Context
import android.os.Looper
import com.google.android.gms.location.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.osmdroid.util.GeoPoint

class LocationService(private val context: Context) {
    private val fusedClient = LocationServices.getFusedLocationProviderClient(context)
    private val _location = MutableStateFlow<GeoPoint?>(null)
    val location: StateFlow<GeoPoint?> = _location.asStateFlow()

    private val _isTracking = MutableStateFlow(false)
    val isTracking: StateFlow<Boolean> = _isTracking.asStateFlow()

    private var callback: LocationCallback? = null

    @SuppressLint("MissingPermission")
    fun startTracking() {
        if (_isTracking.value) return
        _isTracking.value = true

        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000L)
            .setMinUpdateDistanceMeters(10f)
            .setMinUpdateIntervalMillis(3000L)
            .build()

        callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { loc ->
                    _location.value = GeoPoint(loc.latitude, loc.longitude)
                }
            }
        }

        fusedClient.requestLocationUpdates(request, callback!!, Looper.getMainLooper())
    }

    fun stopTracking() {
        callback?.let { fusedClient.removeLocationUpdates(it) }
        callback = null
        _isTracking.value = false
    }
}
