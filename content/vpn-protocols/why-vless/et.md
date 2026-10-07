> **Lühidalt.** Me ehitasime Doppleri inimeste jaoks, kes on võrkudes, mis blokeerivad VPN-e. Nendes võrkudes ei ole küsimus selles, milline protokoll on paberil kiireim, vaid selles, milline on homme ikka veel ühendatud. Me valisime VLESSi koos Realityga, sest see annab tsensorile kõige vähem, mida ära tunda, ja kõige vähem, mida blokeerida, ning me võtame vastu kompromissid, mis sellega kaasnevad.

## Mille jaoks me valisime?

Doppler on loodud inimestele, kes ühenduvad kohtadest, kus VPN-e filtreeritakse meelega: Venemaa, Iraan, Hiina, osa Pärsia lahe riike. Nendes võrkudes on krüpteerimine lihtne osa. Iga protokoll meie [võrdluses](/vpn-protocols) krüpteerib hästi. Neid eristab see, kas filtreerimissüsteem saab aru, et ühendus on VPN, ja mida see saab blokeerida, kui saab.

Seepärast hindasime iga varianti kolme küsimuse järgi:

1. **Kas sellel on fikseeritud sõrmejälg?** Fikseeritud suurusega käepigistuse või standardse pordi tabab üksainus reegel.
2. **Mis juhtub, kui tsensor serverit sondeerib?** Tulemüürid ühenduvad ise kahtlustatavate puhverserveritega, et näha, kuidas need vastavad.
3. **Kas on midagi, mida blokeerimisnimekirja panna?** Domeen, sertifikaat või äratuntav server on sihtmärk isegi siis, kui liiklus ise on hästi peidetud.

## Miks mitte WireGuard, OpenVPN või IKEv2?

Kõik kolm kukuvad esimesel küsimusel läbi. Protokolli [WireGuard](/vpn-protocols/wireguard) käepigistuse paketid on alati 148 ja 92 baiti. [OpenVPN](/vpn-protocols/openvpn) tuvastati enam kui 85% voogudest uurijate poolt, kes töötasid päris internetiteenuse pakkuja sees. [IKEv2](/vpn-protocols/ikev2) töötab standardsetel UDP-portidel, mida saab tervikuna ära visata. 2023. aasta augustis [teatasid](https://github.com/net4people/bbs/issues/274) kasutajad Venemaal, et operaatorid katkestavad WireGuardi ja OpenVPN-i esimeste pakettide jooksul. Need on head protokollid avatud võrkude jaoks. Meie võrkude jaoks neid ei loodud.

## Miks mitte Shadowsocks või VMess?

Need läbivad esimese küsimuse, nähes välja nagu juhuslikud baidid, ja see osutus omaette sõrmejäljeks. Alates 2021. aasta novembrist on Hiina suur tulemüür [blokeerinud täielikult krüpteeritud liiklust](https://gfw.report/publications/usenixsecurity23/en/), mis ei sarnane ühegi tuntud protokolliga. Protokolli [VMess](/vpn-protocols/vmess) saab selle vältimiseks TLS-i mähkida, kuid siis vajab see domeeni, mis toob meid kolmanda küsimuse juurde.

## Miks mitte Trojan?

[Trojan](/vpn-protocols/trojan) vastab kahele esimesele küsimusele hästi: see on päris TLS ja sondid näevad päris veebisaiti. Kuid iga Trojani server vajab oma domeeni ja sertifikaati. Kui tsensor selle domeeni teada saab, saab ta selle blokeerida, ja paljude domeenide pidamine on pidev tagaajamine.

## Mida VLESS-Reality õigesti teeb

[VLESS-Reality](/vpn-protocols/vless-reality) vastab kõigile kolmele:

- **Fikseeritud sõrmejälge ei ole.** Ühendus on TLS 1.3 TCP kaudu, interneti kõige tavalisem krüpteeritud liiklus.
- **Sondid näevad päris veebisaiti.** Reality suunab kõik, kes autentida ei saa, päris saidile, mille käepigistust see laenab, selle saidi ehtsa sertifikaadiga.
- **Meie poolt pole midagi, mida nime järgi blokeerida.** Käepigistuses ei ole Doppleri domeeni ega sertifikaati.

See töötab ka TCP kaudu, nii et see töötab edasi võrkudes, mis aeglustavad või blokeerivad UDP-d, kus [Hysteria 2](/vpn-protocols/hysteria2) ja [AmneziaWG](/vpn-protocols/amneziawg) jäävad hätta. Ja VLESS ise on väike: see toetub krüpteerimisel TLS-ile, selle asemel et lisada enda oma, nii et topeltkrüpteerimist ei ole.

## Millest me loobusime

- **Toorkiirusest kadudega ühendustel.** TCP taastub paketikadudest vähem sujuvalt kui QUIC või WireGuardi UDP. Puhtal ühendusel on vahe väike; kehval võib see olla märgatav.
- **Sisseehitatud toest operatsioonisüsteemis.** Ükski operatsioonisüsteem ei tule VLESSi kliendiga kaasa, nii et vaja on rakendust. Me otsustasime, et see on vastuvõetav, ja ehitasime enda rakendused iOS-i, Androidi, macOS-i ja Windowsi jaoks.
- **Täielikust nähtamatusest.** Seda ei ole olemas. Uuringud on näidanud, et [TLS-i TLS-i sees saab sõrmejälje järgi ära tunda](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), ning 2025. aasta novembris [teatati](https://github.com/net4people/bbs/issues/546), et mõned Venemaa internetiteenuse pakkujad katkestavad Reality ühendusi. VLESS-Reality on tsensuurikindluse lahendus, mitte garantii.

## Mida me nende piiridega teeme

Tsensuur muutub, nii et protokolli valik ei ole töö lõpp. Me kohandame serveriseadeid ja saite, mille käepigistust Reality laenab, kui filtreerimine muutub, ning jälgime samu uuringuid ja kogukonna teateid, millele need lehed viitavad. Kui ilmub parem lähenemine, ütleb see leht seda.

VLESS-Reality toimimise täielik tehniline lugu on juhendis [VLESS-Reality tunnel](/how-it-works/vless-reality-tunnel). Proovimiseks vaadake [VLESS VPN](/vless-vpn).
