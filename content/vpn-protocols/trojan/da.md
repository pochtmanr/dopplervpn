> **Den korte version.** Trojan skjuler proxytrafik inde i en ægte TLS-forbindelse til et rigtigt website, du styrer. Alle, der forbinder uden adgangskoden, får blot websitet. Den virker godt, men du skal bruge dit eget domæne og certifikat, og de kan findes og blokeres.

## Hvad er Trojan?

Trojan er en proxyprotokol fra [trojan-gfw-projektet](https://github.com/trojan-gfw/trojan), først udgivet i oktober 2017. Ideen ligger i navnet: i stedet for at opfinde en forklædning skjuler den sig i den mest udbredte krypterede trafik på internettet, HTTPS.

## Hvordan virker den?

[Protokolbeskrivelsen](https://trojan-gfw.github.io/trojan/protocol) er kort. En Trojan-server lytter som en normal HTTPS-server med et rigtigt certifikat til et rigtigt domæne. Klienten gennemfører et ægte TLS-handshake. Derefter sender den inde i den krypterede forbindelse:

- den hex-kodede SHA-224-hash af den delte adgangskode, som er 56 tegn,
- et linjeskift,
- en lille forespørgsel, der siger, hvor trafikken skal hen, i et SOCKS5-lignende format,
- endnu et linjeskift efterfulgt af det første stykke data.

Hvis hashen og forespørgslen er gyldige, åbner serveren en tunnel til destinationen. Hvis noget er forkert, behandler serveren forbindelsen som "andre protokoller" og sender den videre til en fallback-webserver, så den besøgende ser et almindeligt website.

## Hvor svær er Trojan at blokere?

Udefra er en Trojan-forbindelse en TLS-session til dit domæne med dit certifikat. Aktive sonder får et rigtigt website tilbage. Det gør Trojan meget sværere at udpege end protokoller, der ser tilfældige ud, såsom [Shadowsocks](/vpn-protocols/shadowsocks).

Det svage punkt er selve domænet. Hver server skal bruge et domæne og et certifikat, og en censor, der finder ud af, hvilke domæner der hører til proxyer, kan blokere dem efter navn eller efter IP. Forskere har også vist, at TLS båret inde i TLS efterlader mønstre i timing og størrelse, der kan [fingeraftrykkes](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), hvilket rammer Trojan og lignende design.

[VLESS-Reality](/vpn-protocols/vless-reality) fjerner domæneproblemet ved at låne TLS-handshaket fra et eksisterende, populært website i stedet for dit eget.

## Hvornår bør du bruge Trojan?

- **Når du styrer et domæne** og vil have en enkel, velkendt opsætning, der ligner HTTPS.
- **På moderat filtrerede netværk**, hvor dit domæne næppe bliver udpeget.
- Vores sammenligning af [VLESS, VMess og Trojan](/blog/vless-vs-vmess-vs-trojan) hjælper, hvis du vælger mellem dem.

## Bruger Doppler Trojan?

Nej. Doppler bruger VLESS-Reality, som ikke skal bruge et domæne for sig selv. Se [hvorfor VLESS](/vpn-protocols/why-vless).
