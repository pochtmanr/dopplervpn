> **Den korte version.** IKEv2/IPsec er den VPN, din telefon og bærbare allerede kan tale uden nogen app. Den er hurtig og håndterer skift mellem Wi-Fi og mobildata godt. Den kører også på faste, velkendte porte, hvilket gør den til en af de enkleste protokoller for en censor at blokere.

## Hvad er IKEv2/IPsec?

"IKEv2" er i virkeligheden to dele, der arbejder sammen. IPsec er det sæt, der krypterer og godkender IP-pakker. IKE, Internet Key Exchange, er den protokol, de to sider bruger til at godkende hinanden og blive enige om IPsec-nøgler. Version 2 af IKE blev standardiseret [i december 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), og den gældende specifikation er [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Fordi det er en IETF-standard, er IKEv2 indbygget i iOS, macOS og Windows og i Android fra version 11. Mange virksomheders VPN-gateways bruger den.

## Hvordan virker den?

Nøgleudvekslingen kører over UDP, [som regel på port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Når de to sider er blevet enige om nøgler, krypterer operativsystemets IPsec-stak din trafik med Encapsulating Security Payload (ESP). Når en NAT-router står i vejen, som på næsten alle hjemme- og mobilnetværk, pakkes både IKE og ESP ind i UDP på port 4500.

IKEv2 har en standardudvidelse, der hedder [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), som lader en forbindelse overleve et skift af IP-adresse. Derfor er IKEv2 behagelig på telefoner: gå ud af Wi-Fi-rækkevidde og over på mobildata, og tunnelen fortsætter i stedet for at oprette forbindelse forfra.

## Hvorfor er IKEv2 let at blokere?

IKEv2 forsøger ikke at ligne noget andet. Trafikken bruger velkendte UDP-porte og har de standardformater for IKE og ESP, som ethvert netværksværktøj kan læse. At blokere den kræver ikke engang dyb pakkeinspektion: et filter kan droppe UDP-portene 500 og 4500 eller genkende IKE-udvekslingen direkte.

Det er et rimeligt kompromis for virksomhedsnetværk og rejser i åbne lande, hvor det ikke koster noget at blive genkendt som en VPN. På netværk, der filtrerer VPN'er med vilje, er det som regel det første, der holder op med at virke.

## Hvornår bør du bruge IKEv2?

- **Ingen app tilladt.** På en administreret enhed, hvor du ikke kan installere software, kan den indbyggede IKEv2-klient være den eneste mulighed.
- **Mobil roaming på åbne netværk.** MOBIKE gør det jævnt, når du skifter mellem netværk.
- **Ikke under censur.** På filtrerede netværk skal du vælge en protokol, der er designet til at gå i ét med den øvrige trafik, såsom [VLESS-Reality](/vpn-protocols/vless-reality). Vores [censurguide](/bypass-censorship) forklarer, hvordan blokering virker.

## Bruger Doppler IKEv2?

Nej. Doppler forbinder med VLESS-Reality i sine egne apps. Se [hvorfor VLESS](/vpn-protocols/why-vless) for begrundelserne.
