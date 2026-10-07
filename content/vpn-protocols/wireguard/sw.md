> **Muhtasari.** WireGuard ndiyo itifaki ya VPN ya kawaida iliyo ya kasi zaidi na rahisi zaidi, na kwenye mtandao usiochujwa ni chaguo bora. Hata hivyo, haikuundwa ili kuficha kwamba ni VPN, na nchini Urusi, Iran na China ni miongoni mwa itifaki za kwanza kuzuiwa.

## WireGuard ni nini?

WireGuard ni itifaki ya VPN iliyoandikwa na Jason A. Donenfeld na kutolewa kwa mara ya kwanza mwaka 2015. Lengo lake lilikuwa kuchukua nafasi ya itifaki kubwa zenye mipangilio mingi zilizotangulia kwa kitu kidogo cha kutosha kukaguliwa. Mnamo Machi 2020 iliunganishwa [kwenye kerneli ya Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), na sasa programu rasmi zipo kwa Windows, macOS, iOS, Android na Linux.

Badala ya kuruhusu kila upande kujadiliana kuhusu seti ya njia za usimbaji fiche, WireGuard hutumia seti moja isiyobadilika ya vipengele vya kisasa. [Ukurasa wake wa itifaki](https://www.wireguard.com/protocol/) unavitaja: ChaCha20 pamoja na Poly1305 kwa usimbaji fiche, Curve25519 kwa kubadilishana funguo, na BLAKE2s kwa uchakataji wa hashi. Hakuna cha kupanga vibaya, na hakuna chaguo la zamani, dhaifu zaidi, la kurejelea.

## Inafanyaje kazi?

Kila kifaa kina jozi ya funguo, kama ilivyo kwa SSH. Mteja na seva hufahamu funguo za umma za kila upande mapema, na mpeano wa mkono unategemea mfumo wa itifaki wa Noise (ukurasa wa itifaki unataja muundo kamili, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Pakiti zote hutumwa kupitia UDP](https://www.wireguard.com/protocol/), na kipindi kipya huanzishwa kwa safari moja tu ya kwenda na kurudi.

Muundo huo ndio unaofanya WireGuard ihisike ya kasi. Kuna kidogo cha kujadiliana, msimbo huendeshwa ndani ya kerneli ya mfumo wa uendeshaji kwenye Linux, na kuhama kati ya Wi-Fi na data ya simu hushughulikiwa kimya kimya kwa sababu itifaki haiweki muunganisho wa muda mrefu wazi.

## Kwa nini WireGuard huzuiwa?

Urahisi uleule unaofanya WireGuard iwe rahisi kukaguliwa unaifanya pia iwe rahisi kutambuliwa. [Waraka wake wa kiufundi](https://www.wireguard.com/papers/wireguard.pdf) unabainisha ujumbe wa mpeano wa mkono baiti kwa baiti, kwa hiyo pakiti ya kwanza kutoka kwa mteja ni ya baiti 148 kila mara na jibu ni la baiti 92 kila mara, kila moja ikianza na sehemu ya aina ya ujumbe isiyobadilika. Mfumo wa ukaguzi wa kina wa pakiti (DPI) unahitaji kanuni fupi tu kutambua mtindo huo kwenye UDP.

Wadhibiti wamefanya hivyo hasa. Mnamo Agosti 2023 watumiaji nchini Urusi [waliripoti](https://github.com/net4people/bbs/issues/274) kwamba watoa huduma wakuu wa simu walikuwa wakikata vipindi vya WireGuard mara baada ya mpeano wa mkono. Usimbaji fiche bado ulilinda yaliyomo, lakini muunganisho wenyewe ulikuwa umekwisha.

Hii ni gharama ya uamuzi wa kimuundo, si hitilafu. Waundaji wa WireGuard walichagua itifaki isiyobadilika na ndogo kabisa, na kuficha hakukuwa miongoni mwa malengo. Miradi kama [AmneziaWG](/vpn-protocols/amneziawg) hubadilisha maumbo ya pakiti ili kurejesha kiasi fulani cha kinga.

## Wakati gani utumie WireGuard?

- **Mitandao isiyochujwa.** Nyumbani, kazini, au ukisafiri katika nchi isiyozuia VPN, WireGuard ni vigumu kuishinda kwa kasi na matumizi ya betri.
- **Kujiendeshea seva mwenyewe.** Ukiendesha seva yako mwenyewe, WireGuard ni mojawapo ya itifaki rahisi zaidi kusanidi kwa usahihi.
- **Si chini ya uchujaji wa DPI.** Ikiwa mtandao wako unazuia VPN, itifaki iliyoundwa kuonekana kama trafiki ya kawaida ya wavuti, kama [VLESS-Reality](/vpn-protocols/vless-reality), inafaa zaidi. Ulinganisho wetu wa [VLESS-Reality na WireGuard](/blog/vless-reality-vs-wireguard) unaeleza kwa undani zaidi kinachopatikana na kinachopotea katika kila chaguo.

## Je, Doppler hutumia WireGuard?

Hapana. Programu za Doppler huunganisha kupitia VLESS-Reality, kwa sababu Doppler imejengwa kwa ajili ya mitandao ambako WireGuard huchujwa. Mwongozo wa [kwa nini VLESS](/vpn-protocols/why-vless) unaeleza sababu hizo.
