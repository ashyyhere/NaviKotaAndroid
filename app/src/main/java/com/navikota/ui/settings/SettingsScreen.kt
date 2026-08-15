package com.navikota.ui.settings

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.navikota.data.model.CatKey
import com.navikota.data.model.Place
import com.navikota.data.repository.PlaceRepository

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    isDarkTheme: Boolean,
    onThemeToggle: () -> Unit,
    onDismiss: () -> Unit,
    onResetData: () -> Unit
) {
    val context = LocalContext.current
    val repo = remember { PlaceRepository(context) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Theme toggle
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = onThemeToggle
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Dark Theme", fontWeight = FontWeight.Medium)
                    Switch(checked = isDarkTheme, onCheckedChange = { onThemeToggle() })
                }
            }

            // Export
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = { /* TODO: export */ }
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(Icons.Default.FileDownload, null)
                    Text("Export Data", fontWeight = FontWeight.Medium)
                }
            }

            // Import
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = { /* TODO: import */ }
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(Icons.Default.FileUpload, null)
                    Text("Import Data", fontWeight = FontWeight.Medium)
                }
            }

            // Reset
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = onResetData
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(Icons.Default.Refresh, null, tint = MaterialTheme.colorScheme.error)
                    Text("Reset to Seed Data", fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.error)
                }
            }

            // About
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("NaviKota", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "A map-guide to Kota, the coaching city. Coachings, hostels, food, CBT centres & more.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        "Built by ashyy with \u2764",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
