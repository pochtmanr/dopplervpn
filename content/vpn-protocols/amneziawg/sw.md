> **Muhtasari.** AmneziaWG ni tawi la WireGuard linalohifadhi kasi na usimbaji fiche wake lakini hubadilisha maumbo ya pakiti na vichwa vinavyofanya WireGuard iwe rahisi kutambua. Ni chaguo imara pale WireGuard ya kawaida inapozuiwa, na kuna kikwazo kimoja: haiwasiliani tena na seva za kawaida za WireGuard ufichaji wake unapowashwa.

## AmneziaWG ni nini?

AmneziaWG inaendelezwa na timu iliyo nyuma ya [Amnezia VPN](https://amnezia.org/), programu ya chanzo huria ya kuendesha seva yako ya VPN. [Utekelezaji wake wa Go](https://github.com/amnezia-vpn/amneziawg-go) ulianzishwa mwaka 2023. Inachukua [WireGuard](/vpn-protocols/wireguard), ambayo ni ya kasi na rahisi lakini ina mpeano wa mkono usiobadilika, unaotambulika, na kuongeza safu inayoificha.

## Inabadilisha nini?

[Nyaraka za AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) zinaeleza mifumo kadhaa, kila moja ikidhibitiwa na vigezo vya usanidi:

- **Vichwa vinavyobadilika (H1–H4).** Pakiti za kawaida za WireGuard huanza na aina ya ujumbe isiyobadilika kwa kila moja ya miundo yake minne ya pakiti. AmneziaWG hubadilisha thamani hizo kwa nambari zilizochaguliwa kutoka masafa yaliyosanidiwa, hivyo mipangilio miwili tofauti haishiriki vichwa na hakuna kanuni moja ya kichujio inayolingana na zote.
- **Uwekaji nasibu wa urefu wa pakiti (S1–S4).** Katika WireGuard pakiti ya kwanza ya mpeano wa mkono daima ni baiti 148 hasa. AmneziaWG huongeza viambishi vya nasibu kwa kila aina ya pakiti ili ukubwa ubadilike.
- **Pakiti taka (Jc, Jmin, Jmax).** Kabla ya mpeano wa mkono, mteja hutuma idadi inayoweza kusanidiwa ya pakiti za kinasibu za urefu wa nasibu, zinazofifisha mwanzo wa kipindi kwa wakati na kwa ukubwa.
- **Ulinzi wa kichwa.** Matoleo mapya yanaweza pia kusimba sehemu ya aina ya ujumbe yenyewe.

Chini yake, usimbaji fiche na muundo wa jumla hubaki kuwa vya WireGuard.

## Ni vigumu kiasi gani kuzuia AmneziaWG?

Huondoa saini rahisi ambazo vichujio hutumia dhidi ya WireGuard: ukubwa usiobadilika na thamani za vichwa zisizobadilika. Hilo huifanya istahimili zaidi sana kuliko WireGuard ya kawaida kwenye mitandao inayozuia VPN.

Bado inaendeshwa juu ya UDP, hivyo mitandao inayopunguza kasi au kuzuia UDP kwa upana itaiathiri, na trafiki yake haiigi programu yoyote mahususi jinsi [VLESS-Reality](/vpn-protocols/vless-reality) inavyoiga tembeleo la TLS kwenda kwenye tovuti halisi. Kichujio kinachozuia UDP isiyotambulika kabisa bado kingeweza kuikamata.

## Wakati gani utumie AmneziaWG?

- **Pale WireGuard inapozuiwa** lakini UDP bado inafanya kazi, na unataka kasi inayofanana na WireGuard.
- **Seva unazojiendeshea mwenyewe**, kwa kutumia programu ya Amnezia VPN kuzisanidi.
- Weka chaguo linalotegemea TCP, kama VLESS-Reality, kwa mitandao inayochuja UDP. [Mwongozo wetu wa Urusi](/vpn-for-russia) unaeleza kinachopita huko kwa sasa.

## Je, Doppler hutumia AmneziaWG?

Hapana. Doppler hutumia VLESS-Reality. Tazama [kwa nini VLESS](/vpn-protocols/why-vless).
