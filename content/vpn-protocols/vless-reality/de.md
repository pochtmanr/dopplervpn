> **Kurz gesagt.** VLESS ist ein minimales Proxy-Protokoll aus dem Xray-Projekt. Reality ist die TLS-Schicht, die eine VLESS-Verbindung wie einen gewöhnlichen TLS-1.3-Besuch auf einer echten, beliebten Website aussehen lässt, ohne eigene Domain oder eigenes Zertifikat. Zusammen sind sie derzeit die für Zensoren am schwersten zu blockierende gängige Kombination. Diese Seite ist die Zusammenfassung; unser [ausführlicher Leitfaden](/how-it-works/vless-reality-tunnel) erzählt die ganze Geschichte.

## Was ist VLESS?

VLESS wurde im [Juli 2020 vorgeschlagen](https://github.com/v2ray/v2ray-core/issues/2636) als schlankerer Nachfolger von [VMess](/vpn-protocols/vmess). Die [Spezifikation](https://xtls.github.io/en/development/protocols/vless.html) ist bewusst klein: eine Protokollversion, eine 16 Byte lange UUID zur Identifizierung des Nutzers, ein optionales Feld für Erweiterungen sowie Befehl, Port und Adresse des Ziels. VLESS hat keine eigene Verschlüsselung. Es verlässt sich auf die darunterliegende TLS-Schicht, sodass der Datenverkehr nicht doppelt verschlüsselt wird.

VLESS ist Teil von [Xray-core](https://github.com/XTLS/Xray-core), dem Projekt, das sich im November 2020 von V2Ray abspaltete und heute die Entwicklung dieser Protokollfamilie anführt.

## Was fügt Reality hinzu?

Protokolle wie [Trojan](/vpn-protocols/trojan) verstecken sich in TLS zu Ihrer eigenen Domain, und diese Domain wird zu dem, was ein Zensor blockieren kann. [Reality](https://github.com/XTLS/REALITY), veröffentlicht in Xray-core [1.8.0 im März 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), beseitigt das.

Ein Reality-Server legt den TLS-Handshake einer echten Website eines Dritten vor. Für einen Beobachter ist die Verbindung ein normaler TLS-1.3-Besuch auf dieser Website. Ein Client, der den Schlüssel des Servers kennt, wird zum VLESS-Tunnel durchgelassen; alle anderen, auch eine aktive Sonde eines Zensors, werden an die echte Website weitergereicht und sehen deren echtes Zertifikat. Es gibt keine Doppler-Domain und kein Zertifikat, das auf eine Sperrliste gesetzt werden könnte.

## Wie schwer ist VLESS-Reality zu blockieren?

Es ist die widerstandsfähigste gängige Option, die wir kennen, aber nicht unsichtbar. 2024 veröffentlichte Forschung zeigte, dass sich [in TLS eingebettetes TLS per Fingerprinting erkennen lässt](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), anhand von Timing und Paketgrößen, und im November 2025 [berichteten](https://github.com/net4people/bbs/issues/546) Nutzer, dass einige russische Internetanbieter Reality-Verbindungen unterbrachen. Anbieter reagieren darauf, indem sie Servereinstellungen und die übernommenen Websites anpassen, und das Katz-und-Maus-Spiel geht weiter.

## Wie schnell ist es?

Im Alltag ist der Overhead gering. Der VLESS-Header wird einmal pro Verbindung gesendet, und der Flow XTLS Vision vermeidet es, bereits verschlüsselten Webverkehr ein zweites Mal zu verschlüsseln. Da es über TCP läuft, kann VLESS-Reality in verlustbehafteten Netzwerken langsamer sein als UDP-Protokolle wie [WireGuard](/vpn-protocols/wireguard), funktioniert aber weiter, wo diese blockiert sind.

## Wo erfahre ich mehr?

- [Der VLESS-Reality-Tunnel im Detail](/how-it-works/vless-reality-tunnel): Geschichte, Mechanismus, Grenzen.
- [Was ist VLESS?](/blog/what-is-vless) und [das VLESS-URI-Format](/blog/vless-uri-format) in unserem Blog.
- [VLESS VPN](/vless-vpn): wie Doppler VLESS-Reality in Apps verpackt, die sich mit einem Fingertipp bedienen lassen.
