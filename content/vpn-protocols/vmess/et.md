> **Lühidalt.** VMess on V2Ray projekti algne protokoll. See krüpteerib oma päised ja on tavaliselt mähitud teise transporti, näiteks WebSocketisse TLS-i peal, et näha välja nagu veebiliiklus. See töötab endiselt, kuid selle järglased VLESS ja Trojan teevad sama töö väiksema üldkuluga.

## Mis on VMess?

VMess on krüpteeritud puhverserveri protokoll, mille [V2Ray projekt](https://github.com/v2fly/v2ray-core) tõi välja, kui see 2015. aastal algas. V2Ray kasvas moodulplatvormiks puhverserverite ehitamiseks: üks tuum, palju protokolle ja transporte ning marsruutimismootor, mis otsustab, milline liiklus kuhu läheb. VMess oli selle esimene protokoll ja mitu aastat peamine.

Nagu Shadowsocks, on VMess tehniliselt puhverserver, mitte VPN, kuid V2Ray'l põhinevad rakendused saavad kogu seadme liikluse sealt läbi suunata.

## Kuidas see töötab?

Igal kasutajal on UUID, mis toimib tema mandaadina. [Protokolli dokumentatsiooni](https://www.v2fly.org/en_US/developer/protocols/vmess.html) järgi sisaldab kliendi päringu päis krüpteeritud autentimistunnust, mis on koostatud Unixi ajatemplist, juhuslikust arvust ja kontrollsummast ning krüpteeritud võtmega, mis tuletatakse kasutaja ID-st. Server tunneb selle järgi kasutaja ära, seejärel dekrüpteerib ülejäänud päise ja andmed.

Dokumentatsioon kirjeldab kahte viisi päise kaitsmiseks. Tänapäevane kasutab AEAD-krüpteerimist, mis tagab, et päist ei ole muudetud. Vanem kasutas MD5 ja AES-128-CFB ning ei suutnud päise terviklust tagada; dokumentatsioon hoiatab selle eest. Kuna autentimistunnus sisaldab ajatemplit, peavad kliendi ja serveri kellad olema ligikaudu sünkroonis. See on sage põhjus, miks „see lihtsalt ei ühendu“.

## Kui raske on VMessi blokeerida?

Iseenesest näeb VMess välja nagu juhuslikud baidid, mis paneb selle samasse olukorda kui [Shadowsocks](/vpn-protocols/shadowsocks): tulemüürid, mis blokeerivad täielikult krüpteeritud liiklust, näevad seda. Seepärast paigaldatakse VMess tavaliselt WebSocketi või gRPC sisse TLS-i peal, domeeni ja sertifikaadi taha, nii et vaatleja näeb midagi, mis näeb välja nagu tavaline HTTPS-ühendus veebisaidiga.

Liikluse peitmise töö teeb ära peamiselt see ümbris, ja sellega kaasnevad kulud: vaja on domeeni, sertifikaati ja sageli CDN-i serveri ees, ning server krüpteerib andmed kaks korda, korra TLS-i jaoks ja korra VMessi jaoks.

## VMess, VLESS või Trojan?

[VLESS](/vpn-protocols/vless-reality) kavandas Xray projekt kergema järglasena: see säilitab UUID-põhise identiteedi, kuid loobub VMessi enda krüpteerimisest ja toetub täielikult TLS-kihile, mis väldib topeltkrüpteerimist. [Trojan](/vpn-protocols/trojan) kasutab sarnast lähenemist, parooliga UUID asemel. Meie võrdlus [VLESS, VMess ja Trojan](/blog/vless-vs-vmess-vs-trojan) läheb üksikasjadesse.

## Kas Doppler kasutab VMessi?

Ei. Doppler kasutab VLESSi koos Realityga. Juhend [miks VLESS](/vpn-protocols/why-vless) selgitab, miks.
