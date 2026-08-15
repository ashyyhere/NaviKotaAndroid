package com.navikota.util

import kotlin.math.*

object GeoUtils {

    data class Fares(val auto: Int, val rapido: Int, val uber: Int)

    fun haversine(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
        val r = 6371.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLng = Math.toRadians(lng2 - lng1)
        val a = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLng / 2).pow(2)
        return 2 * r * asin(sqrt(a))
    }

    fun formatDistance(km: Double): String {
        return if (km < 1.0) {
            "${(km * 1000).toInt()} m"
        } else {
            String.format("%.1f km", km)
        }
    }

    fun fares(km: Double): Fares {
        val d = max(km, 0.5)
        return Fares(
            auto = max(25, round(d * 12).toInt()),
            rapido = max(18, round(15 + d * 8).toInt()),
            uber = max(40, round(30 + d * 12).toInt())
        )
    }
}
