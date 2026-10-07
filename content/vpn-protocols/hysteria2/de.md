> **Kurz gesagt.** Hysteria 2 ist ein Proxy-Protokoll auf Basis von QUIC, dem Transport hinter HTTP/3. Es ist auf Geschwindigkeit bei schlechten Verbindungen mit Paketverlusten ausgelegt, und für jeden ohne das Passwort verhält sich sein Server wie eine gewöhnliche HTTP/3-Website. Seine Schwachstelle ist die Abhängigkeit von UDP, das manche Netzwerke drosseln oder ganz blockieren.

## Was ist Hysteria 2?

Hysteria ist ein Open-Source-Projekt von [apernet](https://github.com/apernet/hysteria); Version 2, ein neu entworfenes Protokoll, erschien im September 2023. Wie Shadowsocks und VLESS ist es ein Proxy und kein klassisches VPN, und Clients können ein ganzes Gerät darüber leiten.

## Wie funktioniert es?

Laut seiner [Protokollspezifikation](https://v2.hysteria.network/docs/developers/Protocol/) läuft Hysteria 2 über QUIC gemäß [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), mit der Erweiterung für unzuverlässige Datagramme für UDP-Verkehr. QUIC bringt bereits TLS-1.3-Verschlüsselung, gemultiplexte Streams und einen schnellen Verbindungsaufbau mit.

Bei der Authentifizierung kommt die Tarnung ins Spiel. Die Spezifikation verlangt, dass ein Hysteria-Server **einen echten HTTP/3-Server implementieren muss** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) und Anfragen so behandelt, wie es jeder Webserver tut. Ein Client authentifiziert sich mit einer speziellen HTTP/3-Anfrage; alle anderen, ob neugieriger Besucher oder aktive Sonde, erhalten gewöhnliche Webantworten. Die Spezifikation hält fest, dass sich der Server für Dritte ohne Zugangsdaten genau wie ein standardmäßiger HTTP/3-Webserver verhält.

## Warum ist es schnell?

QUIC läuft über UDP und erholt sich von Paketverlusten, ohne wie TCP jeden Stream auszubremsen. Hysteria kann außerdem eine eigene Überlastkontrolle verwenden, die auf instabile Verbindungen ausgerichtet ist, und hält daher seine Geschwindigkeit tendenziell in überlasteten Mobilfunknetzen, auf Langstreckenrouten und in gestörten WLANs, wo TCP-basierte Protokolle langsamer werden.

## Wie schwer ist Hysteria 2 zu blockieren?

Gegen aktives Probing hält es gut stand, da Sonden einen Webserver sehen. Die Angriffsfläche ist der Transport. Ein Zensor kann UDP oder gezielt QUIC drosseln oder blockieren, ohne die meisten Websites zu beeinträchtigen, weil Browser auf HTTP/2 über TCP zurückfallen, wenn HTTP/3 scheitert. Wo das geschieht, kann Hysteria 2 nicht ausweichen, während TCP-basierte Protokolle wie [VLESS-Reality](/vpn-protocols/vless-reality) weiter funktionieren.

## Wann sollte man Hysteria 2 verwenden?

- **Verlustbehaftete oder lange Verbindungen**, bei denen sich seine Überlastkontrolle und die Verlustbehebung von QUIC auszahlen.
- **Netzwerke, die UDP erlauben.** Prüfen Sie das, bevor Sie sich darauf verlassen.
- Als zweites Protokoll neben einer TCP-Option, damit Sie wechseln können, wenn UDP gefiltert wird. Unser [Leitfaden zur Zensur](/bypass-censorship) behandelt, wie Filter Transportprotokolle ins Visier nehmen.

## Nutzt Doppler Hysteria 2?

Nein. Doppler verwendet VLESS-Reality über TCP, das auch in Netzwerken funktioniert, die UDP blockieren. Siehe [Warum VLESS](/vpn-protocols/why-vless).
