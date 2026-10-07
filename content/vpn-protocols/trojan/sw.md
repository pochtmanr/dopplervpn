> **Muhtasari.** Trojan huficha trafiki ya proksi ndani ya muunganisho halisi wa TLS kwenda kwenye tovuti halisi unayoimiliki. Yeyote anayeunganisha bila nenosiri hupata tovuti tu. Inafanya kazi vizuri, lakini unahitaji kikoa na cheti chako mwenyewe, na hivyo vinaweza kupatikana na kuzuiwa.

## Trojan ni nini?

Trojan ni itifaki ya proksi kutoka [mradi wa trojan-gfw](https://github.com/trojan-gfw/trojan), iliyotolewa kwa mara ya kwanza mwezi Oktoba 2017. Wazo lake liko katika jina: badala ya kuvumbua kujificha, inajificha ndani ya trafiki iliyosimbwa iliyo ya kawaida zaidi kwenye intaneti, HTTPS.

## Inafanyaje kazi?

[Maelezo ya itifaki](https://trojan-gfw.github.io/trojan/protocol) ni mafupi. Seva ya Trojan husikiliza kama seva ya kawaida ya HTTPS, yenye cheti halisi cha kikoa halisi. Mteja hufanya mpeano wa mkono halisi wa TLS. Kisha, ndani ya muunganisho uliosimbwa, hutuma:

- hashi ya SHA-224 iliyoandikwa kwa heksadesimali ya nenosiri lililoshirikiwa, ambayo ni herufi 56,
- mstari mpya,
- ombi dogo linalosema trafiki inapaswa kwenda wapi, katika muundo unaofanana na SOCKS5,
- mstari mpya mwingine, kufuatiwa na kipande cha kwanza cha data.

Ikiwa hashi na ombi ni halali, seva hufungua handaki kwenda kwenye marudio. Ikiwa kuna kitu kibaya, seva huchukulia muunganisho kama "itifaki nyingine" na kuupitisha kwa seva ya wavuti ya kurudi nyuma, ili mgeni aone tovuti ya kawaida.

## Ni vigumu kiasi gani kuzuia Trojan?

Kutoka nje, muunganisho wa Trojan ni kipindi cha TLS kwenda kwenye kikoa chako, chenye cheti chako. Uchunguzi hai hupata tovuti halisi. Hilo hufanya Trojan iwe vigumu zaidi kutenga kuliko itifaki zinazoonekana za nasibu, kama [Shadowsocks](/vpn-protocols/shadowsocks).

Sehemu yake dhaifu ni kikoa chenyewe. Kila seva inahitaji kikoa na cheti, na mdhibiti anayejua vikoa vipi ni vya proksi anaweza kuvizuia kwa jina au kwa IP. Watafiti pia wameonyesha kwamba TLS iliyobebwa ndani ya TLS huacha mifumo ya muda na ukubwa inayoweza [kutambuliwa kwa alama](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), jambo linaloathiri Trojan na miundo kama hiyo.

[VLESS-Reality](/vpn-protocols/vless-reality) huondoa tatizo la kikoa kwa kukopa mpeano wa mkono wa TLS wa tovuti iliyopo, maarufu, badala ya yako mwenyewe.

## Wakati gani utumie Trojan?

- **Unapodhibiti kikoa** na unataka usanidi rahisi, unaoeleweka vizuri, unaoonekana kama HTTPS.
- **Kwenye mitandao iliyochujwa kwa wastani** ambapo kikoa chako hakina uwezekano wa kulengwa.
- Ulinganisho wetu wa [VLESS, VMess na Trojan](/blog/vless-vs-vmess-vs-trojan) husaidia ikiwa unachagua kati yao.

## Je, Doppler hutumia Trojan?

Hapana. Doppler hutumia VLESS-Reality, ambayo haihitaji kikoa chake. Tazama [kwa nini VLESS](/vpn-protocols/why-vless).
