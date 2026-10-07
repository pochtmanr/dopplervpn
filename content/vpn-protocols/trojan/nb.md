> **Kortversjonen.** Trojan skjuler proxytrafikk inne i en ekte TLS-tilkobling til et ekte nettsted du kontrollerer. Alle som kobler til uten passordet, får ganske enkelt nettstedet. Det virker godt, men du trenger ditt eget domene og sertifikat, og de kan bli funnet og blokkert.

## Hva er Trojan?

Trojan er en proxy-protokoll fra [trojan-gfw-prosjektet](https://github.com/trojan-gfw/trojan), først utgitt i oktober 2017. Ideen ligger i navnet: i stedet for å finne opp en forkledning skjuler den seg inne i den vanligste krypterte trafikken på internett, HTTPS.

## Hvordan fungerer den?

[Protokollbeskrivelsen](https://trojan-gfw.github.io/trojan/protocol) er kort. En Trojan-server lytter som en vanlig HTTPS-server, med et ekte sertifikat for et ekte domene. Klienten gjennomfører et ekte TLS-håndtrykk. Deretter, inne i den krypterte tilkoblingen, sender den:

- den heksadesimale SHA-224-hashen av det delte passordet, som er 56 tegn,
- et linjeskift,
- en liten forespørsel om hvor trafikken skal, i et SOCKS5-lignende format,
- et nytt linjeskift, etterfulgt av den første delen av dataene.

Hvis hashen og forespørselen er gyldige, åpner serveren en tunnel til destinasjonen. Hvis noe er galt, behandler serveren tilkoblingen som «andre protokoller» og sender den til en reserve-webserver, slik at den besøkende ser et vanlig nettsted.

## Hvor vanskelig er det å blokkere Trojan?

Fra utsiden er en Trojan-tilkobling en TLS-økt til domenet ditt, med sertifikatet ditt. Aktive sonder får et ekte nettsted tilbake. Det gjør Trojan mye vanskeligere å plukke ut enn protokoller som ser tilfeldige ut, for eksempel [Shadowsocks](/vpn-protocols/shadowsocks).

Det svake punktet er selve domenet. Hver server trenger et domene og et sertifikat, og en sensor som finner ut hvilke domener som tilhører proxyer, kan blokkere dem på navn eller IP. Forskere har også vist at TLS som bæres inne i TLS, etterlater mønstre i tid og størrelse som kan [fingeravtrykkes](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), noe som gjelder Trojan og lignende utforminger.

[VLESS-Reality](/vpn-protocols/vless-reality) fjerner domeneproblemet ved å låne TLS-håndtrykket til et eksisterende, populært nettsted i stedet for ditt eget.

## Når bør du bruke Trojan?

- **Når du kontrollerer et domene** og vil ha et enkelt, godt forstått oppsett som ser ut som HTTPS.
- **I moderat filtrerte nettverk** der domenet ditt neppe blir et mål.
- Sammenligningen vår av [VLESS, VMess og Trojan](/blog/vless-vs-vmess-vs-trojan) hjelper hvis du skal velge mellom dem.

## Bruker Doppler Trojan?

Nei. Doppler bruker VLESS-Reality, som ikke trenger et eget domene. Se [hvorfor VLESS](/vpn-protocols/why-vless).
