> **The short version.** Install Doppler from the App Store, open it, and tap Connect. There is no sign-up form: the app makes an anonymous account ID for you. Everything else in this guide is optional, and most people never need it.

## Install and connect

Doppler is one App Store app for iPhone, iPad and Mac. On iPhone and iPad it needs iOS or iPadOS 18 or later. On a Mac it needs macOS 15 Sequoia or later.

1. Get **Doppler VPN** from the App Store on your device.
2. Open it. Doppler creates an account ID on the spot. You are not asked for an email, a phone number or a password.
3. Tap **Connect**. The first time, iOS or macOS asks whether Doppler may add a VPN configuration. Allow it. That prompt comes from Apple, and you only see it once.

Those who remember setting up a dial-up connection by typing a phone number, a username and a modem init string into a dialog box will find this short. That is on purpose. The settings that used to be your job are now the app's.

```shots
/images/apple/iphone-connect-1000.avif | Home | Doppler home screen on iPhone, connected to Hong Kong
/images/apple/iphone-search-1000.avif | Servers | Server list on iPhone with the ping for each location
/images/apple/iphone-unblock-1000.avif | Connection method | Connection method screen on iPhone
```

## The home screen

When the shield turns teal and says **Connected**, every app on the device sends its traffic through the tunnel. Under the shield you see the server you are on and its ping. Below that, live download and upload speed, and a small map of where your traffic leaves.

Tap the server row to change server. The list shows a ping for each location, measured before you connect, so you can pick the closest one or the one that answers fastest.

On a Mac the same screens sit in a sidebar: VPN, Servers, Speed Test, Connection and Smart Route at the top, then your Profile, Subscription and Devices, then App Settings and Help.

![Doppler on a MacBook Pro, connected, with the speed test and the route map under the shield](/images/apple/mac-front-1800.avif "The VPN screen on Mac: the shield, the server, then speed and route.")

```shots
/images/apple/mac-path-1920.avif | Connection | Connection screen on Mac with the route on a map
/images/apple/mac-split-1920.avif | Smart Route | Smart Route screen on Mac
```

## Check what websites see

The **Connection** screen answers the question every VPN user asks sooner or later: is it actually working? It shows the IP address websites see right now, the network that address belongs to, whether your DNS lookups go through the tunnel, how long a lookup takes, and your route drawn on a map.

If the address shown is your own and not the server's, the tunnel is not carrying your traffic. Disconnect, connect again, and if it persists, the Connection log under Help and Support keeps the last attempts for our support team.

## Keep local sites local with Smart Route

Banks, tax offices and streaming services at home often refuse foreign addresses. **Smart Route** sends your own country's sites straight out and keeps everything else in the tunnel. Pick your country or let Doppler detect it, then choose what goes direct: a domain zone such as `.jp`, sites hosted in that country, or domains you add yourself.

Anything that goes direct is not protected by the VPN. That is the trade, and it is why Smart Route is off until you switch it on.

## If a network blocks the connection

Some networks block VPNs by reading the name of the site a connection says it is visiting. Doppler's answer is the **Connection method** screen, opened from the top of the server list or from App Settings. Leave it on **Automatic** and the app tries the three most likely disguise sites at once and keeps the fastest. The [guide to SNI](/guides/what-is-sni) explains what is going on underneath.

## Settings worth knowing

In **App Settings**:

- **Connect on Launch** connects as soon as you open the app.
- **Kill Switch** reconnects automatically if the VPN drops, instead of letting traffic leave unprotected.
- **Language** switches the app's language without touching the rest of your device.
- **Appearance** sets the text size, the surface style and one of six accent colours.

On iPhone there is also a home screen widget with a Connect button, and an [Apple Watch app](/guides/vpn-on-apple-watch) that works as a remote.

## When something goes wrong

Doppler shows one plain message when a connection fails, never a wall of error codes. If the message does not help, open **Help and Support** in the app for the ways to reach us. The **Connection log** there keeps your last 50 attempts and lets you copy the technical details to send along. It never shows them on screen, so a screenshot of it gives nothing away.
