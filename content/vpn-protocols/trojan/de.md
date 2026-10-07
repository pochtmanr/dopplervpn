> **Kurz gesagt.** Trojan versteckt Proxy-Datenverkehr in einer echten TLS-Verbindung zu einer echten Website, die Sie kontrollieren. Wer sich ohne das Passwort verbindet, erhält einfach die Website. Es funktioniert gut, aber Sie brauchen eine eigene Domain und ein eigenes Zertifikat, und diese lassen sich finden und blockieren.

## Was ist Trojan?

Trojan ist ein Proxy-Protokoll aus dem [Projekt trojan-gfw](https://github.com/trojan-gfw/trojan), das im Oktober 2017 erstmals veröffentlicht wurde. Die Idee steckt im Namen: Statt eine Tarnung zu erfinden, versteckt es sich im häufigsten verschlüsselten Datenverkehr des Internets, in HTTPS.

## Wie funktioniert es?

Die [Protokollbeschreibung](https://trojan-gfw.github.io/trojan/protocol) ist kurz. Ein Trojan-Server lauscht wie ein normaler HTTPS-Server, mit einem echten Zertifikat für eine echte Domain. Der Client führt einen echten TLS-Handshake durch. Danach sendet er innerhalb der verschlüsselten Verbindung:

- den hexadezimal kodierten SHA-224-Hash des gemeinsamen Passworts, der 56 Zeichen lang ist,
- einen Zeilenumbruch,
- eine kleine Anfrage, wohin der Datenverkehr gehen soll, in einem SOCKS5-ähnlichen Format,
- einen weiteren Zeilenumbruch, gefolgt vom ersten Datenstück.

Sind Hash und Anfrage gültig, öffnet der Server einen Tunnel zum Ziel. Stimmt etwas nicht, behandelt der Server die Verbindung als „andere Protokolle“ und reicht sie an einen Fallback-Webserver weiter, sodass der Besucher eine gewöhnliche Website sieht.

## Wie schwer ist Trojan zu blockieren?

Von außen ist eine Trojan-Verbindung eine TLS-Sitzung zu Ihrer Domain, mit Ihrem Zertifikat. Aktive Sonden bekommen eine echte Website zurück. Dadurch lässt sich Trojan deutlich schwerer herausfiltern als Protokolle, die zufällig aussehen, etwa [Shadowsocks](/vpn-protocols/shadowsocks).

Der Schwachpunkt ist die Domain selbst. Jeder Server braucht eine Domain und ein Zertifikat, und ein Zensor, der erfährt, welche Domains zu Proxys gehören, kann sie per Namen oder per IP blockieren. Forscher haben außerdem gezeigt, dass in TLS eingebettetes TLS Muster bei Timing und Größe hinterlässt, die sich [per Fingerprinting erkennen](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) lassen, was Trojan und ähnliche Konstruktionen betrifft.

[VLESS-Reality](/vpn-protocols/vless-reality) beseitigt das Domain-Problem, indem es statt Ihrer eigenen den TLS-Handshake einer bestehenden, beliebten Website übernimmt.

## Wann sollte man Trojan verwenden?

- **Wenn Sie eine Domain kontrollieren** und eine einfache, gut verstandene Einrichtung wünschen, die wie HTTPS aussieht.
- **In mäßig gefilterten Netzwerken**, in denen Ihre Domain wahrscheinlich nicht ins Visier gerät.
- Unser Vergleich von [VLESS, VMess und Trojan](https://www.dopplervpn.org/en/blog/vless-vs-vmess-vs-trojan) hilft, wenn Sie zwischen ihnen wählen.

## Nutzt Doppler Trojan?

Nein. Doppler verwendet VLESS-Reality, das keine eigene Domain benötigt. Siehe [Warum VLESS](/vpn-protocols/why-vless).
