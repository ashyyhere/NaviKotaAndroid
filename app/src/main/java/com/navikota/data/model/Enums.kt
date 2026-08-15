package com.navikota.data.model

enum class CatKey(val value: String) {
    COACHING("coaching"),
    RESTAURANT("restaurant"),
    SALON("salon"),
    SHOP("shop"),
    TESTCENTRE("testcentre"),
    MEDICAL("medical"),
    STAY("stay"),
    AREA("area");

    companion object {
        fun fromString(s: String): CatKey = entries.find { it.value == s } ?: COACHING
    }
}

data class CategoryMeta(
    val label: String,
    val color: Long,
    val letter: String
)

object Categories {
    val map = mapOf(
        CatKey.COACHING to CategoryMeta("Coaching", 0xFFC5A3E8, "C"),
        CatKey.RESTAURANT to CategoryMeta("Restaurant", 0xFFE6977F, "R"),
        CatKey.SALON to CategoryMeta("Salon", 0xFF93D4BD, "H"),
        CatKey.SHOP to CategoryMeta("Shop", 0xFF8FB3E0, "S"),
        CatKey.TESTCENTRE to CategoryMeta("CBT Centre", 0xFFD9A7CD, "T"),
        CatKey.MEDICAL to CategoryMeta("Medical", 0xFFE07B8A, "M"),
        CatKey.STAY to CategoryMeta("Hostel & Mess", 0xFFAAB0E8, "B"),
        CatKey.AREA to CategoryMeta("Area / Landmark", 0xFF8B93A1, "A")
    )

    val priceLabels = listOf("Free", "\u20B9", "\u20B9\u20B9", "\u20B9\u20B9\u20B9", "\u20B9\u20B9\u20B9\u20B9")
}
