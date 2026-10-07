> **Muhtasari.** VMess ni itifaki ya asili ya mradi wa V2Ray. Husimba vichwa vyake vyenyewe na kwa kawaida hufunikwa ndani ya usafirishaji mwingine, kama WebSocket juu ya TLS, ili ionekane kama trafiki ya wavuti. Bado inafanya kazi, lakini warithi wake, VLESS na Trojan, hufanya kazi ile ile kwa mzigo mdogo zaidi.

## VMess ni nini?

VMess ni itifaki ya proksi iliyosimbwa ambayo [mradi wa V2Ray](https://github.com/v2fly/v2ray-core) ulianzisha ulipoanza mwaka 2015. V2Ray ilikua kuwa jukwaa la moduli za kujenga proksi: kiini kimoja, itifaki na usafirishaji vingi, na injini ya uelekezaji inayoamua trafiki ipi inakwenda wapi. VMess ilikuwa itifaki yake ya kwanza na kwa miaka kadhaa ile kuu.

Kama Shadowsocks, VMess kitaalamu ni proksi si VPN, lakini programu zinazotegemea V2Ray zinaweza kuelekeza kifaa chako kizima kupitia hiyo.

## Inafanyaje kazi?

Kila mtumiaji ana UUID inayofanya kazi kama kitambulisho chake. Kwa mujibu wa [nyaraka za itifaki](https://www.v2fly.org/en_US/developer/protocols/vmess.html), kichwa cha ombi la mteja kinajumuisha kitambulisho cha uthibitishaji kilichosimbwa kilichojengwa kutoka muhuri wa muda wa Unix, nambari ya nasibu na checksum, kilichosimbwa kwa funguo inayotokana na kitambulisho cha mtumiaji. Seva huitumia kumtambua mtumiaji, kisha husimbua sehemu iliyobaki ya kichwa na data.

Nyaraka zinaeleza njia mbili za kulinda kichwa. Ya kisasa hutumia usimbaji fiche wa AEAD, unaohakikisha kwamba kichwa hakijabadilishwa. Ya zamani ilitumia MD5 na AES-128-CFB na haikuweza kuhakikisha uadilifu wa kichwa; nyaraka zinaonya dhidi yake. Kwa sababu kitambulisho cha uthibitishaji kinajumuisha muhuri wa muda, saa za mteja na seva zinahitaji kuwa takriban sambamba, chanzo cha kawaida cha matatizo ya "haiunganishi tu".

## Ni vigumu kiasi gani kuzuia VMess?

Peke yake, VMess inaonekana kama baiti za nasibu, jambo linaloiweka katika nafasi ile ile na [Shadowsocks](/vpn-protocols/shadowsocks): wazi kwa kuta za moto zinazozuia trafiki iliyosimbwa kabisa. Ndiyo sababu VMess kwa kawaida hutumwa ndani ya WebSocket au gRPC juu ya TLS, nyuma ya kikoa na cheti, ili mwangalizi aone kinachoonekana kama muunganisho wa kawaida wa HTTPS kwenda kwenye tovuti.

Kifuniko hicho hufanya sehemu kubwa ya kazi ya kuficha trafiki, na kinaleta gharama: unahitaji kikoa, cheti na mara nyingi CDN mbele ya seva, na seva sasa husimba data mara mbili, mara moja kwa TLS na mara moja kwa VMess.

## VMess, VLESS au Trojan?

[VLESS](/vpn-protocols/vless-reality) iliundwa na mradi wa Xray kama mrithi mwepesi: huhifadhi utambulisho unaotegemea UUID lakini huacha usimbaji fiche wa VMess wenyewe na hutegemea kabisa safu ya TLS, jambo linaloepuka usimbaji fiche mara mbili. [Trojan](/vpn-protocols/trojan) huchukua mbinu kama hiyo kwa nenosiri badala ya UUID. Ulinganisho wetu wa [VLESS, VMess na Trojan](/blog/vless-vs-vmess-vs-trojan) unaingia katika maelezo.

## Je, Doppler hutumia VMess?

Hapana. Doppler hutumia VLESS pamoja na Reality. Mwongozo wa [kwa nini VLESS](/vpn-protocols/why-vless) unaeleza kwa nini.
