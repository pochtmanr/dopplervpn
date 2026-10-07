> **Muhtasari.** IKEv2/IPsec ni VPN ambayo simu na kompyuta yako ya mkononi tayari zinajua kuitumia bila programu yoyote. Ni ya kasi na hushughulikia vizuri kubadili kati ya Wi-Fi na data ya simu. Pia huendeshwa kwenye milango isiyobadilika inayojulikana sana, jambo linalofanya iwe mojawapo ya itifaki rahisi zaidi kwa mdhibiti kuzuia.

## IKEv2/IPsec ni nini?

"IKEv2" kwa kweli ni vipande viwili vinavyofanya kazi pamoja. IPsec ni seti inayosimba na kuthibitisha pakiti za IP. IKE, yaani Internet Key Exchange, ni itifaki ambayo pande mbili hutumia kuthibitishana na kukubaliana kuhusu funguo za IPsec. Toleo la 2 la IKE lilisanifishwa [mwezi Desemba 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), na vipimo vya sasa ni [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Kwa kuwa ni kiwango cha IETF, IKEv2 imejengwa ndani ya iOS, macOS na Windows, na ndani ya Android tangu toleo la 11. Lango nyingi za VPN za mashirika huitumia.

## Inafanyaje kazi?

Ubadilishanaji wa funguo hufanyika kupitia UDP, [kwa kawaida kwenye mlango 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Pande mbili zikishakubaliana kuhusu funguo, mfumo wa IPsec wa mfumo wa uendeshaji husimba trafiki yako kwa kutumia Encapsulating Security Payload (ESP). Kukiwa na ruta ya NAT njiani, kama ilivyo kwenye karibu kila mtandao wa nyumbani na wa simu, IKE na ESP zote hufunikwa ndani ya UDP kwenye mlango 4500.

IKEv2 ina kiendelezi cha kawaida kiitwacho [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) kinachoruhusu muunganisho kuendelea baada ya anwani ya IP kubadilika. Ndiyo sababu IKEv2 ni nzuri kwenye simu: ukitoka nje ya eneo la Wi-Fi na kuingia kwenye data ya simu, handaki huendelea badala ya kuunganisha upya kutoka mwanzo.

## Kwa nini IKEv2 ni rahisi kuzuia?

IKEv2 haijaribu kuonekana kama kitu kingine chochote. Trafiki yake hutumia milango ya UDP inayojulikana sana na ina miundo ya kawaida ya IKE na ESP ambayo zana yoyote ya mtandao inaweza kuichanganua. Kuizuia hakuhitaji hata ukaguzi wa kina wa pakiti: kichujio kinaweza kuangusha milango ya UDP 500 na 4500, au kutambua moja kwa moja ubadilishanaji wa IKE.

Hiyo ni gharama inayokubalika kwa mitandao ya mashirika na kusafiri katika nchi zilizo wazi, ambako kutambuliwa kuwa VPN hakuna gharama. Kwenye mitandao inayochuja VPN kwa makusudi, kwa kawaida ndicho kitu cha kwanza kuacha kufanya kazi.

## Wakati gani utumie IKEv2?

- **Programu hairuhusiwi.** Kwenye kifaa kinachosimamiwa ambapo huwezi kusakinisha programu, mteja wa IKEv2 aliyejengwa ndani anaweza kuwa chaguo pekee.
- **Kuhama kwenye mitandao iliyo wazi ukiwa kwenye simu.** MOBIKE hufanya mpito uwe laini unapohama kati ya mitandao.
- **Bila udhibiti.** Kwenye mitandao inayochujwa, chagua itifaki iliyoundwa kuchanganyika na trafiki nyingine, kama [VLESS-Reality](/vpn-protocols/vless-reality). [Mwongozo wetu wa udhibiti](/bypass-censorship) unaeleza jinsi uzuiaji unavyofanya kazi.

## Je, Doppler hutumia IKEv2?

Hapana. Doppler huunganisha kwa VLESS-Reality ndani ya programu zake zenyewe. Tazama [kwa nini VLESS](/vpn-protocols/why-vless) kwa sababu zake.
