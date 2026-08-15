package com.navikota.ui.place

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.navikota.data.model.Categories
import com.navikota.data.model.CatKey
import com.navikota.data.model.Place

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditPlaceScreen(
    place: Place?,
    onSave: (Place) -> Unit,
    onDismiss: () -> Unit
) {
    val isEdit = place != null
    var name by remember { mutableStateOf(place?.name ?: "") }
    var cat by remember { mutableStateOf(place?.cat ?: CatKey.SHOP) }
    var notes by remember { mutableStateOf(place?.notes ?: "") }
    var hours by remember { mutableStateOf(place?.hours ?: "") }
    var open by remember { mutableStateOf(place?.open ?: true) }
    var price by remember { mutableStateOf(place?.price ?: 0) }
    var img by remember { mutableStateOf(place?.img ?: "") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isEdit) "Edit Place" else "Add Place") },
                navigationIcon = {
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            if (place != null) {
                                onSave(place.copy(
                                    name = name,
                                    cat = cat,
                                    notes = notes,
                                    hours = hours,
                                    open = open,
                                    price = price,
                                    img = img
                                ))
                            }
                        },
                        enabled = name.isNotBlank()
                    ) {
                        Text("Save")
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
            // Name
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Category dropdown
            var catExpanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = catExpanded,
                onExpandedChange = { catExpanded = it }
            ) {
                OutlinedTextField(
                    value = Categories.map[cat]?.label ?: "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Category") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(catExpanded) },
                    modifier = Modifier.fillMaxWidth().menuAnchor()
                )
                ExposedDropdownMenu(
                    expanded = catExpanded,
                    onDismissRequest = { catExpanded = false }
                ) {
                    CatKey.entries.forEach { key ->
                        DropdownMenuItem(
                            text = { Text(Categories.map[key]?.label ?: key.value) },
                            onClick = {
                                cat = key
                                catExpanded = false
                            }
                        )
                    }
                }
            }

            // Hours
            OutlinedTextField(
                value = hours,
                onValueChange = { hours = it },
                label = { Text("Hours (e.g. 8:00 AM - 8:00 PM)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Open/Closed
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = open,
                    onClick = { open = true },
                    label = { Text("Open") }
                )
                FilterChip(
                    selected = !open,
                    onClick = { open = false },
                    label = { Text("Closed") }
                )
            }

            // Price
            var priceExpanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = priceExpanded,
                onExpandedChange = { priceExpanded = it }
            ) {
                OutlinedTextField(
                    value = Categories.priceLabels[price],
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Price") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(priceExpanded) },
                    modifier = Modifier.fillMaxWidth().menuAnchor()
                )
                ExposedDropdownMenu(
                    expanded = priceExpanded,
                    onDismissRequest = { priceExpanded = false }
                ) {
                    Categories.priceLabels.forEachIndexed { index, label ->
                        DropdownMenuItem(
                            text = { Text(label) },
                            onClick = {
                                price = index
                                priceExpanded = false
                            }
                        )
                    }
                }
            }

            // Notes
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Notes") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                maxLines = 6
            )

            // Image URL
            OutlinedTextField(
                value = img,
                onValueChange = { img = it },
                label = { Text("Image URL") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
        }
    }
}
