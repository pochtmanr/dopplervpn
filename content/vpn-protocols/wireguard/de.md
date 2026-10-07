> **Kurz gesagt.** WireGuard ist das schnellste und einfachste gängige VPN-Protokoll und in einem ungefilterten Netzwerk eine ausgezeichnete Wahl. Es wurde jedoch nie dafür entworfen, zu verbergen, dass es sich um ein VPN handelt, und in Russland, im Iran und in China gehört es zu den ersten Protokollen, die blockiert werden.

## Was ist WireGuard?

WireGuard ist ein VPN-Protokoll, das von Jason A. Donenfeld geschrieben und 2015 erstmals veröffentlicht wurde. Sein Ziel war es, die großen, konfigurierbaren Protokolle der Vergangenheit durch etwas zu ersetzen, das klein genug ist, um es vollständig zu prüfen. Im März 2020 wurde es [in den Linux-Kernel 5.6 aufgenommen](https://en.wikipedia.org/wiki/WireGuard), und inzwischen gibt es offizielle Apps für Windows, macOS, iOS, Android und Linux.

Statt beide Seiten eine Cipher Suite aushandeln zu lassen, legt WireGuard einen festen Satz moderner Primitive fest. Die [Protokollseite](https://www.wireguard.com/protocol/) führt sie auf: ChaCha20 mit Poly1305 für die Verschlüsselung, Curve25519 für den Schlüsselaustausch und BLAKE2s fürs Hashing. Es gibt nichts, was man falsch konfigurieren könnte, und keine ältere, schwächere Option, auf die zurückgegriffen werden kann.

## Wie funktioniert es?

Jedes Gerät hat ein Schlüsselpaar, ähnlich wie bei SSH. Client und Server kennen die öffentlichen Schlüssel des jeweils anderen im Voraus, und der Handshake basiert auf dem Noise-Protokoll-Framework (die Protokollseite nennt die genaue Konstruktion, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Alle Pakete werden über UDP gesendet](https://www.wireguard.com/protocol/), und eine neue Sitzung wird in einem einzigen Round Trip aufgebaut.

Dieses Design ist der Grund, warum sich WireGuard schnell anfühlt. Es gibt kaum etwas auszuhandeln, der Code läuft unter Linux direkt im Betriebssystemkern, und der Wechsel zwischen WLAN und Mobilfunk geschieht unbemerkt, weil das Protokoll keine dauerhafte Verbindung offen hält.

## Warum wird WireGuard blockiert?

Dieselbe Einfachheit, die WireGuard leicht prüfbar macht, macht es auch leicht erkennbar. Das [Whitepaper](https://www.wireguard.com/papers/wireguard.pdf) legt die Handshake-Nachrichten Byte für Byte fest, sodass das erste Paket eines Clients immer 148 Byte und die Antwort immer 92 Byte umfasst, jeweils beginnend mit einem festen Feld für den Nachrichtentyp. Ein System zur Deep Packet Inspection (DPI) braucht nur eine kurze Regel, um dieses Muster in UDP zu erkennen.

Zensoren haben genau das getan. Im August 2023 [berichteten](https://github.com/net4people/bbs/issues/274) Nutzer in Russland, dass große Mobilfunkanbieter WireGuard-Sitzungen direkt nach dem Handshake unterbrachen. Die Verschlüsselung schützte weiterhin die Inhalte, aber die Verbindung selbst war weg.

Das ist ein Kompromiss im Design, kein Fehler. Die Autoren von WireGuard haben sich für ein festes, minimales Protokoll entschieden, und Tarnung gehörte nicht zu den Zielen. Projekte wie [AmneziaWG](/vpn-protocols/amneziawg) verändern die Paketformen, um wieder einen gewissen Schutz vor Entdeckung zu schaffen.

## Wann sollte man WireGuard verwenden?

- **Ungefilterte Netzwerke.** Zu Hause, bei der Arbeit oder auf Reisen in einem Land, das VPNs nicht blockiert, ist WireGuard bei Geschwindigkeit und Akkulaufzeit kaum zu schlagen.
- **Selbst betriebene Server.** Wer einen eigenen Server betreibt, findet in WireGuard eines der am einfachsten korrekt einzurichtenden Protokolle.
- **Nicht unter DPI-Filterung.** Wenn Ihr Netzwerk VPNs blockiert, passt ein Protokoll besser, das wie gewöhnlicher Webverkehr aussehen soll, etwa [VLESS-Reality](/vpn-protocols/vless-reality). Unser Vergleich von [VLESS-Reality und WireGuard](/blog/vless-reality-vs-wireguard) behandelt diesen Kompromiss ausführlicher.

## Nutzt Doppler WireGuard?

Nein. Die Apps von Doppler verbinden sich über VLESS-Reality, weil Doppler für Netzwerke entwickelt wurde, in denen WireGuard gefiltert wird. Die Anleitung [Warum VLESS](/vpn-protocols/why-vless) erklärt die Überlegungen dahinter.
