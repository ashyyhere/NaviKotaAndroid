package com.navikota

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.navikota.data.model.Place
import com.navikota.service.LocationService
import com.navikota.ui.detail.PlaceDetailSheet
import com.navikota.ui.map.MapScreen
import com.navikota.ui.map.MapViewModel
import com.navikota.ui.place.AddEditPlaceScreen
import com.navikota.ui.search.SearchOverlay
import com.navikota.ui.settings.SettingsScreen
import com.navikota.ui.theme.NaviKotaTheme

class MainActivity : ComponentActivity() {
    private lateinit var locationService: LocationService

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fine = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarse = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        if (fine || coarse) {
            locationService.startTracking()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        locationService = LocationService(this)

        setContent {
            val viewModel: MapViewModel = viewModel()
            val state by viewModel.uiState.collectAsState()

            NaviKotaTheme(isDark = state.isDarkTheme) {
                val location by locationService.location.collectAsState()

                LaunchedEffect(location) {
                    location?.let { viewModel.updateUserPosition(it) }
                }

                val isTracking by locationService.isTracking.collectAsState()
                LaunchedEffect(state.isTracking) {
                    if (state.isTracking && !isTracking) {
                        requestLocationPermission()
                    } else if (!state.isTracking && isTracking) {
                        locationService.stopTracking()
                    }
                }

                var editingPlace by remember { mutableStateOf<Place?>(null) }
                var showAddEdit by remember { mutableStateOf(false) }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    when {
                        // Settings screen (full screen)
                        state.showSettings -> {
                            SettingsScreen(
                                isDarkTheme = state.isDarkTheme,
                                onThemeToggle = { viewModel.toggleTheme() },
                                onDismiss = { viewModel.toggleSettings() },
                                onResetData = { viewModel.toggleSettings() }
                            )
                        }
                        // Add/Edit screen (full screen)
                        showAddEdit -> {
                            AddEditPlaceScreen(
                                place = editingPlace,
                                onSave = { place ->
                                    viewModel.updatePlace(place)
                                    showAddEdit = false
                                    editingPlace = null
                                },
                                onDismiss = {
                                    showAddEdit = false
                                    editingPlace = null
                                }
                            )
                        }
                        // Search overlay (full screen)
                        state.isSearchOpen -> {
                            SearchOverlay(
                                query = state.searchQuery,
                                results = viewModel.searchResults(),
                                allPlaces = state.places,
                                onQueryChange = { viewModel.updateSearchQuery(it) },
                                onPlaceClick = { place ->
                                    viewModel.selectPlace(place)
                                    viewModel.closeSearch()
                                },
                                onDismiss = { viewModel.closeSearch() }
                            )
                        }
                        // Main map with overlays
                        else -> {
                            MapScreen(
                                onPlaceClick = { viewModel.selectPlace(it) },
                                onSearchClick = { viewModel.openSearch() },
                                onSettingsClick = { viewModel.toggleSettings() },
                                viewModel = viewModel
                            )

                            // Place detail bottom sheet
                            if (state.showDetailSheet && state.selectedPlace != null) {
                                PlaceDetailSheet(
                                    place = state.selectedPlace!!,
                                    origin = viewModel.getOrigin(),
                                    isHome = state.selectedPlace?.id == state.homeId,
                                    isDarkTheme = state.isDarkTheme,
                                    onDismiss = { viewModel.selectPlace(null) },
                                    onNavigate = { place ->
                                        viewModel.navigateTo(place)
                                        viewModel.selectPlace(null)
                                    },
                                    onToggleHome = { place ->
                                        viewModel.setHome(if (state.homeId == place.id) null else place)
                                    },
                                    onEdit = { place ->
                                        editingPlace = place
                                        showAddEdit = true
                                        viewModel.selectPlace(null)
                                    },
                                    onDelete = { id ->
                                        viewModel.deletePlace(id)
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    private fun requestLocationPermission() {
        val permissions = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }
        if (permissions.isNotEmpty()) {
            permissionLauncher.launch(permissions.toTypedArray())
        } else {
            locationService.startTracking()
        }
    }
}
