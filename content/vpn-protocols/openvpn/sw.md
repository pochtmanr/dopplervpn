> **Muhtasari.** OpenVPN ni mkongwe wa VPN za chanzo huria: inayoweza kusanidiwa kwa njia nyingi, inayoungwa mkono kote, na inayoeleweka vizuri baada ya zaidi ya miongo miwili. Pia ni ya polepole kuliko itifaki mpya, na kwa mujibu wa utafiti uliochapishwa, ni mojawapo ya zilizo rahisi zaidi kwa mtoa huduma wa intaneti (ISP) kuzitambua kwa alama.

## OpenVPN ni nini?

OpenVPN ni programu huria ya VPN ya chanzo wazi iliyotolewa kwa mara ya kwanza na James Yonan [mwezi Mei 2001](https://en.wikipedia.org/wiki/OpenVPN). Kwa sehemu kubwa ya miaka ya 2000 na 2010 ilikuwa chaguo la kawaida kwa huduma za kibiashara za VPN na ufikiaji wa mbali wa mashirika, na bado inajumuishwa kwenye ruta nyingi na bidhaa za biashara.

Huendeshwa katika nafasi ya mtumiaji badala ya ndani ya kerneli ya mfumo wa uendeshaji, na hutegemea maktaba ya OpenSSL na itifaki ya TLS kwa kubadilishana funguo. Mlango uliopangiwa na IANA ni 1194, ingawa OpenVPN inaweza kuendeshwa kupitia UDP au TCP kwenye takriban mlango wowote.

## Inafanyaje kazi?

OpenVPN hutumia itifaki maalum yenye sehemu mbili. Njia ya udhibiti hutumia TLS kuthibitisha pande mbili, kwa kawaida kwa vyeti, na kukubaliana kuhusu funguo. Kisha njia ya data hubeba trafiki yako, iliyosimbwa kwa funguo hizo, ndani ya pakiti za UDP au TCP.

Muundo huo hufanya OpenVPN iweze kusanidiwa sana. Unaweza kuchagua njia za usimbaji fiche, mbinu za uthibitishaji, milango na usafirishaji, na kuiendesha kupitia seva mbadala. Gharama ya unyumbufu huo ni ugumu: msimbo mwingi zaidi, mipangilio mingi zaidi, na njia nyingi zaidi za kuishia na usanidi dhaifu.

## Kwa nini OpenVPN huzuiwa?

TLS ndani ya OpenVPN si sawa na kutembelea tovuti kupitia HTTPS. OpenVPN hufunika mpeano wake wa mkono wa TLS katika mfumo wake wa kupanga pakiti, kwa hiyo trafiki yake ina umbo ambalo trafiki ya kawaida ya wavuti haina.

Watafiti walipima umuhimu wa jambo hilo. Timu kutoka Chuo Kikuu cha Michigan na wengine [ilijenga mfumo wa kutambua kwa alama](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) na kuuendesha ndani ya ISP inayohudumia watumiaji takriban milioni moja. Ulitambua **zaidi ya 85% ya mtiririko wa OpenVPN** kukiwa na chanya chache sana za uongo, na pia ulikamata sehemu kubwa ya usanidi wa kibiashara wa OpenVPN "ulioficha" ambao walijaribu.

Uchujaji wa ulimwengu halisi unafuata utafiti huo. Mnamo Agosti 2023 watumiaji nchini Urusi [waliripoti](https://github.com/net4people/bbs/issues/274) watoa huduma wa simu wakikata miunganisho ya OpenVPN muda mfupi baada ya kuanza.

## Wakati gani utumie OpenVPN?

- **Utangamano.** Ruta za zamani, lango za biashara na baadhi ya mitandao ya mashirika huunga mkono OpenVPN na hakuna kingine kipya zaidi.
- **Mitandao ya TCP pekee.** OpenVPN inaweza kuendeshwa kupitia TCP wakati UDP imezuiwa, jambo ambalo [WireGuard](/vpn-protocols/wireguard) haiwezi kufanya bila msaada.
- **Si kwenye mitandao inayochujwa.** Mahali ambapo VPN zimezuiwa, OpenVPN huwa inashindwa mapema. Itifaki inayoiga trafiki ya kawaida ya wavuti, kama [VLESS-Reality](/vpn-protocols/vless-reality), ndiyo zana bora zaidi. [Mwongozo wetu wa udhibiti](/bypass-censorship) unaeleza jinsi mifumo ya uchujaji inavyoamua nini cha kukata.

## Je, Doppler hutumia OpenVPN?

Hapana. Doppler hutumia VLESS-Reality kwenye kila jukwaa. Mwongozo wa [kwa nini VLESS](/vpn-protocols/why-vless) unaeleza jinsi tulivyoichagua.
