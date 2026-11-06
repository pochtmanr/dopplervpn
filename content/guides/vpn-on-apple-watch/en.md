> **The short version.** Doppler on Apple Watch is a remote for the VPN on your iPhone. From your wrist you can connect and disconnect, switch servers, see your traffic, run a speed test and check your plan. The tunnel, the settings and the account all stay on the iPhone.

## What the watch app is, and what it is not

The watch app does not run a VPN of its own. It sends a short command to the Doppler app on your paired iPhone, the iPhone does the work, and it answers with its current state. That keeps the watch light and means there is only ever one tunnel to look after: the one on your phone.

It also means the watch needs the iPhone nearby, with Bluetooth on. When the phone is out of reach, the watch shows the last state it heard and says when it heard it.

```shots
/images/apple/watch-servers-422.avif | Servers | Doppler server list on Apple Watch
/images/apple/watch-devices-422.avif | Devices | Devices on the account, on Apple Watch
/images/apple/watch-profile-422.avif | Profile | Doppler Pro profile on Apple Watch
```

## Install it

The watch app needs **watchOS 26** and the Doppler app on your iPhone.

1. Make sure Doppler is installed and signed in on your iPhone.
2. On the iPhone, open the **Watch** app and find Doppler under available apps, or install it from the App Store on the watch.
3. Open Doppler on the watch. A short setup shows you around and ends with "You're all set".

The setup also suggests adding Doppler to a watch face: touch and hold the face, tap Edit, and choose Doppler for a complication. The complication shows whether the VPN is on at a glance, and a tap opens the app.

## What you can do from your wrist

- **Connect and disconnect.** Connect brings back the last server you used on the iPhone. Connecting from the watch needs Doppler Pro. On a free plan the watch says so and nothing dials.
- **Choose a server.** Pick from the same list as the phone. If iOS has closed the Doppler app in the background, the iPhone shows a "Finish switching" notification instead, and one tap there completes the switch.
- **Watch your traffic.** While connected, the watch shows live download and upload figures read from the tunnel itself.
- **Run a speed test.** It runs on the iPhone and takes about 20 seconds, with the result streamed to the watch. If the VPN is off, the test measures your iPhone's own connection and says so.
- **Check your devices and plan.** The Devices screen lists everything signed in to your account. Profile shows your plan, the date it is paid through and the last four characters of your account ID. The full ID never appears on the watch, because it is what signs you in.

## When the VPN drops

If the tunnel on your iPhone fails, for example when the phone loses signal, Doppler posts a "VPN disconnected" notice. With the iPhone locked and the watch on your wrist, iOS shows it on the watch. It only appears for a failure, never for your own Disconnect, and only if Doppler is allowed to send notifications.

## What stays on the iPhone

Removing a device, changing the Connection method, Smart Route and every other setting stay on the iPhone. That is deliberate: a small screen is a fine place for one tap, and a poor place to edit routing rules.

If you want the watch to stop following the phone, the watch app has a **Disconnect from iPhone** option. It changes nothing on your account or your tunnel, and pressing anything in the watch app later links it again.
