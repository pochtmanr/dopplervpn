> **Kurz gesagt.** VMess ist das ursprüngliche Protokoll des V2Ray-Projekts. Es verschlüsselt seine eigenen Header und wird meist in einen anderen Transport eingepackt, etwa WebSocket über TLS, damit es wie Webverkehr aussieht. Es funktioniert noch, aber seine Nachfolger VLESS und Trojan erledigen dieselbe Aufgabe mit weniger Overhead.

## Was ist VMess?

VMess ist das verschlüsselte Proxy-Protokoll, das das [V2Ray-Projekt](https://github.com/v2fly/v2ray-core) bei seinem Start 2015 einführte. V2Ray wuchs zu einer modularen Plattform für den Bau von Proxys heran: ein Kern, viele Protokolle und Transporte sowie eine Routing-Engine, die entscheidet, welcher Datenverkehr wohin geht. VMess war das erste Protokoll und mehrere Jahre lang das wichtigste.

Wie Shadowsocks ist VMess technisch ein Proxy und kein VPN, aber auf V2Ray basierende Apps können Ihr gesamtes Gerät darüber leiten.

## Wie funktioniert es?

Jeder Nutzer hat eine UUID, die als Zugangsdaten dient. Laut der [Protokolldokumentation](https://www.v2fly.org/en_US/developer/protocols/vmess.html) enthält der Request-Header des Clients eine verschlüsselte Authentifizierungs-ID, die aus einem Unix-Zeitstempel, einer Zufallszahl und einer Prüfsumme gebildet und mit einem aus der Nutzer-ID abgeleiteten Schlüssel verschlüsselt wird. Der Server erkennt damit den Nutzer und entschlüsselt anschließend den Rest des Headers und die Daten.

Die Dokumentation beschreibt zwei Arten, den Header zu schützen. Die moderne nutzt AEAD-Verschlüsselung, die sicherstellt, dass der Header nicht verändert wurde. Die ältere verwendete MD5 und AES-128-CFB und konnte die Integrität des Headers nicht garantieren; die Dokumentation rät davon ab. Weil die Authentifizierungs-ID einen Zeitstempel enthält, müssen die Uhren von Client und Server ungefähr übereinstimmen, eine häufige Ursache für das Problem „es verbindet sich einfach nicht“.

## Wie schwer ist VMess zu blockieren?

Für sich genommen sieht VMess wie zufällige Bytes aus und befindet sich damit in derselben Lage wie [Shadowsocks](/vpn-protocols/shadowsocks): Es ist Firewalls ausgesetzt, die vollständig verschlüsselten Datenverkehr blockieren. Deshalb wird VMess meist in WebSocket oder gRPC über TLS betrieben, hinter einer Domain und einem Zertifikat, sodass ein Beobachter eine scheinbar normale HTTPS-Verbindung zu einer Website sieht.

Dieser Wrapper übernimmt den Großteil der Tarnung des Datenverkehrs, und er hat seinen Preis: Man braucht eine Domain, ein Zertifikat und oft ein CDN vor dem Server, und der Server verschlüsselt die Daten nun doppelt, einmal für TLS und einmal für VMess.

## VMess, VLESS oder Trojan?

[VLESS](/vpn-protocols/vless-reality) wurde vom Xray-Projekt als schlankerer Nachfolger entworfen: Es behält die UUID-basierte Identität bei, verzichtet aber auf die eigene Verschlüsselung von VMess und verlässt sich vollständig auf die TLS-Schicht, wodurch doppelte Verschlüsselung entfällt. [Trojan](/vpn-protocols/trojan) geht ähnlich vor, mit einem Passwort statt einer UUID. Unser Vergleich von [VLESS, VMess und Trojan](https://www.dopplervpn.org/en/blog/vless-vs-vmess-vs-trojan) geht auf die Details ein.

## Nutzt Doppler VMess?

Nein. Doppler verwendet VLESS mit Reality. Die Anleitung [Warum VLESS](/vpn-protocols/why-vless) erklärt, warum.
