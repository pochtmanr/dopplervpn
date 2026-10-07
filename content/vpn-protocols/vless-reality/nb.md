> **Kortversjonen.** VLESS er en minimal proxy-protokoll fra Xray-prosjektet. Reality er TLS-laget som får en VLESS-tilkobling til å se ut som et vanlig TLS 1.3-besøk til et ekte, populært nettsted, uten eget domene eller sertifikat. Sammen er de for tiden den vanlige kombinasjonen som er vanskeligst for sensorer å blokkere. Denne siden er sammendraget; den [utdypende veiledningen](/how-it-works/vless-reality-tunnel) vår har hele historien.

## Hva er VLESS?

VLESS ble [foreslått i juli 2020](https://github.com/v2ray/v2ray-core/issues/2636) som en lettere etterfølger til [VMess](/vpn-protocols/vmess). [Spesifikasjonen](https://xtls.github.io/en/development/protocols/vless.html) er med vilje liten: en protokollversjon, en UUID på 16 byte som identifiserer brukeren, et valgfritt tilleggsfelt, og kommandoen, porten og adressen til destinasjonen. VLESS har ingen egen kryptering. Den støtter seg på TLS-laget under, slik at trafikken ikke krypteres to ganger.

VLESS er en del av [Xray-core](https://github.com/XTLS/Xray-core), prosjektet som skilte seg fra V2Ray i november 2020 og nå leder utviklingen av denne protokollfamilien.

## Hva legger Reality til?

Protokoller som [Trojan](/vpn-protocols/trojan) skjuler seg inne i TLS til ditt eget domene, og det domenet blir det en sensor kan blokkere. [Reality](https://github.com/XTLS/REALITY), utgitt i Xray-core [1.8.0 i mars 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), fjerner det.

En Reality-server presenterer TLS-håndtrykket til et ekte tredjepartsnettsted. For en observatør er tilkoblingen et vanlig TLS 1.3-besøk til det nettstedet. En klient som kjenner serverens nøkkel, slippes inn i VLESS-tunnelen; alle andre, også en sensors aktive sonde, sendes videre til det ekte nettstedet og ser dets ekte sertifikat. Det finnes ikke noe Doppler-domene eller -sertifikat å sette på en blokkeringsliste.

## Hvor vanskelig er det å blokkere VLESS-Reality?

Det er det mest motstandsdyktige vanlige alternativet vi kjenner til, men det er ikke usynlig. Forskning publisert i 2024 viste at [TLS som bæres inne i TLS, kan fingeravtrykkes](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) ut fra tid og pakkestørrelser, og i november 2025 [rapporterte](https://github.com/net4people/bbs/issues/546) brukere at noen russiske internettleverandører kuttet Reality-tilkoblinger. Tilbydere svarer med å justere serverinnstillinger og nettstedene de låner, og katt-og-mus-spillet fortsetter.

## Hvor rask er den?

I daglig bruk er overheaden liten. VLESS-headeren sendes én gang per tilkobling, og XTLS Vision-flyten unngår å kryptere allerede kryptert nettrafikk en gang til. Fordi den kjører over TCP, kan VLESS-Reality være tregere enn UDP-protokoller som [WireGuard](/vpn-protocols/wireguard) i nettverk med pakketap, men den fortsetter å virke der de er blokkert.

## Hvor kan jeg lese mer?

- [VLESS-Reality-tunnelen, i dybden](/how-it-works/vless-reality-tunnel): historie, mekanisme, grenser.
- [Hva er VLESS?](/blog/what-is-vless) og [URI-formatet for VLESS](/blog/vless-uri-format) på bloggen vår.
- [VLESS VPN](/vless-vpn): hvordan Doppler pakker VLESS-Reality inn i apper med ett trykk.
