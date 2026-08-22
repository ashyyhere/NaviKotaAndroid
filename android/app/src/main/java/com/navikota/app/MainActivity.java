package com.navikota.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 1. Create a native WebView instance
        WebView webView = new WebView(this);
        WebSettings webSettings = webView.getSettings();
        
        // 2. Enable JavaScript, DOM storage, and database for the map
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        
        // 3. Prevent links from opening in external default browser
        webView.setWebViewClient(new WebViewClient());
        
        // 4. Handle Geolocation prompts inside the WebView
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                // Auto-approve location prompt in WebView if app has permission
                callback.invoke(origin, true, false);
            }
        });
        
        // 5. Request Android system location permission if not already granted
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION, 
                Manifest.permission.ACCESS_COARSE_LOCATION
            }, 1);
        }
        
        // 6. Load the website directly
        webView.loadUrl("https://navikota.pages.dev");
        
        // 7. Render this WebView full screen
        setContentView(webView);
    }
}
