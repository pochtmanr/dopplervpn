> **Trumpai.** VLESS yra minimalus proksi protokolas iš Xray projekto. Reality yra TLS sluoksnis, dėl kurio VLESS ryšys atrodo kaip įprastas apsilankymas TLS 1.3 tikroje, populiarioje svetainėje, be savo domeno ir sertifikato. Kartu tai šiuo metu cenzoriams sunkiausiai blokuojamas plačiai naudojamas derinys. Šis puslapis yra santrauka; visa istorija yra mūsų [išsamiame vadove](/how-it-works/vless-reality-tunnel).

## Kas yra VLESS?

VLESS buvo [pasiūlytas 2020 m. liepą](https://github.com/v2ray/v2ray-core/issues/2636) kaip lengvesnis [VMess](/vpn-protocols/vmess) įpėdinis. Jo [specifikacija](https://xtls.github.io/en/development/protocols/vless.html) tyčia maža: protokolo versija, 16 baitų UUID, identifikuojantis naudotoją, neprivalomas priedų laukas ir paskirties komanda, prievadas bei adresas. VLESS neturi savo šifravimo. Jis remiasi po juo esančiu TLS sluoksniu, todėl srautas nešifruojamas du kartus.

VLESS yra [Xray-core](https://github.com/XTLS/Xray-core) dalis — projekto, kuris 2020 m. lapkritį atsiskyrė nuo V2Ray ir dabar vadovauja šios protokolų šeimos plėtrai.

## Ką prideda Reality?

Tokie protokolai kaip [Trojan](/vpn-protocols/trojan) slepiasi TLS viduje iki jūsų pačių domeno, ir tas domenas tampa tuo, ką cenzorius gali užblokuoti. [Reality](https://github.com/XTLS/REALITY), išleistas Xray-core [1.8.0 2023 m. kovą](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), tą problemą pašalina.

Reality serveris pateikia tikros trečiosios šalies svetainės TLS rankos paspaudimą. Stebėtojui ryšys yra įprastas apsilankymas toje svetainėje per TLS 1.3. Klientas, žinantis serverio raktą, praleidžiamas į VLESS tunelį; visi kiti, įskaitant cenzoriaus aktyvųjį zondą, nukreipiami į tikrą svetainę ir mato jos tikrą sertifikatą. Nėra Doppler domeno ar sertifikato, kurį būtų galima įtraukti į blokavimo sąrašą.

## Kaip sunku užblokuoti VLESS-Reality?

Tai atspariausias mums žinomas plačiai naudojamas variantas, bet jis nėra nematomas. 2024 m. paskelbtas tyrimas parodė, kad [TLS, nešamą TLS viduje, galima atpažinti](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) pagal laiką ir paketų dydžius, o 2025 m. lapkritį naudotojai [pranešė](https://github.com/net4people/bbs/issues/546), kad kai kurie Rusijos interneto tiekėjai nutraukia Reality ryšius. VPN teikėjai atsako derindami serverių nuostatas ir svetaines, kurių rankos paspaudimą skolinasi, o katės ir pelės žaidimas tęsiasi.

## Koks jo greitis?

Kasdieniame naudojime papildomos sąnaudos mažos. VLESS antraštė siunčiama vieną kartą kiekvienam ryšiui, o XTLS Vision srautas nešifruoja jau užšifruoto žiniatinklio srauto antrą kartą. Kadangi jis veikia per TCP, tinkluose su paketų praradimais VLESS-Reality gali būti lėtesnis už UDP protokolus, tokius kaip [WireGuard](/vpn-protocols/wireguard), bet jis veikia toliau ten, kur tuos blokuoja.

## Kur sužinoti daugiau?

- [VLESS-Reality tunelis išsamiai](/how-it-works/vless-reality-tunnel): istorija, mechanizmas, ribos.
- [Kas yra VLESS?](/blog/what-is-vless) ir [VLESS URI formatas](/blog/vless-uri-format) mūsų tinklaraštyje.
- [VLESS VPN](/vless-vpn): kaip Doppler supakuoja VLESS-Reality į programėles, jungiančias vienu bakstelėjimu.
