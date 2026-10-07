> **Kurz gesagt.** Shadowsocks ist ein schlanker verschlüsselter Proxy, der in China entwickelt wurde, um die Große Firewall zu überwinden. Jahrelang funktionierte er, indem er wie gar nichts aussah. Seit 2021 zeigt die Forschung, dass die Firewall genau diese Art von Datenverkehr blockiert, weil echter Datenverkehr selten so zufällig ist.

## Was ist Shadowsocks?

Shadowsocks ist ein Open-Source-Proxy-Protokoll, das [im April 2012](https://en.wikipedia.org/wiki/Shadowsocks) erstmals veröffentlicht wurde. Streng genommen ist es kein VPN: Es ist ein verschlüsselter Proxy im Stil von SOCKS5, und die Apps entscheiden, welcher Datenverkehr darüber läuft. In der Praxis bieten die meisten Shadowsocks-Clients inzwischen einen systemweiten Modus, der sich wie ein VPN verhält.

Beliebt ist es, weil es einfach und schnell ist. Die aktuellen Versionen verwenden [AEAD-Cipher](https://shadowsocks.org/doc/aead.html), die Vertraulichkeit, Integrität und Authentizität in einem Schritt gewährleisten, und die [Ausgabe von 2022](https://shadowsocks.org/doc/sip022.html) des Protokolls verschärfte den Schutz vor Replay-Angriffen.

## Wie funktioniert es?

Client und Server teilen sich ein Passwort, das in einen Verschlüsselungsschlüssel umgewandelt wird. Alles, was der Client sendet, einschließlich der Adresse der gewünschten Website, wird vom allerersten Byte an verschlüsselt. Es gibt keinen erkennbaren Handshake, kein Zertifikat und keinen Header im Klartext. Für einen Beobachter ist eine Shadowsocks-Verbindung ein Strom zufällig aussehender Bytes.

## Wie erkennt die Große Firewall Shadowsocks?

Zunächst durch aktives Probing. Forscher von GFW Report [haben aufgezeichnet](https://gfw.report/publications/imc20/en/), wie die Firewall Zehntausende Sonden an verdächtige Shadowsocks-Server schickte und echte Verbindungen wiederholte und veränderte, um zu sehen, wie der Server reagierte.

Dann, ab November 2021, durch eine gröbere und breitere Methode. Eine [Studie von USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) stellte fest, dass die Firewall „vollständig verschlüsselten“ Datenverkehr in Echtzeit blockiert. Sie betrachtet das erste Paket einer Verbindung und nimmt alles aus, was einem bekannten Protokoll ähnelt oder genug druckbaren Text enthält. Eine Regel misst die durchschnittliche Anzahl gesetzter Bits pro Byte: Werte bis 3,4 oder ab 4,6 sind ausgenommen, zufällig aussehende Daten dazwischen nicht. Was übrig bleibt, kann blockiert werden.

Die Forscher stellten außerdem fest, dass die Firewall dies bei etwa 26 % der Verbindungen anwendete, und zwar nur auf IP-Bereiche beliebter Rechenzentren, vermutlich um Kollateralschäden zu begrenzen. Die Lehre für Protokollentwickler war eindeutig: Zufällig auszusehen ist selbst ein Fingerabdruck.

## Wann sollte man Shadowsocks verwenden?

- **Leichtes, schnelles Proxying** in Netzwerken, die den Datenverkehr nicht genau prüfen.
- **Selbst betriebene Server** mit Werkzeugen wie Outline, die die Einrichtung unkompliziert machen.
- **Mit Vorsicht bei starker Filterung.** In China und anderen Orten, die vollständig verschlüsselten Datenverkehr blockieren, ist Shadowsocks deutlich weniger zuverlässig als Protokolle, die echtes TLS nachahmen, etwa [VLESS-Reality](/vpn-protocols/vless-reality). Unsere [Geschichte der Zensurprotokolle](/blog/censorship-protocol-history) zeichnet nach, wie sich das Feld weiterentwickelt hat.

## Nutzt Doppler Shadowsocks?

Nein. Doppler verwendet VLESS-Reality, aus den Gründen unter [Warum VLESS](/vpn-protocols/why-vless).
