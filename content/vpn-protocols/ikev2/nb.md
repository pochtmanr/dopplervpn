> **Kortversjonen.** IKEv2/IPsec er VPN-en telefonen og den bærbare datamaskinen din allerede kan snakke uten noen app. Den er rask og håndterer bytte mellom Wi-Fi og mobildata godt. Den kjører også på faste, velkjente porter, noe som gjør den til en av de enkleste protokollene for en sensor å blokkere.

## Hva er IKEv2/IPsec?

«IKEv2» er egentlig to deler som arbeider sammen. IPsec er pakken som krypterer og autentiserer IP-pakker. IKE, Internet Key Exchange, er protokollen de to sidene bruker til å autentisere hverandre og bli enige om IPsec-nøkler. Versjon 2 av IKE ble standardisert [i desember 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), og gjeldende spesifikasjon er [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Fordi det er en IETF-standard, er IKEv2 innebygd i iOS, macOS og Windows, og i Android fra versjon 11. Mange VPN-gatewayer i bedrifter bruker den.

## Hvordan fungerer den?

Nøkkelutvekslingen går over UDP, [vanligvis på port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Når de to sidene er enige om nøkler, krypterer operativsystemets IPsec-stakk trafikken din med Encapsulating Security Payload (ESP). Når en NAT-ruter står i veien, som i nesten alle hjemme- og mobilnett, pakkes både IKE og ESP inn i UDP på port 4500.

IKEv2 har en standardutvidelse som heter [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), som lar en tilkobling overleve et bytte av IP-adresse. Derfor er IKEv2 behagelig på telefoner: gå ut av Wi-Fi-dekning og over på mobildata, og tunnelen fortsetter i stedet for å koble til på nytt fra bunnen av.

## Hvorfor er IKEv2 lett å blokkere?

IKEv2 gjør ingen forsøk på å se ut som noe annet. Trafikken bruker velkjente UDP-porter og har standardformatene for IKE og ESP, som ethvert nettverksverktøy kan tolke. Å blokkere den krever ikke engang dyp pakkeinspeksjon: et filter kan forkaste UDP-portene 500 og 4500, eller kjenne igjen IKE-utvekslingen direkte.

Det er en rimelig avveining for bedriftsnettverk og reiser i åpne land, der det ikke koster noe å bli gjenkjent som en VPN. I nettverk som filtrerer VPN-er med vilje, er den vanligvis det første som slutter å virke.

## Når bør du bruke IKEv2?

- **Når ingen app er tillatt.** På en administrert enhet der du ikke kan installere programvare, kan den innebygde IKEv2-klienten være det eneste alternativet.
- **Mobilroaming i åpne nettverk.** MOBIKE gjør det jevnt når du beveger deg mellom nettverk.
- **Ikke under sensur.** I filtrerte nettverk bør du velge en protokoll som er laget for å gli inn, for eksempel [VLESS-Reality](/vpn-protocols/vless-reality). [Sensurveiledningen](/bypass-censorship) vår forklarer hvordan blokkering virker.

## Bruker Doppler IKEv2?

Nei. Doppler kobler til med VLESS-Reality inne i sine egne apper. Se [hvorfor VLESS](/vpn-protocols/why-vless) for grunnene.
