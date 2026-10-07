> **Muhtasari.** Tulijenga Doppler kwa ajili ya watu walio kwenye mitandao inayozuia VPN. Kwenye mitandao hiyo swali si itifaki ipi iliyo ya kasi zaidi kwenye karatasi, bali ipi bado imeunganishwa kesho. Tulichagua VLESS pamoja na Reality kwa sababu inampa mdhibiti vitu vichache zaidi vya kutambua na vichache zaidi vya kuzuia, na tunakubali maelewano yanayokuja nayo.

## Tulikuwa tunachagua kwa ajili ya nini?

Doppler imejengwa kwa ajili ya watu wanaounganisha kutoka mahali ambapo VPN huchujwa kwa makusudi: Urusi, Iran, China, sehemu za Ghuba. Kwenye mitandao hiyo, usimbaji fiche ni sehemu rahisi. Kila itifaki katika [ulinganisho](/vpn-protocols) wetu husimba vizuri. Kinachozitenganisha ni kama mfumo wa uchujaji unaweza kutambua kwamba muunganisho ni VPN, na nini unaweza kuzuia mara tu unapotambua.

Kwa hiyo tulihukumu kila chaguo kwa maswali matatu:

1. **Je, ina alama isiyobadilika?** Mpeano wa mkono wa ukubwa usiobadilika au mlango wa kawaida unaweza kulinganishwa na kanuni moja.
2. **Nini hutokea mdhibiti anapochunguza seva?** Kuta za moto huanzisha muunganisho na proksi zinazoshukiwa ili kuona jinsi zinavyojibu.
3. **Je, kuna kitu cha kuweka kwenye orodha ya zuio?** Kikoa, cheti au seva inayotambulika ni shabaha hata kama trafiki yenyewe imefichwa vizuri.

## Kwa nini si WireGuard, OpenVPN au IKEv2?

Zote tatu zinashindwa katika swali la kwanza. Pakiti za mpeano wa mkono za [WireGuard](/vpn-protocols/wireguard) daima ni baiti 148 na 92. [OpenVPN](/vpn-protocols/openvpn) ilitambuliwa katika zaidi ya 85% ya mitiririko na watafiti waliokuwa wakifanya kazi ndani ya ISP halisi. [IKEv2](/vpn-protocols/ikev2) inaendeshwa kwenye milango ya kawaida ya UDP inayoweza kuangushwa yote kwa pamoja. Mnamo Agosti 2023 watumiaji nchini Urusi [waliripoti](https://github.com/net4people/bbs/issues/274) watoa huduma wakikata WireGuard na OpenVPN ndani ya pakiti za kwanza. Hizi ni itifaki nzuri kwa mitandao iliyo wazi. Hazikuundwa kwa ajili ya mitandao yetu.

## Kwa nini si Shadowsocks au VMess?

Zinapita swali la kwanza kwa kuonekana kama baiti za nasibu, na hilo liligeuka kuwa alama yake yenyewe. Tangu Novemba 2021 Ukuta Mkubwa wa Moto [umezuia trafiki iliyosimbwa kabisa](https://gfw.report/publications/usenixsecurity23/en/) isiyofanana na itifaki yoyote inayojulikana. [VMess](/vpn-protocols/vmess) inaweza kufunikwa ndani ya TLS ili kuepuka hilo, lakini basi inahitaji kikoa, jambo linalotuleta kwenye swali la tatu.

## Kwa nini si Trojan?

[Trojan](/vpn-protocols/trojan) inajibu maswali mawili ya kwanza vizuri: ni TLS halisi, na uchunguzi huona tovuti halisi. Lakini kila seva ya Trojan inahitaji kikoa na cheti chake. Mdhibiti akishajua kikoa hicho, anaweza kukizuia, na kuendesha vikoa vingi ni kufuatana daima.

## VLESS-Reality inapata nini sawa

[VLESS-Reality](/vpn-protocols/vless-reality) inajibu yote matatu:

- **Hakuna alama isiyobadilika.** Muunganisho ni TLS 1.3 juu ya TCP, trafiki iliyosimbwa iliyo ya kawaida zaidi kwenye intaneti.
- **Uchunguzi huona tovuti halisi.** Reality humpeleka yeyote asiyeweza kuthibitisha kwenye tovuti halisi ambayo mpeano wake wa mkono unakopa, pamoja na cheti halisi cha tovuti hiyo.
- **Hakuna kitu chetu cha kuzuia kwa jina.** Hakuna kikoa wala cheti cha Doppler katika mpeano wa mkono.

Pia inaendeshwa juu ya TCP, hivyo inaendelea kufanya kazi kwenye mitandao inayopunguza kasi au kuzuia UDP, pale [Hysteria 2](/vpn-protocols/hysteria2) na [AmneziaWG](/vpn-protocols/amneziawg) zinapotaabika. Na VLESS yenyewe ni ndogo: inategemea TLS kwa usimbaji fiche badala ya kuongeza wake, hivyo hakuna usimbaji fiche mara mbili.

## Tuliacha nini

- **Kasi ghafi kwenye viungo vyenye upotevu.** TCP hupona kutokana na upotevu wa pakiti kwa uzuri mdogo kuliko QUIC au UDP ya WireGuard. Kwenye muunganisho safi tofauti ni ndogo; kwenye muunganisho mbaya inaweza kuonekana.
- **Usaidizi uliojengwa ndani ya mfumo wa uendeshaji.** Hakuna mfumo wa uendeshaji unaojumuisha mteja wa VLESS, kwa hiyo unahitaji programu. Tuliamua kwamba hilo linakubalika na tukajenga zetu kwa iOS, Android, macOS na Windows.
- **Kutoonekana kikamilifu.** Hakipo. Utafiti umeonyesha kwamba [TLS ndani ya TLS inaweza kutambuliwa kwa alama](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), na mwezi Novemba 2025 baadhi ya ISP za Urusi [ziliripotiwa](https://github.com/net4people/bbs/issues/546) zikikata miunganisho ya Reality. VLESS-Reality ni muundo wa upinzani wa udhibiti, si dhamana.

## Tunafanya nini kuhusu mipaka

Udhibiti hubadilika, kwa hiyo chaguo la itifaki si mwisho wa kazi. Tunarekebisha mipangilio ya seva na tovuti ambazo Reality inakopa kadri uchujaji unavyobadilika, na tunaendelea kufuatilia utafiti ule ule na ripoti za jamii zilizotajwa kwenye kurasa hizi. Ikiwa mbinu bora itatokea, ukurasa huu utasema hivyo.

Kwa hadithi kamili ya kiufundi ya jinsi VLESS-Reality inavyofanya kazi, soma [handaki ya VLESS-Reality](/how-it-works/vless-reality-tunnel). Ili kuijaribu, tazama [VPN ya VLESS](/vless-vpn).
