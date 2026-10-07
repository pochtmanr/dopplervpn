> **Lühidalt.** VLESS on minimaalne puhverserveri protokoll Xray projektist. Reality on TLS-kiht, mis paneb VLESSi ühenduse nägema välja nagu tavaline TLS 1.3 külastus päris populaarsele veebisaidile, ilma teie enda domeeni või sertifikaadita. Koos on see praegu tsensoritele kõige raskemini blokeeritav levinud kombinatsioon. See leht on kokkuvõte; täielik lugu on meie [põhjalikus juhendis](/how-it-works/vless-reality-tunnel).

## Mis on VLESS?

VLESS [pakuti välja 2020. aasta juulis](https://github.com/v2ray/v2ray-core/issues/2636) kergema järglasena protokollile [VMess](/vpn-protocols/vmess). Selle [spetsifikatsioon](https://xtls.github.io/en/development/protocols/vless.html) on meelega väike: protokolli versioon, 16-baidine UUID, mis identifitseerib kasutaja, valikuline lisade väli ning sihtkoha käsk, port ja aadress. VLESSil ei ole enda krüpteerimist. See toetub all olevale TLS-kihile, nii et liiklust ei krüpteerita kaks korda.

VLESS on osa projektist [Xray-core](https://github.com/XTLS/Xray-core), mis eraldus V2Ray'st 2020. aasta novembris ja juhib nüüd selle protokollipere arendust.

## Mida Reality lisab?

Protokollid nagu [Trojan](/vpn-protocols/trojan) peidavad end TLS-i sisse teie enda domeenile ja sellest domeenist saab see, mida tsensor saab blokeerida. [Reality](https://github.com/XTLS/REALITY), mis ilmus Xray-core'is [1.8.0 2023. aasta märtsis](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), eemaldab selle.

Reality server esitab päris kolmanda osapoole veebisaidi TLS-käepigistuse. Vaatlejale on ühendus tavaline TLS 1.3 külastus sellele saidile. Klient, kes teab serveri võtit, lastakse VLESSi tunnelisse; kõik teised, sealhulgas tsensori aktiivne sond, suunatakse päris veebisaidile ja näevad selle ehtsat sertifikaati. Blokeerimisnimekirja pandavat Doppleri domeeni või sertifikaati ei ole.

## Kui raske on VLESS-Realityt blokeerida?

See on kõige vastupidavam levinud variant, mida me teame, kuid see ei ole nähtamatu. 2024. aastal avaldatud uuring näitas, et [TLS-i TLS-i sees saab sõrmejälje järgi ära tunda](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) ajastuse ja paketi suuruste järgi, ning 2025. aasta novembris [teatasid](https://github.com/net4people/bbs/issues/546) kasutajad, et mõned Venemaa internetiteenuse pakkujad katkestavad Reality ühendusi. VPN-i pakkujad vastavad serveriseadete ja laenatavate saitide kohandamisega ning kassi-hiire mäng jätkub.

## Kui kiire see on?

Igapäevases kasutuses on üldkulu väike. VLESSi päis saadetakse üks kord ühenduse kohta ning XTLS Visioni voog väldib juba krüpteeritud veebiliikluse teist korda krüpteerimist. Kuna see töötab TCP kaudu, võib VLESS-Reality kadudega võrkudes olla aeglasem kui UDP-protokollid nagu [WireGuard](/vpn-protocols/wireguard), kuid see töötab edasi seal, kus need on blokeeritud.

## Kust saab rohkem teada?

- [VLESS-Reality tunnel põhjalikult](/how-it-works/vless-reality-tunnel): ajalugu, mehhanism, piirid.
- [Mis on VLESS?](/blog/what-is-vless) ja [VLESS URI-vorming](/blog/vless-uri-format) meie blogis.
- [VLESS VPN](/vless-vpn): kuidas Doppler pakib VLESS-Reality ühe puudutusega rakendustesse.
