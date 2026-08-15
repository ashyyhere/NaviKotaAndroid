package com.navikota.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.navikota.util.GeoUtils

@Composable
fun RouteBadge(
    destinationName: String,
    distanceKm: Double,
    modifier: Modifier = Modifier
) {
    val dist = GeoUtils.formatDistance(distanceKm)
    val fares = GeoUtils.fares(distanceKm)
    val walkingMin = (distanceKm / 4.8 * 60).toInt()
    val autoMin = (distanceKm / 30.0 * 60).toInt()

    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = destinationName,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            text = "$dist \u00B7 Walk ${walkingMin}min \u00B7 Auto ${autoMin}min",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = "Auto \u20B9${fares.auto} \u00B7 Rapido \u20B9${fares.rapido} \u00B7 Uber \u20B9${fares.uber}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
