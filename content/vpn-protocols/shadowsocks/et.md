> **Lühidalt.** Shadowsocks on kerge krüpteeritud puhverserver, mis loodi Hiinas Hiina suure tulemüüri läbimiseks. Aastaid töötas see selle poolest, et ei näinud välja millegi moodi. Alates 2021. aastast näitavad uuringud, et tulemüür blokeerib just sellist liiklust, sest päris liiklus on harva nii juhuslik.

## Mis on Shadowsocks?

Shadowsocks on avatud lähtekoodiga puhverserveri protokoll, mis ilmus esimest korda [2012. aasta aprillis](https://en.wikipedia.org/wiki/Shadowsocks). Rangelt võttes ei ole see VPN: see on SOCKS5-laadne puhverserver krüpteeringuga ning rakendused otsustavad, millise liikluse sealt läbi saata. Praktikas pakub enamik Shadowsocksi kliente nüüd kogu süsteemi hõlmavat režiimi, mis käitub nagu VPN.

See on populaarne, sest see on lihtne ja kiire. Praegused versioonid kasutavad [AEAD-šifreid](https://shadowsocks.org/doc/aead.html), mis annavad ühe sammuga konfidentsiaalsuse, tervikluse ja autentsuse, ning protokolli [2022. aasta väljaanne](https://shadowsocks.org/doc/sip022.html) tugevdas kordusesituse kaitset.

## Kuidas see töötab?

Kliendil ja serveril on ühine parool, millest tehakse krüpteerimisvõti. Kõik, mida klient saadab, sealhulgas soovitud veebisaidi aadress, on krüpteeritud alates kõige esimesest baidist. Ei ole äratuntavat käepigistust, sertifikaati ega avateksti päist. Vaatlejale on Shadowsocksi ühendus juhuslikena näivate baitide voog.

## Kuidas Hiina suur tulemüür Shadowsocksi ära tunneb?

Esiteks aktiivse sondeerimisega. GFW Reporti uurijad [salvestasid](https://gfw.report/publications/imc20/en/), kuidas tulemüür saatis kümneid tuhandeid sonde kahtlustatavatele Shadowsocksi serveritele, esitades uuesti ja muutes päris ühendusi, et näha, kuidas server reageerib.

Seejärel, alates 2021. aasta novembrist, jämedama ja laiema meetodiga. [USENIX Security 2023 uuring](https://gfw.report/publications/usenixsecurity23/en/) leidis, et tulemüür blokeerib reaalajas „täielikult krüpteeritud“ liiklust. See vaatab ühenduse esimest paketti ja jätab välja kõik, mis näeb välja nagu tuntud protokoll või sisaldab piisavalt trükitavat teksti. Üks reegel mõõdab seatud bittide keskmist arvu baidi kohta: väärtused, mis on 3,4 või väiksemad või 4,6 või suuremad, jäetakse välja, juhuslikuna näivaid andmeid nende vahel aga välja ei jäeta. Kõik, mis järele jääb, võib blokeerida.

Uurijad leidsid ka, et tulemüür rakendas seda umbes 26% ühendustest ja ainult populaarsete andmekeskuste IP-vahemikele, ilmselt kaaskahju piiramiseks. Õppetund protokollide loojatele oli selge: juhuslikuna näimine on ise sõrmejälg.

## Millal Shadowsocksi kasutada?

- **Kergeks kiireks puhverdamiseks** võrkudes, mis liiklust tähelepanelikult ei uuri.
- **Oma serveri pidamiseks** tööriistadega nagu Outline, mis teevad seadistuse lihtsaks.
- **Ettevaatlikult tugeva filtreerimise all.** Hiinas ja mujal, kus blokeeritakse täielikult krüpteeritud liiklust, on Shadowsocks palju vähem usaldusväärne kui protokollid, mis jäljendavad päris TLS-i, näiteks [VLESS-Reality](/vpn-protocols/vless-reality). Meie [tsensuuriprotokollide ajalugu](/blog/censorship-protocol-history) jälgib, kuidas see valdkond edasi liikus.

## Kas Doppler kasutab Shadowsocksi?

Ei. Doppler kasutab VLESS-Realityt, põhjustel, mis on juhendis [miks VLESS](/vpn-protocols/why-vless).
