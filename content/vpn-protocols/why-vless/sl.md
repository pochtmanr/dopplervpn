> **Na kratko.** Doppler smo zgradili za ljudi v omrežjih, ki blokirajo VPN-je. V teh omrežjih vprašanje ni, kateri protokol je na papirju najhitrejši, temveč kateri je povezan še jutri. Izbrali smo VLESS z Reality, ker cenzorju da najmanj za prepoznavo in najmanj za blokiranje, kompromise, ki pridejo s tem, pa sprejmemo.

## Za kaj smo izbirali?

Doppler je narejen za ljudi, ki se povezujejo iz krajev, kjer VPN-je filtrirajo namenoma: Rusija, Iran, Kitajska, deli Perzijskega zaliva. V teh omrežjih je šifriranje lahek del. Vsak protokol v naši [primerjavi](/vpn-protocols) dobro šifrira. Loči jih to, ali lahko sistem za filtriranje ugotovi, da je povezava VPN, in kaj lahko blokira, ko to ugotovi.

Zato smo vsako možnost presodili po treh vprašanjih:

1. **Ali ima fiksen prstni odtis?** Rokovanje fiksne velikosti ali standardna vrata lahko ujame eno samo pravilo.
2. **Kaj se zgodi, ko cenzor sondira strežnik?** Požarni zidovi se dejavno povežejo na domnevne proxyje, da vidijo, kako se odzovejo.
3. **Ali je kaj za na seznam za blokiranje?** Domena, certifikat ali prepoznaven strežnik je tarča, tudi če je sam promet dobro skrit.

## Zakaj ne WireGuard, OpenVPN ali IKEv2?

Vsi trije padejo pri prvem vprašanju. Paketi rokovanja [WireGuard](/vpn-protocols/wireguard) so vedno 148 in 92 bajtov. [OpenVPN](/vpn-protocols/openvpn) so raziskovalci, ki so delali znotraj pravega ponudnika, prepoznali v več kot 85% tokov. [IKEv2](/vpn-protocols/ikev2) teče na standardnih vratih UDP, ki jih je mogoče zavreči v celoti. Avgusta 2023 so uporabniki v Rusiji [poročali](https://github.com/net4people/bbs/issues/274), da operaterji prekinejo WireGuard in OpenVPN že pri prvih paketih. To so dobri protokoli za odprta omrežja. Za naša niso bili zasnovani.

## Zakaj ne Shadowsocks ali VMess?

Prvo vprašanje prestanejo, ker so videti kot naključni bajti, in to se je izkazalo za lasten prstni odtis. Od novembra 2021 Veliki kitajski požarni zid [blokira popolnoma šifriran promet](https://gfw.report/publications/usenixsecurity23/en/), ki ni podoben nobenemu znanemu protokolu. [VMess](/vpn-protocols/vmess) je mogoče oviti v TLS, da se temu izogne, potem pa potrebuje domeno, kar nas pripelje do tretjega vprašanja.

## Zakaj ne Trojan?

[Trojan](/vpn-protocols/trojan) na prvi dve vprašanji odgovori dobro: to je pravi TLS, sonde pa vidijo pravo spletno mesto. Toda vsak strežnik Trojan potrebuje lastno domeno in certifikat. Ko cenzor to domeno izve, jo lahko blokira, vzdrževanje številnih domen pa je nenehen lov.

## Kaj VLESS-Reality naredi prav

[VLESS-Reality](/vpn-protocols/vless-reality) odgovori na vsa tri:

- **Ni fiksnega prstnega odtisa.** Povezava je TLS 1.3 prek TCP, najpogostejši šifriran promet na internetu.
- **Sonde vidijo pravo spletno mesto.** Reality vsakogar, ki se ne more overiti, posreduje na pravo mesto, katerega rokovanje si izposodi, s pristnim certifikatom tega mesta.
- **Ničesar našega za blokiranje po imenu.** V rokovanju ni domene ali certifikata Doppler.

Teče tudi prek TCP, zato še naprej deluje v omrežjih, ki dušijo ali blokirajo UDP, kjer [Hysteria 2](/vpn-protocols/hysteria2) in [AmneziaWG](/vpn-protocols/amneziawg) težko delujeta. Tudi sam VLESS je majhen: za šifriranje se zanaša na TLS, namesto da bi dodal svojega, zato ni dvojnega šifriranja.

## Čemu smo se odpovedali

- **Surovi hitrosti na povezavah z izgubami.** TCP si po izgubi paketov opomore manj gladko kot QUIC ali UDP pri WireGuardu. Na čisti povezavi je razlika majhna; na slabi je lahko opazna.
- **Vgrajeni podpori v operacijskem sistemu.** Noben operacijski sistem ne prinaša odjemalca VLESS, zato potrebujete aplikacijo. Odločili smo se, da je to sprejemljivo, in zgradili lastne za iOS, Android, macOS in Windows.
- **Popolni nevidnosti.** Ne obstaja. Raziskave so pokazale, da je [TLS znotraj TLS mogoče prepoznati](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), novembra 2025 pa so [poročali](https://github.com/net4people/bbs/issues/546), da nekateri ruski ponudniki prekinjajo povezave Reality. VLESS-Reality je zasnova za odpornost proti cenzuri, ne jamstvo.

## Kaj naredimo glede omejitev

Cenzura se spreminja, zato izbira protokola ni konec dela. Nastavitve strežnikov in mesta, ki si jih Reality izposodi, prilagajamo, ko se filtriranje spremeni, in spremljamo iste raziskave in poročila skupnosti, na katera se sklicujejo te strani. Če se pojavi boljši pristop, bo ta stran to povedala.

Za celotno tehnično zgodbo o tem, kako deluje VLESS-Reality, preberite [tunel VLESS-Reality](/how-it-works/vless-reality-tunnel). Če ga želite preizkusiti, glejte [VLESS VPN](/vless-vpn).
