> **Ukratko.** VMess je izvorni protokol projekta V2Ray. Sam šifrira svoja zaglavlja i obično je omotan u drugi transport, poput WebSocketa preko TLS-a, da izgleda kao web-promet. I dalje radi, ali njegovi nasljednici, VLESS i Trojan, isti posao rade s manjim dodatnim opterećenjem.

## Što je VMess?

VMess je šifrirani proxy protokol koji je [projekt V2Ray](https://github.com/v2fly/v2ray-core) uveo kad je počeo 2015. V2Ray je izrastao u modularnu platformu za gradnju proxyja: jedna jezgra, mnogo protokola i transporta te mehanizam usmjeravanja koji odlučuje koji promet kamo ide. VMess je bio njegov prvi protokol i nekoliko godina glavni.

Kao i Shadowsocks, VMess je tehnički proxy, a ne VPN, ali aplikacije temeljene na V2Rayu mogu kroz njega usmjeriti cijeli uređaj.

## Kako radi?

Svaki korisnik ima UUID koji služi kao vjerodajnica. Prema [dokumentaciji protokola](https://www.v2fly.org/en_US/developer/protocols/vmess.html), zaglavlje zahtjeva klijenta sadrži šifrirani identifikator autentifikacije sastavljen od Unix vremenske oznake, slučajnog broja i kontrolnog zbroja, šifriran ključem izvedenim iz korisničkog ID-a. Poslužitelj ga koristi da prepozna korisnika, a zatim dešifrira ostatak zaglavlja i podatke.

Dokumentacija opisuje dva načina zaštite zaglavlja. Suvremeni koristi šifriranje AEAD, koje jamči da zaglavlje nije mijenjano. Stariji je koristio MD5 i AES-128-CFB i nije mogao jamčiti cjelovitost zaglavlja; dokumentacija od njega odvraća. Budući da identifikator autentifikacije sadrži vremensku oznaku, satovi klijenta i poslužitelja moraju biti otprilike usklađeni, što je čest izvor problema „jednostavno se ne spaja”.

## Koliko je VMess teško blokirati?

Sam po sebi VMess izgleda kao slučajni bajtovi, što ga stavlja u isti položaj kao [Shadowsocks](/vpn-protocols/shadowsocks): izložen je vatrozidima koji blokiraju potpuno šifrirani promet. Zato se VMess obično postavlja unutar WebSocketa ili gRPC-a preko TLS-a, iza domene i certifikata, tako da promatrač vidi ono što izgleda kao obična HTTPS veza s web-mjestom.

Taj omotač obavlja većinu posla skrivanja prometa, i ima cijenu: potrebna je domena, certifikat i često CDN ispred poslužitelja, a poslužitelj podatke šifrira dvaput, jednom za TLS i jednom za VMess.

## VMess, VLESS ili Trojan?

[VLESS](/vpn-protocols/vless-reality) projekt Xray osmislio je kao lakšeg nasljednika: zadržava identitet na temelju UUID-a, ali odbacuje vlastito šifriranje VMessa i u potpunosti se oslanja na sloj TLS-a, čime se izbjegava dvostruko šifriranje. [Trojan](/vpn-protocols/trojan) koristi sličan pristup, s lozinkom umjesto UUID-a. Naša usporedba [VLESS, VMess i Trojan](/blog/vless-vs-vmess-vs-trojan) ulazi u pojedinosti.

## Koristi li Doppler VMess?

Ne. Doppler koristi VLESS s Realityjem. Vodič [zašto VLESS](/vpn-protocols/why-vless) objašnjava zašto.
