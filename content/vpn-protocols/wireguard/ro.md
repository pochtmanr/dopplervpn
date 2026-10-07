> **Pe scurt.** WireGuard este cel mai rapid și cel mai simplu protocol VPN de masă, iar într-o rețea nefiltrată este o alegere excelentă. Nu a fost însă proiectat să ascundă că este un VPN, iar în Rusia, Iran și China este printre primele protocoale blocate.

## Ce este WireGuard?

WireGuard este un protocol VPN scris de Jason A. Donenfeld și lansat pentru prima dată în 2015. Scopul lui a fost să înlocuiască protocoalele mari și configurabile de dinainte cu ceva suficient de mic ca să poată fi auditat. În martie 2020 a fost [inclus în nucleul Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), iar aplicații oficiale există acum pentru Windows, macOS, iOS, Android și Linux.

În loc să lase fiecare parte să negocieze o suită de cifruri, WireGuard fixează un singur set de primitive moderne. [Pagina protocolului](https://www.wireguard.com/protocol/) le enumeră: ChaCha20 cu Poly1305 pentru criptare, Curve25519 pentru schimbul de chei și BLAKE2s pentru hash. Nu există nimic de configurat greșit și nicio opțiune mai veche, mai slabă, la care să se revină.

## Cum funcționează?

Fiecare dispozitiv are o pereche de chei, cam ca la SSH. Clientul și serverul își cunosc dinainte cheile publice, iar handshake-ul se bazează pe cadrul de protocol Noise (pagina protocolului numește construcția exactă, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Toate pachetele sunt trimise prin UDP](https://www.wireguard.com/protocol/), iar o sesiune nouă se stabilește într-un singur schimb dus-întors.

De aceea WireGuard se simte rapid. Este puțin de negociat, codul rulează în nucleul sistemului de operare pe Linux, iar trecerea între Wi-Fi și datele mobile se face liniștit, pentru că protocolul nu ține deschisă o conexiune de lungă durată.

## De ce este blocat WireGuard?

Aceeași simplitate care face WireGuard ușor de auditat îl face ușor de recunoscut. [Documentul tehnic](https://www.wireguard.com/papers/wireguard.pdf) specifică mesajele de handshake octet cu octet, așa că primul pachet de la client are mereu 148 de octeți, iar răspunsul are mereu 92 de octeți, fiecare începând cu un câmp fix pentru tipul mesajului. Unui sistem de inspecție profundă a pachetelor (DPI) îi ajunge o regulă scurtă ca să observe tiparul acesta pe UDP.

Cenzorii au făcut exact asta. În august 2023, utilizatori din Rusia [au raportat](https://github.com/net4people/bbs/issues/274) că marii operatori de telefonie mobilă tăiau sesiunile WireGuard imediat după handshake. Criptarea proteja în continuare conținutul, dar conexiunea însăși dispărea.

Este un compromis de proiectare, nu un defect. Autorii WireGuard au ales un protocol fix și minimal, iar deghizarea nu era printre obiective. Proiecte precum [AmneziaWG](/vpn-protocols/amneziawg) schimbă forma pachetelor ca să recapete o parte din camuflaj.

## Când să folosești WireGuard?

- **Rețele nefiltrate.** Acasă, la serviciu sau în călătorie într-o țară care nu blochează VPN-urile, WireGuard este greu de întrecut la viteză și la consumul bateriei.
- **Găzduire proprie.** Dacă îți rulezi propriul server, WireGuard este unul dintre cele mai ușoare protocoale de configurat corect.
- **Nu sub filtrare DPI.** Dacă rețeaua ta blochează VPN-urile, se potrivește mai bine un protocol făcut să arate ca traficul web obișnuit, cum este [VLESS-Reality](/vpn-protocols/vless-reality). Comparația noastră dintre [VLESS-Reality și WireGuard](/blog/vless-reality-vs-wireguard) acoperă compromisul mai pe larg.

## Folosește Doppler WireGuard?

Nu. Aplicațiile Doppler se conectează prin VLESS-Reality, pentru că Doppler este făcut pentru rețele în care WireGuard este filtrat. Ghidul [de ce VLESS](/vpn-protocols/why-vless) explică raționamentul.
