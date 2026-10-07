> **Na kratko.** VLESS je minimalen proxy protokol projekta Xray. Reality je plast TLS, zaradi katere je povezava VLESS videti kot običajen obisk po TLS 1.3 na pravo, priljubljeno spletno mesto, brez lastne domene ali certifikata. Skupaj sta trenutno tista razširjena kombinacija, ki jo cenzorji najtežje blokirajo. Ta stran je povzetek; naš [podrobni vodnik](/how-it-works/vless-reality-tunnel) ima celotno zgodbo.

## Kaj je VLESS?

VLESS je bil [predlagan julija 2020](https://github.com/v2ray/v2ray-core/issues/2636) kot lažji naslednik [VMess](/vpn-protocols/vmess). Njegova [specifikacija](https://xtls.github.io/en/development/protocols/vless.html) je namenoma majhna: različica protokola, 16-bajtni UUID, ki identificira uporabnika, neobvezno polje dodatkov ter ukaz, vrata in naslov cilja. VLESS nima lastnega šifriranja. Zanaša se na plast TLS pod seboj, zato promet ni šifriran dvakrat.

VLESS je del [Xray-core](https://github.com/XTLS/Xray-core), projekta, ki se je od V2Ray ločil novembra 2020 in zdaj vodi razvoj te družine protokolov.

## Kaj doda Reality?

Protokoli, kot je [Trojan](/vpn-protocols/trojan), se skrijejo znotraj TLS do vaše lastne domene, ta domena pa postane tisto, kar lahko cenzor blokira. [Reality](https://github.com/XTLS/REALITY), izdan v Xray-core [1.8.0 marca 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), to odstrani.

Strežnik Reality predstavi rokovanje TLS pravega spletnega mesta tretje osebe. Za opazovalca je povezava običajen obisk tega mesta po TLS 1.3. Odjemalec, ki pozna ključ strežnika, je spuščen v tunel VLESS; vsi drugi, vključno z aktivno sondo cenzorja, so preusmerjeni na pravo spletno mesto in vidijo njegov pristen certifikat. Ni domene ali certifikata Doppler, ki bi ju dali na seznam za blokiranje.

## Kako težko je VLESS-Reality blokirati?

Je najodpornejša razširjena možnost, ki jo poznamo, ni pa nevidna. Raziskava, objavljena leta 2024, je pokazala, da je [TLS, ki ga nosi TLS, mogoče prepoznati](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) po času in velikostih paketov, novembra 2025 pa so uporabniki [poročali](https://github.com/net4people/bbs/issues/546), da nekateri ruski ponudniki prekinjajo povezave Reality. Ponudniki se odzovejo z nastavljanjem strežnikov in mest, ki si jih izposodijo, igra mačke in miši pa se nadaljuje.

## Kako hiter je?

Pri vsakdanji uporabi je dodatna obremenitev majhna. Glava VLESS se pošlje enkrat na povezavo, tok XTLS Vision pa se izogne drugemu šifriranju že šifriranega spletnega prometa. Ker teče prek TCP, je lahko VLESS-Reality v omrežjih z izgubami počasnejši od protokolov UDP, kot je [WireGuard](/vpn-protocols/wireguard), vendar še naprej deluje tam, kjer so ti blokirani.

## Kje izvem več?

- [Tunel VLESS-Reality, podrobno](/how-it-works/vless-reality-tunnel): zgodovina, mehanizem, omejitve.
- [Kaj je VLESS?](/blog/what-is-vless) in [oblika URI za VLESS](/blog/vless-uri-format) na našem blogu.
- [VLESS VPN](/vless-vpn): kako Doppler zapakira VLESS-Reality v aplikacije z enim dotikom.
