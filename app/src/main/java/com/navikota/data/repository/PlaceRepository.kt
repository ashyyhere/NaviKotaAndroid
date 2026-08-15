package com.navikota.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.navikota.data.model.*
import com.navikota.data.seed.SeedData

class PlaceRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("navikota", Context.MODE_PRIVATE)
    private val gson = Gson()

    fun loadPlaces(): MutableList<Place> {
        val json = prefs.getString("places", null)
        if (json != null) {
            val type = object : TypeToken<MutableList<Place>>() {}.type
            val saved: MutableList<Place> = gson.fromJson(json, type)
            val savedIds = saved.map { it.id }.toSet()
            SeedData.places.forEach { seed ->
                if (seed.id !in savedIds) saved.add(seed)
            }
            return saved
        }
        return SeedData.places.toMutableList()
    }

    fun savePlaces(places: List<Place>) {
        prefs.edit().putString("places", gson.toJson(places)).apply()
    }

    fun loadHomeId(): String? = prefs.getString("homeId", null)

    fun saveHomeId(id: String?) {
        prefs.edit().putString("homeId", id).apply()
    }

    fun loadMarkerSeq(): Int = prefs.getInt("markerSeq", 1000)

    fun saveMarkerSeq(seq: Int) {
        prefs.edit().putInt("markerSeq", seq).apply()
    }

    fun loadTheme(): Boolean = prefs.getBoolean("isDark", true)

    fun saveTheme(isDark: Boolean) {
        prefs.edit().putBoolean("isDark", isDark).apply()
    }

    fun loadCategoryVisibility(): Map<CatKey, Boolean> {
        val json = prefs.getString("catVis", null) ?: return CatKey.entries.associateWith { true }
        val type = object : TypeToken<Map<String, Boolean>>() {}.type
        val raw: Map<String, Boolean> = gson.fromJson(json, type)
        return CatKey.entries.associateWith { cat -> raw[cat.value] ?: true }
    }

    fun saveCategoryVisibility(map: Map<CatKey, Boolean>) {
        val raw = map.mapKeys { it.key.value }
        prefs.edit().putString("catVis", gson.toJson(raw)).apply()
    }

    fun resetToSeed() {
        prefs.edit().clear().apply()
    }
}
