package com.navikota.ui.map

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.navikota.data.model.*
import com.navikota.data.repository.PlaceRepository
import com.navikota.util.GeoUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.osmdroid.util.GeoPoint

data class MapUiState(
    val places: List<Place> = emptyList(),
    val filteredPlaces: List<Place> = emptyList(),
    val selectedPlace: Place? = null,
    val categoryVisibility: Map<CatKey, Boolean> = CatKey.entries.associateWith { true },
    val isDarkTheme: Boolean = true,
    val userPosition: GeoPoint? = null,
    val isTracking: Boolean = false,
    val following: Boolean = false,
    val destination: Place? = null,
    val homeId: String? = null,
    val isAddMode: Boolean = false,
    val isEditMode: Boolean = false,
    val markerSeq: Int = 1000,
    val searchQuery: String = "",
    val isSearchOpen: Boolean = false,
    val showDetailSheet: Boolean = false,
    val showSettings: Boolean = false,
    val showFilters: Boolean = false
)

class MapViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = PlaceRepository(application)
    private val _uiState = MutableStateFlow(MapUiState())
    val uiState: StateFlow<MapUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        val places = repo.loadPlaces()
        val homeId = repo.loadHomeId()
        val seq = repo.loadMarkerSeq()
        val theme = repo.loadTheme()
        val catVis = repo.loadCategoryVisibility()
        _uiState.value = MapUiState(
            places = places,
            filteredPlaces = applyFilters(places, catVis),
            homeId = homeId,
            markerSeq = seq,
            isDarkTheme = theme,
            categoryVisibility = catVis
        )
    }

    private fun applyFilters(places: List<Place>, catVis: Map<CatKey, Boolean>): List<Place> {
        return places.filter { catVis[it.cat] == true }
    }

    fun selectPlace(place: Place?) {
        _uiState.value = _uiState.value.copy(
            selectedPlace = place,
            showDetailSheet = place != null
        )
    }

    fun toggleCategory(catKey: CatKey) {
        val current = _uiState.value.categoryVisibility.toMutableMap()
        current[catKey] = !(current[catKey] ?: true)
        _uiState.value = _uiState.value.copy(
            categoryVisibility = current,
            filteredPlaces = applyFilters(_uiState.value.places, current)
        )
        repo.saveCategoryVisibility(current)
    }

    fun setAllCategories(visible: Boolean) {
        val current = CatKey.entries.associateWith { visible }
        _uiState.value = _uiState.value.copy(
            categoryVisibility = current,
            filteredPlaces = applyFilters(_uiState.value.places, current)
        )
        repo.saveCategoryVisibility(current)
    }

    fun updateUserPosition(pos: GeoPoint) {
        _uiState.value = _uiState.value.copy(userPosition = pos)
    }

    fun toggleTracking() {
        _uiState.value = _uiState.value.copy(
            isTracking = !_uiState.value.isTracking,
            following = !_uiState.value.isTracking
        )
    }

    fun toggleFollowing() {
        _uiState.value = _uiState.value.copy(following = !_uiState.value.following)
    }

    fun navigateTo(place: Place) {
        _uiState.value = _uiState.value.copy(destination = place)
        if (_uiState.value.userPosition == null) {
            toggleTracking()
        }
    }

    fun clearRoute() {
        _uiState.value = _uiState.value.copy(destination = null)
    }

    fun setHome(place: Place?) {
        val homeId = place?.id
        _uiState.value = _uiState.value.copy(homeId = homeId)
        repo.saveHomeId(homeId)
    }

    fun toggleAddMode() {
        _uiState.value = _uiState.value.copy(isAddMode = !_uiState.value.isAddMode)
    }

    fun toggleEditMode() {
        _uiState.value = _uiState.value.copy(isEditMode = !_uiState.value.isEditMode)
    }

    fun addPlace(lat: Double, lng: Double): Place {
        val seq = _uiState.value.markerSeq
        val place = Place(
            id = "m${seq}",
            cat = CatKey.SHOP,
            name = "New place",
            lat = lat,
            lng = lng
        )
        val places = _uiState.value.places.toMutableList()
        places.add(place)
        _uiState.value = _uiState.value.copy(
            places = places,
            filteredPlaces = applyFilters(places, _uiState.value.categoryVisibility),
            markerSeq = seq + 1,
            selectedPlace = place,
            showDetailSheet = true,
            isAddMode = false
        )
        repo.savePlaces(places)
        repo.saveMarkerSeq(seq + 1)
        return place
    }

    fun updatePlace(updated: Place) {
        val places = _uiState.value.places.map { if (it.id == updated.id) updated else it }
        _uiState.value = _uiState.value.copy(
            places = places,
            filteredPlaces = applyFilters(places, _uiState.value.categoryVisibility),
            selectedPlace = updated
        )
        repo.savePlaces(places)
    }

    fun deletePlace(id: String) {
        val places = _uiState.value.places.filter { it.id != id }
        _uiState.value = _uiState.value.copy(
            places = places,
            filteredPlaces = applyFilters(places, _uiState.value.categoryVisibility),
            selectedPlace = null,
            showDetailSheet = false,
            homeId = if (_uiState.value.homeId == id) null else _uiState.value.homeId,
            destination = if (_uiState.value.destination?.id == id) null else _uiState.value.destination
        )
        repo.savePlaces(places)
        if (_uiState.value.homeId == id) repo.saveHomeId(null)
    }

    fun toggleTheme() {
        val newTheme = !_uiState.value.isDarkTheme
        _uiState.value = _uiState.value.copy(isDarkTheme = newTheme)
        repo.saveTheme(newTheme)
    }

    fun openSearch() {
        _uiState.value = _uiState.value.copy(isSearchOpen = true, searchQuery = "")
    }

    fun closeSearch() {
        _uiState.value = _uiState.value.copy(isSearchOpen = false, searchQuery = "")
    }

    fun updateSearchQuery(query: String) {
        val all = _uiState.value.places
        val catVis = _uiState.value.categoryVisibility
        val filtered = if (query.isBlank()) {
            applyFilters(all, catVis)
        } else {
            val q = query.lowercase()
            all.filter { place ->
                catVis[place.cat] == true && (
                    place.name.lowercase().contains(q) ||
                    place.notes.lowercase().contains(q) ||
                    Categories.map[place.cat]?.label?.lowercase()?.contains(q) == true
                )
            }
        }
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            filteredPlaces = filtered
        )
    }

    fun searchResults(): List<Place> = _uiState.value.filteredPlaces

    fun toggleSettings() {
        _uiState.value = _uiState.value.copy(showSettings = !_uiState.value.showSettings)
    }

    fun toggleFilters() {
        _uiState.value = _uiState.value.copy(showFilters = !_uiState.value.showFilters)
    }

    fun getDistanceTo(place: Place): Double? {
        val pos = _uiState.value.userPosition ?: return null
        return GeoUtils.haversine(pos.latitude, pos.longitude, place.lat, place.lng)
    }

    fun getOrigin(): GeoPoint? {
        val user = _uiState.value.userPosition
        if (user != null) return user
        val homeId = _uiState.value.homeId ?: return null
        return _uiState.value.places.find { it.id == homeId }?.let { GeoPoint(it.lat, it.lng) }
    }
}