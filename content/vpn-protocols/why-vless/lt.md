> **Trumpai.** Kūrėme Doppler žmonėms tinkluose, kuriuose blokuojami VPN. Tokiuose tinkluose klausimas ne tas, kuris protokolas popieriuje greičiausias, o tas, kuris rytoj vis dar bus prisijungęs. Pasirinkome VLESS su Reality, nes jis cenzoriui palieka mažiausiai ką atpažinti ir mažiausiai ką užblokuoti, ir priimame su tuo susijusius kompromisus.

## Kam rinkomės?

Doppler skirtas žmonėms, kurie jungiasi iš vietų, kur VPN filtruojami tyčia: Rusijos, Irano, Kinijos ir dalies Persijos įlankos šalių. Tokiuose tinkluose šifravimas yra lengvoji dalis. Kiekvienas protokolas mūsų [palyginime](/vpn-protocols) šifruoja gerai. Juos skiria tai, ar filtravimo sistema gali atpažinti, kad ryšys yra VPN, ir ką ji gali užblokuoti, kai atpažįsta.

Todėl kiekvieną variantą vertinome pagal tris klausimus:

1. **Ar jis turi fiksuotą atspaudą?** Fiksuoto dydžio rankos paspaudimą arba standartinį prievadą atitinka viena taisyklė.
2. **Kas nutinka, kai cenzorius zonduoja serverį?** Ugniasienės pačios jungiasi prie įtariamų proksi, kad pamatytų, kaip jie atsako.
3. **Ar yra ką įtraukti į blokavimo sąrašą?** Domenas, sertifikatas arba atpažįstamas serveris yra taikinys, net jei pats srautas gerai paslėptas.

## Kodėl ne WireGuard, OpenVPN ar IKEv2?

Visi trys nepraeina pirmojo klausimo. [WireGuard](/vpn-protocols/wireguard) rankos paspaudimo paketai visada yra 148 ir 92 baitai. [OpenVPN](/vpn-protocols/openvpn) tyrėjai, dirbę tikro interneto tiekėjo viduje, atpažino daugiau kaip 85% srautų. [IKEv2](/vpn-protocols/ikev2) veikia standartiniais UDP prievadais, kuriuos visus galima atmesti iš karto. 2023 m. rugpjūtį naudotojai Rusijoje [pranešė](https://github.com/net4people/bbs/issues/274), kad operatoriai nutraukia WireGuard ir OpenVPN per pirmuosius paketus. Tai geri protokolai atviriems tinklams. Mūsų tinklams jie nebuvo kurti.

## Kodėl ne Shadowsocks ar VMess?

Jie praeina pirmąjį klausimą, nes atrodo kaip atsitiktiniai baitai, ir tai pasirodė esąs atskiras atspaudas. Nuo 2021 m. lapkričio Didžioji ugniasienė [blokuoja visiškai užšifruotą srautą](https://gfw.report/publications/usenixsecurity23/en/), kuris nepanašus į jokį žinomą protokolą. [VMess](/vpn-protocols/vmess) galima įvynioti į TLS, kad to išvengtų, bet tada jam reikia domeno, ir grįžtame prie trečiojo klausimo.

## Kodėl ne Trojan?

[Trojan](/vpn-protocols/trojan) į du pirmus klausimus atsako gerai: tai tikras TLS, o zondai mato tikrą svetainę. Bet kiekvienam Trojan serveriui reikia savo domeno ir sertifikato. Kai cenzorius sužino tą domeną, jis gali jį užblokuoti, o daugybės domenų palaikymas virsta nuolatinėmis lenktynėmis.

## Ką VLESS-Reality daro teisingai

[VLESS-Reality](/vpn-protocols/vless-reality) atsako į visus tris:

- **Nėra fiksuoto atspaudo.** Ryšys yra TLS 1.3 per TCP — dažniausias šifruotas srautas internete.
- **Zondai mato tikrą svetainę.** Reality visus, kurie negali autentifikuotis, nukreipia į tikrą svetainę, kurios rankos paspaudimą skolinasi, su tos svetainės tikru sertifikatu.
- **Nėra ko užblokuoti pagal pavadinimą.** Rankos paspaudime nėra nei Doppler domeno, nei sertifikato.

Be to, jis veikia per TCP, todėl veikia toliau tinkluose, kurie sulėtina arba blokuoja UDP ir kuriuose sunkiai sekasi [Hysteria 2](/vpn-protocols/hysteria2) bei [AmneziaWG](/vpn-protocols/amneziawg). O pats VLESS yra mažas: šifravimui jis remiasi TLS, užuot pridėjęs savą, todėl dvigubo šifravimo nėra.

## Ko atsisakėme

- **Gryno greičio kanaluose su paketų praradimais.** TCP po paketų praradimo atsistato prasčiau nei QUIC ar WireGuard UDP. Švariame ryšyje skirtumas mažas; prastame jis gali būti pastebimas.
- **Įtaisyto palaikymo operacinėje sistemoje.** Jokia operacinė sistema nepateikia VLESS kliento, todėl reikia programėlės. Nusprendėme, kad tai priimtina, ir sukūrėme savas programėles iOS, Android, macOS ir Windows.
- **Tobulo nematomumo.** Jo nėra. Tyrimai parodė, kad [TLS TLS viduje galima atpažinti](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), o 2025 m. lapkritį [pranešta](https://github.com/net4people/bbs/issues/546), kad kai kurie Rusijos interneto tiekėjai nutraukia Reality ryšius. VLESS-Reality yra atsparumo cenzūrai architektūra, o ne garantija.

## Ką darome su šiomis ribomis

Cenzūra kinta, todėl protokolo pasirinkimas nėra darbo pabaiga. Keičiame serverių nuostatas ir svetaines, kurių rankos paspaudimą Reality skolinasi, kai filtravimas keičiasi, ir toliau stebime tuos pačius tyrimus bei bendruomenės pranešimus, cituojamus šiuose puslapiuose. Jei atsiras geresnis būdas, tai bus parašyta šiame puslapyje.

Visą techninę istoriją, kaip veikia VLESS-Reality, skaitykite [VLESS-Reality tunelyje](/how-it-works/vless-reality-tunnel). Išbandyti — puslapyje [VLESS VPN](/vless-vpn).
