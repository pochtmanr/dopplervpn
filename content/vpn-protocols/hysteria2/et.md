> **Lühidalt.** Hysteria 2 on puhverserveri protokoll, mis on ehitatud QUIC-ile, transpordile HTTP/3 taga. See on loodud kiiruse jaoks kehvadel ja kadudega ühendustel ning kõigile, kellel parooli ei ole, käitub selle server nagu tavaline HTTP/3 veebisait. Nõrk koht on see, et see sõltub UDP-st, mida mõned võrgud aeglustavad või blokeerivad täielikult.

## Mis on Hysteria 2?

Hysteria on avatud lähtekoodiga projekt organisatsioonilt [apernet](https://github.com/apernet/hysteria); versioon 2, ümber tehtud protokoll, ilmus 2023. aasta septembris. Nagu Shadowsocks ja VLESS, on see puhverserver, mitte klassikaline VPN, ning kliendid saavad kogu seadme liikluse sealt läbi suunata.

## Kuidas see töötab?

Selle [protokolli spetsifikatsiooni](https://v2.hysteria.network/docs/developers/Protocol/) järgi töötab Hysteria 2 QUIC-i peal, nagu see on määratletud dokumendis [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), koos ebausaldusväärsete datagrammide laiendusega UDP-liikluse jaoks. QUIC annab juba TLS 1.3 krüpteerimise, multipleksitud vood ja kiire ühenduse loomise.

Maskeering tuleb sisse autentimisel. Spetsifikatsioon nõuab, et Hysteria server **peab rakendama päris HTTP/3-serveri** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) ja käsitlema päringuid nii, nagu iga veebiserver. Klient autentib end erilise HTTP/3 päringuga; kõik teised, olgu uudishimulik külastaja või aktiivne sond, saavad tavalised veebivastused. Spetsifikatsioon ütleb, et kolmandale osapoolele ilma mandaatideta käitub server täpselt nagu tavaline HTTP/3 veebiserver.

## Miks see on kiire?

QUIC töötab UDP kaudu ja taastub paketikadudest, ilma et peataks iga voo nii, nagu TCP teeb. Hysteria saab kasutada ka enda ummikukontrolli, mis on suunatud ebastabiilsetele ühendustele, nii et see kipub kiirust hoidma ummistunud mobiilivõrkudes, pikkadel marsruutidel ja häiretega Wi-Fi-s, kus TCP-põhised protokollid aeglustuvad.

## Kui raske on Hysteria 2 blokeerida?

Aktiivse sondeerimise vastu peab see hästi vastu, sest sondid näevad veebiserverit. Paljastatud koht on transport. Tsensor saab UDP-d või konkreetselt QUIC-i aeglustada või blokeerida, ilma et enamik veebisaite katki läheks, sest brauserid langevad HTTP/2 peale TCP kaudu tagasi, kui HTTP/3 ebaõnnestub. Seal, kus see juhtub, ei ole Hysteria 2-l kuhugi minna, samal ajal kui TCP-põhised protokollid nagu [VLESS-Reality](/vpn-protocols/vless-reality) töötavad edasi.

## Millal Hysteria 2 kasutada?

- **Kadudega või pikkadel ühendustel**, kus selle ummikukontroll ja QUIC-i kadude taastamine end ära tasuvad.
- **Võrkudes, mis lubavad UDP-d.** Kontrollige seda, enne kui sellele toetute.
- Teise protokollina TCP-variandi kõrval, et saaksite ümber lülituda, kui UDP-d filtreeritakse. Meie [tsensuurijuhend](/bypass-censorship) käsitleb, kuidas filtrid transpordile sihivad.

## Kas Doppler kasutab Hysteria 2?

Ei. Doppler kasutab VLESS-Realityt TCP kaudu, mis töötab edasi võrkudes, mis blokeerivad UDP-d. Vaadake [miks VLESS](/vpn-protocols/why-vless).
