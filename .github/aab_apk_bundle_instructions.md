# Cash Stage: AAB & APK Bundle Preparation Guide

To launch **Cash Stage by Miss Bama Slammer** on the Google Play Store, you need to package your app into an **Android App Bundle (.aab)**. This is the modern standard for Android distribution.

## 1. Prerequisites
- **Android Studio**: Ensure you have the latest version installed.
- **Signing Key**: You need a persistent keystore file (`.jks`) to sign your production builds. **Never lose this file**, or you won't be able to update your app.

## 2. Generating the Signed AAB (Step-by-Step)
1. **Open your project** in Android Studio.
2. Go to **Build > Generate Signed Bundle / APK...**
3. Select **Android App Bundle** and click Next.
4. **Keystore Setup**:
   - If you have a key, select it.
   - If not, click **Create new...** to generate a new signing key.
5. **Build Variant**: Select `release`.
6. **Destination**: Choose where to save the `.aab` file.
7. Click **Finish**. Android Studio will compile and sign your bundle.

## 3. Why AAB instead of APK?
- **Optimized Size**: Google Play uses the AAB to generate specific APKs tailored to each user's device (screen size, CPU architecture), making the download up to 20% smaller.
- **Required for Play Store**: As of August 2021, all new apps must be submitted as App Bundles.

## 4. Local Testing (APK)
If you just want to test the app on your own phone before uploading to Google:
1. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Locate the `.apk` file in your `build/outputs/apk/debug/` folder.
3. Transfer it to your phone and install it manually.

## 5. Final Checklist before Upload
- **Version Code**: Increment the `versionCode` in your `build.gradle` for every new release.
- **Package Name**: Ensure `com.cash.missalabamaslammer.cashstage` is consistent.
- **ProGuard/R8**: Ensure code shrinking is enabled to protect your source code and reduce size.
