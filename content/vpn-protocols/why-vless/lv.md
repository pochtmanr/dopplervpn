> **Īsumā.** Mēs veidojām Doppler cilvēkiem tīklos, kas bloķē VPN. Šajos tīklos jautājums nav, kurš protokols uz papīra ir ātrākais, bet kurš rīt joprojām ir savienots. Mēs izvēlējāmies VLESS ar Reality, jo tas cenzoram dod vismazāk, ko atpazīt, un vismazāk, ko bloķēt, un mēs pieņemam kompromisus, kas ar to nāk.

## Kam mēs izvēlējāmies?

Doppler ir veidots cilvēkiem, kuri savienojas no vietām, kur VPN filtrē ar nolūku: Krievija, Irāna, Ķīna, Persijas līča daļa. Šajos tīklos šifrēšana ir vieglā daļa. Katrs protokols mūsu [salīdzinājumā](/vpn-protocols) šifrē labi. Tos šķir tas, vai filtrēšanas sistēma var pateikt, ka savienojums ir VPN, un ko tā var bloķēt, kad to ir pateikusi.

Tāpēc mēs vērtējām katru variantu pēc trim jautājumiem:

1. **Vai tam ir fiksēts pirkstu nospiedums?** Fiksēta izmēra rokasspiedienu vai standarta portu var saskaņot ar vienu noteikumu.
2. **Kas notiek, kad cenzors zondē serveri?** Ugunsmūri aktīvi savienojas ar aizdomīgiem starpniekiem, lai redzētu, kā tie atbild.
3. **Vai ir kaut kas, ko likt bloķēšanas sarakstā?** Domēns, sertifikāts vai atpazīstams serveris ir mērķis pat tad, ja pati datplūsma ir labi paslēpta.

## Kāpēc ne WireGuard, OpenVPN vai IKEv2?

Visi trīs neiztur pirmo jautājumu. [WireGuard](/vpn-protocols/wireguard) rokasspiediena paketes vienmēr ir 148 un 92 baiti. Pētnieki, kas strādāja īsta interneta pakalpojumu sniedzēja iekšienē, vairāk nekā 85% plūsmu atpazina [OpenVPN](/vpn-protocols/openvpn). [IKEv2](/vpn-protocols/ikev2) darbojas standarta UDP portos, kurus var atmest visus uzreiz. 2023. gada augustā lietotāji Krievijā [ziņoja](https://github.com/net4people/bbs/issues/274), ka operatori pārtrauc WireGuard un OpenVPN jau pirmajās paketēs. Tie ir labi protokoli atvērtiem tīkliem. Tie nebija veidoti mūsu tīkliem.

## Kāpēc ne Shadowsocks vai VMess?

Tie iztur pirmo jautājumu, izskatoties pēc nejaušiem baitiem, un izrādījās, ka tas pats ir pirkstu nospiedums. Kopš 2021. gada novembra Lielais ugunsmūris ir [bloķējis pilnībā šifrētu datplūsmu](https://gfw.report/publications/usenixsecurity23/en/), kas neatgādina nevienu zināmu protokolu. [VMess](/vpn-protocols/vmess) var ietīt TLS, lai no tā izvairītos, bet tad tam vajag domēnu, un tas mūs noved pie trešā jautājuma.

## Kāpēc ne Trojan?

[Trojan](/vpn-protocols/trojan) uz pirmajiem diviem jautājumiem atbild labi: tas ir īsts TLS, un zondes redz īstu vietni. Bet katram Trojan serverim vajag savu domēnu un sertifikātu. Tiklīdz cenzors uzzina šo domēnu, tas var to bloķēt, un daudzu domēnu uzturēšana ir nepārtraukta pakaļdzīšanās.

## Ko VLESS-Reality izdara pareizi

[VLESS-Reality](/vpn-protocols/vless-reality) atbild uz visiem trim:

- **Nav fiksēta pirkstu nospieduma.** Savienojums ir TLS 1.3 pa TCP — visizplatītākā šifrētā datplūsma internetā.
- **Zondes redz īstu vietni.** Reality ikvienu, kurš nevar autentificēties, pārsūta uz īsto vietni, kuras rokasspiedienu tas aizņemas, ar šīs vietnes īsto sertifikātu.
- **Nekas no mūsējā, ko bloķēt pēc nosaukuma.** Rokasspiedienā nav Doppler domēna vai sertifikāta.

Tas darbojas arī pa TCP, tāpēc turpina strādāt tīklos, kas ierobežo vai bloķē UDP, kur [Hysteria 2](/vpn-protocols/hysteria2) un [AmneziaWG](/vpn-protocols/amneziawg) grūti klājas. Un pats VLESS ir mazs: šifrēšanai tas paļaujas uz TLS, nevis pievieno savu, tāpēc nav dubultās šifrēšanas.

## No kā mēs atteicāmies

- **Tīrs ātrums zudumiem bagātos savienojumos.** TCP atgūstas no pakešu zuduma mazāk veikli nekā QUIC vai WireGuard UDP. Tīrā savienojumā starpība ir maza; sliktā tā var būt manāma.
- **Iebūvēts operētājsistēmas atbalsts.** Neviena operētājsistēma nepiegādā VLESS klientu, tāpēc vajag lietotni. Mēs nolēmām, ka tas ir pieņemami, un uzbūvējām savu lietotni iOS, Android, macOS un Windows.
- **Pilnīga neredzamība.** Tā nepastāv. Pētījumi ir parādījuši, ka [TLS iekš TLS var atpazīt pēc pirkstu nospieduma](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), un 2025. gada novembrī par dažiem Krievijas interneta pakalpojumu sniedzējiem [ziņoja](https://github.com/net4people/bbs/issues/546), ka tie pārtrauc Reality savienojumus. VLESS-Reality ir cenzūras pretestības risinājums, nevis garantija.

## Ko mēs darām ar šīm robežām

Cenzūra mainās, tāpēc protokola izvēle nav darba beigas. Mēs pielāgojam servera iestatījumus un vietnes, kuras Reality aizņemas, kad filtrēšana mainās, un turpinām sekot tiem pašiem pētījumiem un kopienas ziņojumiem, uz kuriem atsaucas šīs lapas. Ja parādīsies labāka pieeja, šī lapa to pateiks.

Pilnam tehniskajam stāstam par to, kā darbojas VLESS-Reality, lasiet [VLESS-Reality tuneli](/how-it-works/vless-reality-tunnel). Lai to izmēģinātu, skatiet [VLESS VPN](/vless-vpn).
