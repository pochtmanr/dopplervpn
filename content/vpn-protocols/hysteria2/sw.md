> **Muhtasari.** Hysteria 2 ni itifaki ya proksi iliyojengwa juu ya QUIC, usafirishaji ulio nyuma ya HTTP/3. Imeundwa kwa kasi kwenye miunganisho mibaya na yenye upotevu, na kwa yeyote asiye na nenosiri seva yake hutenda kama tovuti ya kawaida ya HTTP/3. Sehemu yake dhaifu ni kwamba inategemea UDP, ambayo mitandao mingine huipunguza kasi au kuizuia kabisa.

## Hysteria 2 ni nini?

Hysteria ni mradi wa chanzo huria kutoka [apernet](https://github.com/apernet/hysteria); toleo la 2, itifaki iliyoundwa upya, lilitolewa mwezi Septemba 2023. Kama Shadowsocks na VLESS, ni proksi si VPN ya jadi, na wateja wanaweza kuelekeza kifaa kizima kupitia hiyo.

## Inafanyaje kazi?

Kwa mujibu wa [vipimo vyake vya itifaki](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 inaendeshwa juu ya QUIC kama ilivyobainishwa katika [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), pamoja na kiendelezi cha datagramu isiyotegemeka kwa trafiki ya UDP. QUIC tayari hutoa usimbaji fiche wa TLS 1.3, mitiririko mingi kwa wakati mmoja na uanzishaji wa haraka wa muunganisho.

Uthibitishaji ndipo kujificha kunapoingia. Vipimo vinahitaji kwamba seva ya Hysteria **lazima itekeleze seva halisi ya HTTP/3** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) na kushughulikia maombi jinsi seva yoyote ya wavuti ingefanya. Mteja huthibitisha kwa ombi maalum la HTTP/3; mtu mwingine yeyote, awe mgeni mwenye udadisi au uchunguzi hai, hupata majibu ya kawaida ya wavuti. Vipimo vinasema kwamba, kwa mtu wa tatu asiye na vitambulisho, seva hutenda kama tu seva ya kawaida ya wavuti ya HTTP/3.

## Kwa nini ni ya kasi?

QUIC inaendeshwa juu ya UDP na hupona kutokana na upotevu wa pakiti bila kusimamisha kila mtiririko jinsi TCP inavyofanya. Hysteria inaweza pia kutumia udhibiti wake wa msongamano, unaolenga viungo visivyo thabiti, hivyo huwa inashikilia kasi yake kwenye mitandao ya simu iliyojaa, njia za umbali mrefu na Wi-Fi yenye mwingiliano, pale itifaki zinazotegemea TCP zinapopungua kasi.

## Ni vigumu kiasi gani kuzuia Hysteria 2?

Dhidi ya uchunguzi hai inasimama vizuri, kwa kuwa uchunguzi huona seva ya wavuti. Ufichuzi ni usafirishaji. Mdhibiti anaweza kupunguza kasi au kuzuia UDP, au QUIC mahususi, bila kuvunja tovuti nyingi, kwa sababu vivinjari hurudi kwenye HTTP/2 juu ya TCP wakati HTTP/3 inaposhindwa. Pale hilo linapotokea, Hysteria 2 haina pa kwenda, ilhali itifaki zinazotegemea TCP kama [VLESS-Reality](/vpn-protocols/vless-reality) zinaendelea kufanya kazi.

## Wakati gani utumie Hysteria 2?

- **Viungo vyenye upotevu au vya umbali mrefu**, ambapo udhibiti wake wa msongamano na uponyaji wa upotevu wa QUIC unalipa.
- **Mitandao inayoruhusu UDP.** Angalia kabla ya kuitegemea.
- Kama itifaki ya pili pamoja na chaguo la TCP, ili uweze kubadili UDP inapochujwa. [Mwongozo wetu wa udhibiti](/bypass-censorship) unaeleza jinsi vichujio vinavyolenga usafirishaji.

## Je, Doppler hutumia Hysteria 2?

Hapana. Doppler hutumia VLESS-Reality juu ya TCP, inayoendelea kufanya kazi kwenye mitandao inayozuia UDP. Tazama [kwa nini VLESS](/vpn-protocols/why-vless).
