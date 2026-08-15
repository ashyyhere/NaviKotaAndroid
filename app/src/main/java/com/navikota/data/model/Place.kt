package com.navikota.data.model

data class Review(
    val name: String = "Anonymous",
    val stars: Int = 5,
    val text: String = "",
    val date: String = ""
)

data class Place(
    val id: String,
    val cat: CatKey,
    val name: String,
    val lat: Double,
    val lng: Double,
    val notes: String = "",
    val hours: String = "",
    val open: Boolean = true,
    val price: Int = 0,
    val rating: Double? = null,
    val ratingCount: Int = 0,
    val reviews: MutableList<Review> = mutableListOf(),
    val img: String = ""
)
