> **Ukratko.** WireGuard je najbrži i najjednostavniji od uobičajenih VPN protokola, i na nefiltriranoj mreži odličan je izbor. Nikad nije osmišljen da sakrije da je VPN, a u Rusiji, Iranu i Kini blokiraju ga među prvima.

## Što je WireGuard?

WireGuard je VPN protokol koji je napisao Jason A. Donenfeld, a prvi put je objavljen 2015. Cilj je bio zamijeniti velike, podesive protokole koji su mu prethodili nečim dovoljno malim da se kod može provjeriti. U ožujku 2020. [ušao je u jezgru Linuxa 5.6](https://en.wikipedia.org/wiki/WireGuard), a službene aplikacije sada postoje za Windows, macOS, iOS, Android i Linux.

Umjesto da strane dogovaraju skup šifri, WireGuard fiksira jedan skup suvremenih primitiva. Na [stranici protokola](https://www.wireguard.com/protocol/) navedeni su: ChaCha20 s Poly1305 za šifriranje, Curve25519 za razmjenu ključeva i BLAKE2s za heširanje. Nema što pogrešno podesiti i nema starije, slabije mogućnosti na koju bi se vratio.

## Kako radi?

Svaki uređaj ima par ključeva, slično kao kod SSH-a. Klijent i poslužitelj unaprijed znaju javne ključeve jedno drugoga, a rukovanje se temelji na okviru protokola Noise (stranica protokola navodi točnu konstrukciju, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Svi se paketi šalju preko UDP-a](https://www.wireguard.com/protocol/), a nova se sesija uspostavlja u jednom povratnom krugu.

Zato WireGuard djeluje brzo. Malo je toga o čemu treba pregovarati, na Linuxu kod radi unutar jezgre operacijskog sustava, a prelazak između Wi-Fi-ja i mobilnih podataka prolazi neprimjetno jer protokol ne drži dugotrajnu vezu otvorenom.

## Zašto se WireGuard blokira?

Ista jednostavnost zbog koje je WireGuard lako provjeriti čini ga i lako prepoznatljivim. Njegova [bijela knjiga](https://www.wireguard.com/papers/wireguard.pdf) opisuje poruke rukovanja bajt po bajt, pa je prvi paket klijenta uvijek 148 bajtova, a odgovor uvijek 92 bajta, i svaki počinje fiksnim poljem vrste poruke. Sustavu duboke inspekcije paketa (DPI) dovoljno je kratko pravilo da uoči taj obrazac na UDP-u.

Cenzori upravo to i rade. U kolovozu 2023. korisnici u Rusiji [javili su](https://github.com/net4people/bbs/issues/274) da veliki mobilni operateri prekidaju sesije WireGuarda odmah nakon rukovanja. Šifriranje je i dalje štitilo sadržaj, ali sama je veza nestala.

To je projektni kompromis, a ne pogreška. Autori WireGuarda odabrali su fiksni, minimalni protokol, a prikrivanje nije bilo na popisu ciljeva. Projekti poput [AmneziaWG-a](/vpn-protocols/amneziawg) mijenjaju oblik paketa kako bi vratili dio prikrivanja.

## Kada koristiti WireGuard?

- **Nefiltrirane mreže.** Kod kuće, na poslu ili na putu u zemlji koja ne blokira VPN-ove, WireGuard je teško nadmašiti po brzini i trajanju baterije.
- **Vlastiti poslužitelj.** Ako vodite vlastiti poslužitelj, WireGuard je jedan od najlakših protokola za ispravno postavljanje.
- **Ne pod filtriranjem DPI-jem.** Ako vaša mreža blokira VPN-ove, bolje odgovara protokol građen da izgleda kao običan web-promet, poput [VLESS-Reality](/vpn-protocols/vless-reality). Naša usporedba [VLESS-Reality i WireGuard](/blog/vless-reality-vs-wireguard) taj kompromis opisuje podrobnije.

## Koristi li Doppler WireGuard?

Ne. Aplikacije Dopplera povezuju se preko VLESS-Reality, jer je Doppler građen za mreže u kojima se WireGuard filtrira. Vodič [zašto VLESS](/vpn-protocols/why-vless) objašnjava razloge.
