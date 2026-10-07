> **Na kratko.** WireGuard je najhitrejši in najpreprostejši razširjen VPN protokol in je v nefiltriranem omrežju odlična izbira. Nikoli pa ni bil zasnovan tako, da bi skrival, da je VPN, zato ga v Rusiji, Iranu in na Kitajskem blokirajo med prvimi.

## Kaj je WireGuard?

WireGuard je VPN protokol, ki ga je napisal Jason A. Donenfeld in je prvič izšel leta 2015. Cilj je bil zamenjati velike, nastavljive protokole, ki so bili pred njim, z nečim dovolj majhnim, da ga je mogoče pregledati. Marca 2020 je bil [vključen v jedro Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), uradne aplikacije pa zdaj obstajajo za Windows, macOS, iOS, Android in Linux.

Namesto da bi se strani dogovorile o naboru šifer, WireGuard določi en nabor sodobnih primitivov. Na [strani protokola](https://www.wireguard.com/protocol/) so navedeni: ChaCha20 s Poly1305 za šifriranje, Curve25519 za izmenjavo ključev in BLAKE2s za zgoščevanje. Ničesar ni mogoče napačno nastaviti in ni starejše, šibkejše možnosti, na katero bi se bilo mogoče vrniti.

## Kako deluje?

Vsaka naprava ima par ključev, podobno kot pri SSH. Odjemalec in strežnik vnaprej poznata javne ključe drug drugega, rokovanje pa temelji na ogrodju protokola Noise (stran protokola navaja natančno konstrukcijo, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Vsi paketi se pošiljajo prek UDP](https://www.wireguard.com/protocol/), nova seja pa se vzpostavi v eni izmenjavi.

Zaradi te zasnove se WireGuard zdi hiter. Dogovarjanja je malo, v Linuxu koda teče znotraj jedra operacijskega sistema, preklop med Wi-Fi in mobilnimi podatki pa poteka tiho, ker protokol ne drži dolgo odprte povezave.

## Zakaj WireGuard blokirajo?

Ista preprostost, zaradi katere je WireGuard enostavno pregledati, ga naredi tudi lahko prepoznavnega. Njegov [tehnični dokument](https://www.wireguard.com/papers/wireguard.pdf) določa sporočila rokovanja bajt za bajtom, zato je prvi paket odjemalca vedno 148 bajtov, odgovor pa vedno 92 bajtov, vsak pa se začne s fiksnim poljem vrste sporočila. Sistemu za globok pregled paketov (DPI) zadošča kratko pravilo, da ta vzorec opazi na UDP.

Cenzorji počnejo prav to. Avgusta 2023 so uporabniki v Rusiji [poročali](https://github.com/net4people/bbs/issues/274), da veliki mobilni operaterji seje WireGuard prekinejo takoj po rokovanju. Šifriranje je vsebino še vedno varovalo, sama povezava pa je izginila.

To je načrtovalski kompromis, ne napaka. Avtorji WireGuarda so izbrali fiksen, minimalen protokol, prikrivanje pa ni bilo med cilji. Projekti, kot je [AmneziaWG](/vpn-protocols/amneziawg), spremenijo oblike paketov, da povrnejo del prikritosti.

## Kdaj uporabiti WireGuard?

- **Nefiltrirana omrežja.** Doma, v službi ali na potovanju v državi, ki ne blokira VPN-jev, je WireGuard po hitrosti in trajanju baterije težko premagati.
- **Lastni strežnik.** Če poganjate svoj strežnik, je WireGuard eden najlažjih protokolov za pravilno nastavitev.
- **Ne pod filtriranjem DPI.** Če vaše omrežje blokira VPN-je, je primernejši protokol, zasnovan tako, da je videti kot običajen spletni promet, na primer [VLESS-Reality](/vpn-protocols/vless-reality). Naša primerjava [VLESS-Reality in WireGuard](/blog/vless-reality-vs-wireguard) kompromis opiše podrobneje.

## Ali Doppler uporablja WireGuard?

Ne. Aplikacije Doppler se povezujejo prek VLESS-Reality, ker je Doppler narejen za omrežja, kjer je WireGuard filtriran. Vodnik [zakaj VLESS](/vpn-protocols/why-vless) pojasni razloge.
