> **Pe scurt.** Trojan ascunde traficul de proxy într-o conexiune TLS reală către un site real pe care îl controlezi. Cine se conectează fără parolă primește pur și simplu site-ul. Funcționează bine, dar îți trebuie propriul domeniu și propriul certificat, iar acestea pot fi găsite și blocate.

## Ce este Trojan?

Trojan este un protocol proxy din [proiectul trojan-gfw](https://github.com/trojan-gfw/trojan), lansat pentru prima dată în octombrie 2017. Ideea stă în nume: în loc să inventeze o deghizare, se ascunde în cel mai răspândit trafic criptat de pe internet, HTTPS.

## Cum funcționează?

[Descrierea protocolului](https://trojan-gfw.github.io/trojan/protocol) este scurtă. Un server Trojan ascultă ca un server HTTPS normal, cu un certificat real pentru un domeniu real. Clientul face un handshake TLS autentic. Apoi, în interiorul conexiunii criptate, trimite:

- hash-ul SHA-224 codificat hexazecimal al parolei partajate, care are 56 de caractere,
- o linie nouă,
- o cerere mică care spune unde trebuie să meargă traficul, într-un format asemănător cu SOCKS5,
- încă o linie nouă, urmată de prima bucată de date.

Dacă hash-ul și cererea sunt valide, serverul deschide un tunel către destinație. Dacă ceva este greșit, serverul tratează conexiunea ca „alte protocoale” și o pasează unui server web de rezervă, așa că vizitatorul vede un site obișnuit.

## Cât de greu este de blocat Trojan?

Din exterior, o conexiune Trojan este o sesiune TLS către domeniul tău, cu certificatul tău. Sondele active primesc înapoi un site real. Asta îl face pe Trojan mult mai greu de izolat decât protocoalele care arată aleatoriu, cum este [Shadowsocks](/vpn-protocols/shadowsocks).

Punctul lui slab este domeniul însuși. Fiecare server are nevoie de un domeniu și de un certificat, iar un cenzor care află ce domenii aparțin proxy-urilor le poate bloca după nume sau după IP. Cercetătorii au arătat și că TLS purtat în interiorul TLS lasă tipare de timp și de dimensiune care pot fi [amprentate](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), ceea ce afectează Trojan și proiectele asemănătoare.

[VLESS-Reality](/vpn-protocols/vless-reality) înlătură problema domeniului, împrumutând handshake-ul TLS al unui site existent și popular, în locul celui propriu.

## Când să folosești Trojan?

- **Când controlezi un domeniu** și vrei o configurare simplă, bine înțeleasă, care arată ca HTTPS.
- **În rețele filtrate moderat**, unde domeniul tău are puține șanse să fie vizat.
- Comparația noastră dintre [VLESS, VMess și Trojan](/blog/vless-vs-vmess-vs-trojan) ajută dacă alegi între ele.

## Folosește Doppler Trojan?

Nu. Doppler folosește VLESS-Reality, care nu are nevoie de un domeniu propriu. Vezi [de ce VLESS](/vpn-protocols/why-vless).
