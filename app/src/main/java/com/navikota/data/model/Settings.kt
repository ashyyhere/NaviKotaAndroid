package com.navikota.data.model

data class AppSettings(
    val isDarkTheme: Boolean = true,
    val homeId: String? = null,
    val markerSeq: Int = 1000,
    val categoryVisible: Map<CatKey, Boolean> = CatKey.entries.associateWith { true }
)
