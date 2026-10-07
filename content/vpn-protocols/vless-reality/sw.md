> **Muhtasari.** VLESS ni itifaki ya proksi ndogo kutoka mradi wa Xray. Reality ni safu ya TLS inayofanya muunganisho wa VLESS uonekane kama tembeleo la kawaida la TLS 1.3 kwenda kwenye tovuti halisi, maarufu, bila kikoa wala cheti chako mwenyewe. Pamoja, kwa sasa ndiyo mchanganyiko wa kawaida ulio mgumu zaidi kwa wadhibiti kuzuia. Ukurasa huu ni muhtasari; [mwongozo wetu wa kina](/how-it-works/vless-reality-tunnel) una hadithi kamili.

## VLESS ni nini?

VLESS [ilipendekezwa mwezi Julai 2020](https://github.com/v2ray/v2ray-core/issues/2636) kama mrithi mwepesi wa [VMess](/vpn-protocols/vmess). [Vipimo vyake](https://xtls.github.io/en/development/protocols/vless.html) ni vidogo kwa makusudi: toleo la itifaki, UUID ya baiti 16 inayomtambua mtumiaji, sehemu ya hiari ya nyongeza, na amri, mlango na anwani ya marudio. VLESS haina usimbaji fiche wake. Inategemea safu ya TLS iliyo chini, hivyo trafiki haisimbwi mara mbili.

VLESS ni sehemu ya [Xray-core](https://github.com/XTLS/Xray-core), mradi uliojitenga na V2Ray mwezi Novemba 2020 na sasa unaongoza uundaji wa familia hii ya itifaki.

## Reality huongeza nini?

Itifaki kama [Trojan](/vpn-protocols/trojan) hujificha ndani ya TLS kwenda kwenye kikoa chako, na kikoa hicho huwa kitu ambacho mdhibiti anaweza kuzuia. [Reality](https://github.com/XTLS/REALITY), iliyotolewa katika Xray-core [1.8.0 mwezi Machi 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), huondoa hilo.

Seva ya Reality inawasilisha mpeano wa mkono wa TLS wa tovuti halisi ya mtu wa tatu. Kwa mwangalizi, muunganisho ni tembeleo la kawaida la TLS 1.3 kwenda kwenye tovuti hiyo. Mteja anayejua funguo ya seva huruhusiwa kupita kwenda kwenye handaki ya VLESS; mtu mwingine yeyote, ikiwemo uchunguzi hai wa mdhibiti, hupitishwa kwa tovuti halisi na kuona cheti chake halisi. Hakuna kikoa wala cheti cha Doppler cha kuweka kwenye orodha ya zuio.

## Ni vigumu kiasi gani kuzuia VLESS-Reality?

Ndiyo chaguo la kawaida linalostahimili zaidi tunalolijua, lakini si lisiloonekana. Utafiti uliochapishwa mwaka 2024 ulionyesha kwamba [TLS iliyobebwa ndani ya TLS inaweza kutambuliwa kwa alama](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) kwa muda wake na ukubwa wa pakiti, na mwezi Novemba 2025 watumiaji [waliripoti](https://github.com/net4people/bbs/issues/546) baadhi ya ISP za Urusi zikikata miunganisho ya Reality. Watoa huduma hujibu kwa kurekebisha mipangilio ya seva na tovuti wanazokopa, na mchezo wa paka na panya unaendelea.

## Ni ya kasi kiasi gani?

Katika matumizi ya kila siku mzigo ni mdogo. Kichwa cha VLESS hutumwa mara moja kwa kila muunganisho, na mtiririko wa XTLS Vision huepuka kusimba tena trafiki ya wavuti ambayo tayari imesimbwa. Kwa sababu inaendeshwa juu ya TCP, VLESS-Reality inaweza kuwa ya polepole kuliko itifaki za UDP kama [WireGuard](/vpn-protocols/wireguard) kwenye mitandao yenye upotevu, lakini inaendelea kufanya kazi pale hizo zinapozuiwa.

## Ninaweza kujifunza wapi zaidi?

- [Handaki ya VLESS-Reality, kwa kina](/how-it-works/vless-reality-tunnel): historia, utaratibu, mipaka.
- [VLESS ni nini?](/blog/what-is-vless) na [muundo wa URI wa VLESS](/blog/vless-uri-format) kwenye blogu yetu.
- [VPN ya VLESS](/vless-vpn): jinsi Doppler inavyofunga VLESS-Reality katika programu za bonyezo moja.
