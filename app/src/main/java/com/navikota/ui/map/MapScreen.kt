package com.navikota.ui.map

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.view.ViewGroup
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import com.navikota.data.model.Categories
import com.navikota.data.model.CatKey
import com.navikota.data.model.Place
import com.navikota.ui.components.*
import com.navikota.ui.theme.DarkRoute
import com.navikota.ui.theme.HomeGold
import com.navikota.ui.theme.LightRoute
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.BoundingBox
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polyline
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay

@SuppressLint("MissingPermission")
@Composable
fun MapScreen(
    onPlaceClick: (Place) -> Unit,
    onSearchClick: () -> Unit,
    onSettingsClick: () -> Unit,
    viewModel: MapViewModel = viewModel()
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        Configuration.getInstance().userAgentValue = context.packageName
        Configuration.getInstance().isMapViewHardwareAccelerated = true
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
            factory = { ctx ->
                MapView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    setTileSource(TileSourceFactory.MAPNIK)
                    setMultiTouchControls(true)
                    controller.setZoom(14.0)
                    controller.setCenter(GeoPoint(25.145, 75.842))

                    val mapEventsOverlay = MapEventsOverlay(object : MapEventsReceiver {
                        override fun singleTapConfirmedHelper(p: GeoPoint): Boolean {
                            if (state.isAddMode) {
                                viewModel.addPlace(p.latitude, p.longitude)
                                return true
                            }
                            return false
                        }
                        override fun longPressHelper(p: GeoPoint): Boolean = false
                    })
                    overlays.add(0, mapEventsOverlay)
                }
            },
            modifier = Modifier.fillMaxSize(),
            update = { mapView ->
                mapView.overlays.removeAll { it is Marker }

                state.filteredPlaces.forEach { place ->
                    val marker = Marker(mapView).apply {
                        position = GeoPoint(place.lat, place.lng)
                        val bitmap = MarkerFactory.createMarkerBitmap(context, place.cat)
                        icon = android.graphics.drawable.BitmapDrawable(context.resources, bitmap)
                        setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
                        title = place.name
                        snippet = Categories.map[place.cat]?.label

                        setOnMarkerClickListener { _, _ ->
                            viewModel.selectPlace(place)
                            onPlaceClick(place)
                            true
                        }
                    }
                    mapView.overlays.add(marker)
                }

                state.homeId?.let { homeId ->
                    state.places.find { it.id == homeId }?.let { home ->
                        val homeMarker = Marker(mapView).apply {
                            position = GeoPoint(home.lat, home.lng)
                            val bitmap = MarkerFactory.createHomeBitmap(context)
                            icon = android.graphics.drawable.BitmapDrawable(context.resources, bitmap)
                            setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
                            title = "Home"
                        }
                        mapView.overlays.add(homeMarker)
                    }
                }

                if (state.isTracking) {
                    val locationOverlay = MyLocationNewOverlay(GpsMyLocationProvider(context), mapView).apply {
                        enableMyLocation()
                        enableFollowLocation()
                    }
                    mapView.overlays.add(locationOverlay)
                }

                mapView.overlays.removeAll { it is Polyline && it.title == "route" }
                state.destination?.let { dest ->
                    val origin = viewModel.getOrigin()
                    if (origin != null) {
                        val route = Polyline().apply {
                            title = "route"
                            setPoints(listOf(
                                origin,
                                GeoPoint(dest.lat, dest.lng)
                            ))
                            outlinePaint.color = if (state.isDarkTheme) 0xFF58A6FF.toInt() else 0xFF2B6CB8.toInt()
                            outlinePaint.strokeWidth = 8f
                        }
                        mapView.overlays.add(route)
                    }
                }

                mapView.invalidate()
            }
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
                .align(Alignment.TopCenter),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(modifier = Modifier.weight(1f)) {
                SearchBar(onClick = onSearchClick)
            }

            IconButton(
                onClick = onSettingsClick,
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            ) {
                Icon(
                    Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 16.dp)
                .align(Alignment.BottomCenter),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            state.categoryVisibility.toList().take(4).forEach { (catKey, visible) ->
                val count = state.places.count { it.cat == catKey }
                CategoryChip(
                    catKey = catKey,
                    count = count,
                    isVisible = visible,
                    onClick = { viewModel.toggleCategory(catKey) }
                )
            }
        }

        FloatingActionButton(
            onClick = { viewModel.toggleTracking() },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 16.dp, bottom = 80.dp),
            containerColor = if (state.isTracking) MaterialTheme.colorScheme.primary
            else MaterialTheme.colorScheme.surface
        ) {
            Icon(
                if (state.isTracking) Icons.Default.LocationSearching else Icons.Default.LocationOff,
                contentDescription = "Track location",
                tint = if (state.isTracking) MaterialTheme.colorScheme.onPrimary
                else MaterialTheme.colorScheme.onSurface
            )
        }

        state.destination?.let { dest ->
            val km = viewModel.getDistanceTo(dest)
            if (km != null) {
                RouteBadge(
                    destinationName = dest.name,
                    distanceKm = km,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp)
                        .align(Alignment.BottomCenter)
                )
            }
        }
    }
}