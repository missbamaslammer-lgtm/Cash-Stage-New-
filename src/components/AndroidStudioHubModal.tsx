import React, { useState } from 'react';
import { Smartphone, Code, Copy, Check, Download, Layers, ShieldCheck, Play, Terminal, ExternalLink } from 'lucide-react';

interface AndroidStudioHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidStudioHubModal: React.FC<AndroidStudioHubModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<'manifest' | 'gradle' | 'mainActivity' | 'bundleGuide'>('manifest');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const ANDROID_MANIFEST_CODE = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cash.missalabamaslammer.cashstage">

    <!-- Permissions required for Recording Studio, Audio FX & Live Streaming -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

    <!-- Audio Hardware Features -->
    <uses-feature android:name="android.hardware.microphone" android:required="true" />
    <uses-feature android:name="android.hardware.audio.low_latency" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CashStage"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep linking for Cash Stage tournament & battle invites -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="cashstage.app" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const BUILD_GRADLE_CODE = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.cash.missalabamaslammer.cashstage"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.cash.missalabamaslammer.cashstage"
        minSdk = 26
        targetSdk = 35
        versionCode = 104
        versionName = "3.4.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        ndk {
            abiFilters.addAll(listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64"))
        }
    }

    signingConfigs {
        create("release") {
            storeFile = file("cashstage-release-key.jks")
            storePassword = System.getenv("CASHSTAGE_KEYSTORE_PASSWORD") ?: "CashStage2026Secure!"
            keyAlias = "cashstage_key"
            keyPassword = System.getenv("CASHSTAGE_KEY_PASSWORD") ?: "CashStage2026Secure!"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    // Android App Bundle (AAB) split configuration for optimal size on Google Play
    bundle {
        language { enableSplit = true }
        density { enableSplit = true }
        abi { enableSplit = true }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.media3:media3-exoplayer:1.5.1")
}`;

  const MAIN_ACTIVITY_CODE = `package com.cash.missalabamaslammer.cashstage

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var pendingPermissionRequest: PermissionRequest? = null

    // Request microphone permission for DAW & Vocal recording
    private val requestAudioPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            pendingPermissionRequest?.grant(pendingPermissionRequest?.resources)
        } else {
            pendingPermissionRequest?.deny()
        }
        pendingPermissionRequest = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.cashStageWebView)
        setupWebView()

        // Load Cash Stage production cloud build
        webView.loadUrl("https://cashstage.app")
    }

    private fun setupWebView() {
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.allowFileAccess = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.let {
                    if (it.resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
                        if (ContextCompat.checkSelfPermission(
                                this@MainActivity,
                                Manifest.permission.RECORD_AUDIO
                            ) == PackageManager.PERMISSION_GRANTED
                        ) {
                            it.grant(it.resources)
                        } else {
                            pendingPermissionRequest = it
                            requestAudioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                        }
                    } else {
                        it.grant(it.resources)
                    }
                }
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`;

  const BUNDLE_BUILD_GUIDE = `# Cash Stage AAB (Android App Bundle) Build & Release Guide
# Package: com.cash.missalabamaslammer.cashstage
# Author: Alabama Slammer

# 1. Generate Signed Release AAB in Android Studio:
./gradlew bundleRelease

# Output bundle located at:
# app/build/outputs/bundle/release/app-release.aab

# 2. Test AAB on local device using bundletool:
bundletool build-apks --bundle=app/build/outputs/bundle/release/app-release.aab \\
  --output=cashstage.apks \\
  --ks=cashstage-release-key.jks \\
  --ks-pass=pass:CashStage2026Secure!

# Install to connected phone:
bundletool install-apks --apks=cashstage.apks

# 3. Google Play Console Upload Checklist:
- Target SDK: 35 (Android 15 ready)
- 64-bit Native Architectures enabled
- Microphone disclosure included in App Content > Permissions
- Direct Play Store Listing:
  https://play.google.com/store/apps/details?id=com.cash.missalabamaslammer.cashstage`;

  const getActiveCode = () => {
    switch (activeFile) {
      case 'manifest':
        return ANDROID_MANIFEST_CODE;
      case 'gradle':
        return BUILD_GRADLE_CODE;
      case 'mainActivity':
        return MAIN_ACTIVITY_CODE;
      case 'bundleGuide':
        return BUNDLE_BUILD_GUIDE;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-emerald-500/40 rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-5 text-white max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Android Studio & AAB Build Hub</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Play Store Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Package: com.cash.missalabamaslammer.cashstage (v3.4.0 Build 104)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://play.google.com/store/apps/details?id=com.cash.missalabamaslammer.cashstage"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold transition"
            >
              <span>Play Store Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Build Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0 text-xs">
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Target SDK</div>
            <div className="font-mono font-bold text-emerald-400 mt-0.5">Android 15 (API 35)</div>
          </div>
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Package Bundle</div>
            <div className="font-mono font-bold text-amber-400 mt-0.5">Release .AAB Bundle</div>
          </div>
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Audio Engine Bridge</div>
            <div className="font-mono font-bold text-zinc-200 mt-0.5">Low-Latency Mic API</div>
          </div>
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Signing Status</div>
            <div className="font-mono font-bold text-emerald-400 mt-0.5">V1/V2/V3 Signed</div>
          </div>
        </div>

        {/* File Tabs Switcher */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 flex-shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'manifest', label: 'AndroidManifest.xml' },
            { id: 'gradle', label: 'build.gradle.kts (:app)' },
            { id: 'mainActivity', label: 'MainActivity.kt' },
            { id: 'bundleGuide', label: 'AAB Build Commands' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFile(tab.id as typeof activeFile)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer whitespace-nowrap ${
                activeFile === tab.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Display Area */}
        <div className="relative flex-1 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>{activeFile}.{activeFile === 'manifest' ? 'xml' : activeFile === 'mainActivity' ? 'kt' : 'txt'}</span>
            </div>
            <button
              onClick={() => handleCopy(getActiveCode(), activeFile)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-sans font-bold transition cursor-pointer"
            >
              {copiedKey === activeFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-950 select-all">
            <code>{getActiveCode()}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
