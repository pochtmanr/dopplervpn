> **Ve zkratce.** WireGuard je nejrychlejší a nejjednodušší běžný VPN protokol a v nefiltrované síti je výbornou volbou. Nikdy však nebyl navržen tak, aby skrýval, že jde o VPN, a v Rusku, Íránu a Číně patří mezi první protokoly, které se blokují.

## Co je WireGuard?

WireGuard je VPN protokol, který napsal Jason A. Donenfeld a poprvé vydal v roce 2015. Cílem bylo nahradit rozsáhlé, nastavitelné protokoly, které mu předcházely, něčím dost malým na to, aby šlo kód zkontrolovat. V březnu 2020 byl [začleněn do jádra Linuxu 5.6](https://en.wikipedia.org/wiki/WireGuard) a oficiální aplikace dnes existují pro Windows, macOS, iOS, Android a Linux.

Místo toho, aby si obě strany vyjednaly sadu šifer, WireGuard pevně stanoví jednu sadu moderních primitiv. Na [stránce protokolu](https://www.wireguard.com/protocol/) jsou uvedena: ChaCha20 s Poly1305 pro šifrování, Curve25519 pro výměnu klíčů a BLAKE2s pro hashování. Není co nastavit špatně a není starší, slabší možnost, ke které by se dalo ustoupit.

## Jak funguje?

Každé zařízení má pár klíčů, podobně jako u SSH. Klient a server znají veřejné klíče toho druhého předem a navázání spojení stojí na rámci protokolu Noise (stránka protokolu uvádí přesnou konstrukci `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Všechny pakety se posílají po UDP](https://www.wireguard.com/protocol/) a nová relace se naváže jednou výměnou tam a zpět.

Proto WireGuard působí rychle. Není skoro o čem vyjednávat, na Linuxu kód běží v jádře operačního systému a přechod mezi Wi-Fi a mobilními daty proběhne tiše, protože protokol nedrží dlouho otevřené spojení.

## Proč se WireGuard blokuje?

Stejná jednoduchost, díky které se WireGuard snadno kontroluje, ho dělá snadno rozpoznatelným. Jeho [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) popisuje zprávy navázání spojení bajt po bajtu, takže první paket od klienta má vždy 148 bajtů a odpověď vždy 92 bajtů a každá začíná pevným polem typu zprávy. Systému hloubkové inspekce paketů (DPI) stačí krátké pravidlo, aby tento vzor na UDP poznal.

Cenzorové to tak dělají. V srpnu 2023 uživatelé v Rusku [hlásili](https://github.com/net4people/bbs/issues/274), že velcí mobilní operátoři přerušují relace WireGuard hned po navázání spojení. Šifrování obsah dál chránilo, ale samotné spojení bylo pryč.

Je to kompromis návrhu, ne chyba. Autoři WireGuard zvolili pevný, minimální protokol a maskování mezi cíli nebylo. Projekty jako [AmneziaWG](/vpn-protocols/amneziawg) mění tvar paketů, aby část krytí vrátily.

## Kdy použít WireGuard?

- **Nefiltrované sítě.** Doma, v práci nebo na cestách v zemi, která VPN neblokuje, se WireGuard rychlostí a výdrží baterie těžko překonává.
- **Vlastní server.** Pokud provozujete vlastní server, WireGuard patří k protokolům, které se nejsnáze nastaví správně.
- **Ne pod filtrací DPI.** Pokud vaše síť VPN blokuje, lépe sedí protokol vytvořený tak, aby vypadal jako běžný webový provoz, například [VLESS-Reality](/vpn-protocols/vless-reality). Náš srovnávací text [VLESS-Reality a WireGuard](/blog/vless-reality-vs-wireguard) tento kompromis popisuje podrobněji.

## Používá Doppler WireGuard?

Ne. Aplikace Doppler se připojují přes VLESS-Reality, protože Doppler je stavěný pro sítě, kde se WireGuard filtruje. Zdůvodnění vysvětluje průvodce [proč VLESS](/vpn-protocols/why-vless).
