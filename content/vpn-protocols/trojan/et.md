> **Lühidalt.** Trojan peidab puhverserveri liikluse päris TLS-ühendusse päris veebisaidiga, mida te kontrollite. Kes ühendub ilma paroolita, saab lihtsalt veebisaidi. See töötab hästi, kuid teil on vaja oma domeeni ja sertifikaati ning need võib üles leida ja blokeerida.

## Mis on Trojan?

Trojan on puhverserveri protokoll [trojan-gfw projektist](https://github.com/trojan-gfw/trojan), mis ilmus esimest korda 2017. aasta oktoobris. Idee on nimes: selle asemel et leiutada maskeering, peidab see end interneti kõige tavalisema krüpteeritud liikluse, HTTPS-i sisse.

## Kuidas see töötab?

[Protokolli kirjeldus](https://trojan-gfw.github.io/trojan/protocol) on lühike. Trojani server kuulab nagu tavaline HTTPS-server, päris sertifikaadiga päris domeenile. Klient teeb ehtsa TLS-käepigistuse. Seejärel saadab see krüpteeritud ühenduse sees:

- ühise parooli SHA-224 räsi kuueteistkümnendsüsteemis, mis on 56 märki,
- reavahetuse,
- väikese päringu, mis ütleb, kuhu liiklus peaks minema, SOCKS5-laadses vormingus,
- veel ühe reavahetuse, millele järgneb esimene andmejupp.

Kui räsi ja päring on kehtivad, avab server tunneli sihtkohta. Kui midagi on valesti, käsitleb server ühendust kui „teisi protokolle“ ja annab selle edasi varuveebiserverile, nii et külastaja näeb tavalist veebisaiti.

## Kui raske on Trojanit blokeerida?

Väljastpoolt on Trojani ühendus TLS-seanss teie domeeniga, teie sertifikaadiga. Aktiivsed sondid saavad vastu päris veebisaidi. See teeb Trojani palju raskemaks eristada kui protokolle, mis näevad välja juhuslikud, näiteks [Shadowsocks](/vpn-protocols/shadowsocks).

Selle nõrk koht on domeen ise. Iga server vajab domeeni ja sertifikaati ning tsensor, kes saab teada, millised domeenid kuuluvad puhverserveritele, saab need blokeerida nime või IP järgi. Uurijad on ka näidanud, et TLS TLS-i sees jätab ajastuse ja suuruse mustreid, mille järgi seda saab [sõrmejälje järgi ära tunda](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), ja see puudutab Trojanit ning sarnaseid lahendusi.

[VLESS-Reality](/vpn-protocols/vless-reality) eemaldab domeeni probleemi, laenates olemasoleva populaarse veebisaidi TLS-käepigistuse teie enda oma asemel.

## Millal Trojanit kasutada?

- **Kui te kontrollite domeeni** ja tahate lihtsat, hästi mõistetavat seadistust, mis näeb välja nagu HTTPS.
- **Mõõdukalt filtreeritud võrkudes**, kus teie domeeni tõenäoliselt sihikule ei võeta.
- Meie võrdlus [VLESS, VMess ja Trojan](/blog/vless-vs-vmess-vs-trojan) aitab, kui valite nende vahel.

## Kas Doppler kasutab Trojanit?

Ei. Doppler kasutab VLESS-Realityt, mis ei vaja oma domeeni. Vaadake [miks VLESS](/vpn-protocols/why-vless).
