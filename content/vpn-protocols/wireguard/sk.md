> **Stručne.** WireGuard je najrýchlejší a najjednoduchší z bežných VPN protokolov a v nefiltrovanej sieti je výborná voľba. Nikdy však nebol navrhnutý tak, aby skrýval, že ide o VPN, a v Rusku, Iráne a Číne patrí medzi prvé protokoly, ktoré sa blokujú.

## Čo je WireGuard?

WireGuard je VPN protokol, ktorý napísal Jason A. Donenfeld a prvýkrát vyšiel v roku 2015. Cieľom bolo nahradiť veľké, nastaviteľné protokoly, ktoré mu predchádzali, niečím dosť malým na to, aby sa dal celý skontrolovať. V marci 2020 bol [zaradený do jadra Linux 5.6](https://en.wikipedia.org/wiki/WireGuard) a oficiálne aplikácie dnes existujú pre Windows, macOS, iOS, Android a Linux.

Namiesto toho, aby si strany dohodli sadu šifier, WireGuard pevne stanovuje jednu sadu moderných primitív. Na [stránke protokolu](https://www.wireguard.com/protocol/) sú uvedené: ChaCha20 s Poly1305 na šifrovanie, Curve25519 na výmenu kľúčov a BLAKE2s na hashovanie. Nie je čo nastaviť zle a nie je staršia, slabšia možnosť, na ktorú by sa dalo vrátiť.

## Ako funguje?

Každé zariadenie má pár kľúčov, podobne ako pri SSH. Klient a server vopred poznajú svoje verejné kľúče a handshake vychádza z rámca Noise (stránka protokolu uvádza presnú konštrukciu, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Všetky pakety sa posielajú cez UDP](https://www.wireguard.com/protocol/) a nová relácia sa nadviaže jednou výmenou tam a späť.

Preto WireGuard pôsobí rýchlo. Takmer nie je o čom sa dohadovať, v Linuxe kód beží priamo v jadre operačného systému a prechod medzi Wi-Fi a mobilnými dátami prebehne potichu, pretože protokol nedrží otvorené dlhotrvajúce spojenie.

## Prečo sa WireGuard blokuje?

Tá istá jednoduchosť, vďaka ktorej sa WireGuard ľahko kontroluje, ho robí ľahko rozpoznateľným. Jeho [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) opisuje správy handshake bajt po bajte, takže prvý paket od klienta má vždy 148 bajtov a odpoveď vždy 92 bajtov a každý začína pevným poľom typu správy. Systému hĺbkovej inšpekcie paketov (DPI) stačí krátke pravidlo, aby tento vzor na UDP spoznal.

Cenzori to robia presne tak. V auguste 2023 používatelia v Rusku [hlásili](https://github.com/net4people/bbs/issues/274), že veľkí mobilní operátori prerušovali relácie WireGuard hneď po handshake. Šifrovanie naďalej chránilo obsah, ale samotné spojenie zmizlo.

Je to konštrukčný kompromis, nie chyba. Autori WireGuardu zvolili pevný, minimálny protokol a maskovanie nebolo medzi cieľmi. Projekty ako [AmneziaWG](/vpn-protocols/amneziawg) menia tvar paketov, aby časť krytia vrátili.

## Kedy použiť WireGuard?

- **Nefiltrované siete.** Doma, v práci alebo na cestách v krajine, ktorá VPN neblokuje, sa WireGuard ťažko prekoná v rýchlosti a výdrži batérie.
- **Vlastný server.** Ak prevádzkujete vlastný server, WireGuard patrí medzi protokoly, ktoré sa najľahšie nastavia správne.
- **Nie pod filtrovaním DPI.** Ak vaša sieť blokuje VPN, lepšie sedí protokol navrhnutý tak, aby vyzeral ako bežná webová prevádzka, napríklad [VLESS-Reality](/vpn-protocols/vless-reality). Naše porovnanie [VLESS-Reality a WireGuard](/blog/vless-reality-vs-wireguard) rozoberá tento kompromis podrobnejšie.

## Používa Doppler WireGuard?

Nie. Aplikácie Doppler sa pripájajú cez VLESS-Reality, pretože Doppler je stavaný pre siete, v ktorých sa WireGuard filtruje. Zdôvodnenie je v sprievodcovi [prečo VLESS](/vpn-protocols/why-vless).
