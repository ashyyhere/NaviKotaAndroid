package com.navikota.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = DarkAccent,
    onPrimary = DarkOnAccent,
    primaryContainer = DarkBg2,
    onPrimaryContainer = DarkFg,
    secondary = DarkBg2,
    onSecondary = DarkFg,
    secondaryContainer = DarkBg1,
    onSecondaryContainer = DarkFg2,
    tertiary = DarkRoute,
    onTertiary = Color.White,
    background = DarkBg,
    onBackground = DarkFg,
    surface = DarkBg1,
    onSurface = DarkFg,
    surfaceVariant = DarkBg2,
    onSurfaceVariant = DarkFg2,
    outline = DarkLine,
    outlineVariant = DarkLine2,
    error = DarkDanger,
    onError = Color.White,
)

private val LightColorScheme = lightColorScheme(
    primary = LightAccent,
    onPrimary = LightOnAccent,
    primaryContainer = LightBg2,
    onPrimaryContainer = LightFg,
    secondary = LightBg2,
    onSecondary = LightFg,
    secondaryContainer = LightBg1,
    onSecondaryContainer = LightFg2,
    tertiary = LightRoute,
    onTertiary = Color.White,
    background = LightBg,
    onBackground = LightFg,
    surface = LightBg1,
    onSurface = LightFg,
    surfaceVariant = LightBg2,
    onSurfaceVariant = LightFg2,
    outline = LightLine,
    outlineVariant = LightLine2,
    error = LightDanger,
    onError = Color.White,
)

@Composable
fun NaviKotaTheme(
    isDark: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (isDark) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
