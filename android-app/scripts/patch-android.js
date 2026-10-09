// Run after "npx cap add android" / "npx cap sync android". Safe to run many times.
const fs = require('fs'), path = require('path');
const A = path.join(__dirname, '..', 'android', 'app', 'src', 'main');
if (!fs.existsSync(A)) throw new Error('android/ not found - run "npx cap add android" first');

// 1) manifest: microphone (Voice Notes), studytrack:// deep link (Google / Facebook sign-in returns to the app)
const mf = path.join(A, 'AndroidManifest.xml');
let m = fs.readFileSync(mf, 'utf8');
if (!m.includes('android.permission.RECORD_AUDIO'))
  m = m.replace('</manifest>', '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />\n</manifest>');
if (!m.includes('android:scheme="studytrack"'))
  m = m.replace('</activity>', '    <intent-filter>\n                <action android:name="android.intent.action.VIEW" />\n                <category android:name="android.intent.category.DEFAULT" />\n                <category android:name="android.intent.category.BROWSABLE" />\n                <data android:scheme="studytrack" />\n            </intent-filter>\n        </activity>');
fs.writeFileSync(mf, m);

// 2) MainActivity: let music / YouTube play without an extra tap
const dir = path.join(A, 'java', 'icu', 'edurx', 'studytrack');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'MainActivity.java'), `package icu.edurx.studytrack;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try { getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false); } catch (Exception e) {}
    }
}
`);
console.log('android project patched');
