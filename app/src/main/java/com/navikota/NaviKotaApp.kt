package com.navikota

import android.app.Application
import org.osmdroid.config.Configuration

class NaviKotaApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Configuration.getInstance().apply {
            userAgentValue = packageName
            isMapViewHardwareAccelerated = true
            isDebugMode = false
        }
    }
}
