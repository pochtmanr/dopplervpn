> **Kurz gesagt.** Wir haben Doppler für Menschen in Netzwerken gebaut, die VPNs blockieren. In diesen Netzwerken lautet die Frage nicht, welches Protokoll auf dem Papier am schnellsten ist, sondern welches morgen noch verbunden ist. Wir haben uns für VLESS mit Reality entschieden, weil es einem Zensor am wenigsten zum Erkennen und am wenigsten zum Blockieren bietet, und wir nehmen die damit verbundenen Kompromisse in Kauf.

## Wonach haben wir entschieden?

Doppler ist für Menschen gebaut, die sich von Orten aus verbinden, an denen VPNs gezielt gefiltert werden: Russland, Iran, China, Teile der Golfregion. In diesen Netzwerken ist die Verschlüsselung der einfache Teil. Jedes Protokoll in unserem [Vergleich](/vpn-protocols) verschlüsselt gut. Der Unterschied liegt darin, ob ein Filtersystem erkennen kann, dass die Verbindung ein VPN ist, und was es blockieren kann, sobald es das tut.

Deshalb haben wir jede Option anhand von drei Fragen beurteilt:

1. **Hat es einen festen Fingerabdruck?** Ein Handshake fester Größe oder ein Standardport lässt sich mit einer einzigen Regel erfassen.
2. **Was passiert, wenn ein Zensor den Server sondiert?** Firewalls verbinden sich aktiv mit verdächtigen Proxys, um zu sehen, wie sie antworten.
3. **Gibt es etwas, das sich auf eine Sperrliste setzen lässt?** Eine Domain, ein Zertifikat oder ein erkennbarer Server ist ein Angriffsziel, selbst wenn der Datenverkehr selbst gut verborgen ist.

## Warum nicht WireGuard, OpenVPN oder IKEv2?

Alle drei scheitern an der ersten Frage. Die Handshake-Pakete von [WireGuard](/vpn-protocols/wireguard) sind immer 148 und 92 Byte groß. [OpenVPN](/vpn-protocols/openvpn) wurde von Forschern innerhalb eines echten Internetanbieters in über 85 % der Flows identifiziert. [IKEv2](/vpn-protocols/ikev2) läuft auf standardmäßigen UDP-Ports, die sich pauschal verwerfen lassen. Im August 2023 [berichteten](https://github.com/net4people/bbs/issues/274) Nutzer in Russland, dass Anbieter WireGuard und OpenVPN innerhalb der ersten Pakete unterbrachen. Das sind gute Protokolle für offene Netzwerke. Für unsere wurden sie nicht entworfen.

## Warum nicht Shadowsocks oder VMess?

Sie bestehen die erste Frage, indem sie wie zufällige Bytes aussehen, und das erwies sich als eigener Fingerabdruck. Seit November 2021 [blockiert die Große Firewall vollständig verschlüsselten Datenverkehr](https://gfw.report/publications/usenixsecurity23/en/), der keinem bekannten Protokoll ähnelt. [VMess](/vpn-protocols/vmess) lässt sich in TLS einpacken, um das zu vermeiden, braucht dann aber eine Domain, womit wir bei der dritten Frage sind.

## Warum nicht Trojan?

[Trojan](/vpn-protocols/trojan) beantwortet die ersten beiden Fragen gut: Es ist echtes TLS, und Sonden sehen eine echte Website. Aber jeder Trojan-Server braucht eine eigene Domain und ein eigenes Zertifikat. Sobald ein Zensor diese Domain kennt, kann er sie blockieren, und viele Domains zu betreiben ist eine ständige Jagd.

## Was VLESS-Reality richtig macht

[VLESS-Reality](/vpn-protocols/vless-reality) beantwortet alle drei:

- **Kein fester Fingerabdruck.** Die Verbindung ist TLS 1.3 über TCP, der häufigste verschlüsselte Datenverkehr im Internet.
- **Sonden sehen eine echte Website.** Reality leitet jeden, der sich nicht authentifizieren kann, an die echte Website weiter, deren Handshake es übernimmt, mit dem echten Zertifikat dieser Website.
- **Nichts von uns, das sich per Namen blockieren ließe.** Im Handshake gibt es keine Doppler-Domain und kein Doppler-Zertifikat.

Es läuft außerdem über TCP und funktioniert daher weiter in Netzwerken, die UDP drosseln oder blockieren, wo [Hysteria 2](/vpn-protocols/hysteria2) und [AmneziaWG](/vpn-protocols/amneziawg) Schwierigkeiten haben. Und VLESS selbst ist klein: Es verlässt sich für die Verschlüsselung auf TLS, statt eine eigene hinzuzufügen, sodass es keine doppelte Verschlüsselung gibt.

## Worauf wir verzichtet haben

- **Rohgeschwindigkeit auf verlustbehafteten Verbindungen.** TCP erholt sich von Paketverlusten weniger elegant als QUIC oder das UDP von WireGuard. Bei einer sauberen Verbindung ist der Unterschied klein; bei einer schlechten kann er spürbar sein.
- **Eingebaute Unterstützung im Betriebssystem.** Kein Betriebssystem liefert einen VLESS-Client mit, daher brauchen Sie eine App. Wir haben das für akzeptabel gehalten und eigene Apps für iOS, Android, macOS und Windows gebaut.
- **Perfekte Unsichtbarkeit.** Die gibt es nicht. Forschung hat gezeigt, dass sich [TLS in TLS per Fingerprinting erkennen lässt](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), und im November 2025 [berichteten](https://github.com/net4people/bbs/issues/546) Nutzer, dass einige russische Internetanbieter Reality-Verbindungen unterbrachen. VLESS-Reality ist ein Design zur Zensurresistenz, keine Garantie.

## Was wir gegen die Grenzen tun

Zensur verändert sich, daher ist die Wahl des Protokolls nicht das Ende der Arbeit. Wir passen die Servereinstellungen und die Websites, die Reality übernimmt, an, wenn sich die Filterung ändert, und wir verfolgen weiterhin dieselbe Forschung und dieselben Berichte aus der Community, die auf diesen Seiten zitiert werden. Sollte ein besserer Ansatz auftauchen, wird diese Seite das sagen.

Die vollständige technische Geschichte, wie VLESS-Reality funktioniert, lesen Sie unter [Der VLESS-Reality-Tunnel](/how-it-works/vless-reality-tunnel). Zum Ausprobieren siehe [VLESS VPN](/vless-vpn).
