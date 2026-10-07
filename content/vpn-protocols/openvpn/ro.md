> **Pe scurt.** OpenVPN este veteranul VPN-urilor open-source: flexibil, larg suportat și bine înțeles după mai bine de două decenii. Este și mai lent decât protocoalele mai noi și, potrivit cercetărilor publicate, unul dintre cele mai ușor de amprentat pentru un ISP.

## Ce este OpenVPN?

OpenVPN este un software VPN gratuit și open-source, lansat pentru prima dată de James Yonan [în mai 2001](https://en.wikipedia.org/wiki/OpenVPN). În cea mai mare parte a anilor 2000 și 2010 a fost alegerea implicită pentru serviciile VPN comerciale și pentru accesul la distanță din companii, și încă este livrat în multe routere și produse pentru companii.

Rulează în spațiul utilizatorului, nu în nucleul sistemului de operare, și se bazează pe biblioteca OpenSSL și pe protocolul TLS pentru schimbul de chei. Portul atribuit de IANA este 1194, deși OpenVPN poate rula prin UDP sau TCP pe aproape orice port.

## Cum funcționează?

OpenVPN folosește un protocol propriu, cu două părți. Un canal de control folosește TLS ca să autentifice cele două părți, de obicei cu certificate, și ca să cadă de acord asupra cheilor. Un canal de date transportă apoi traficul tău, criptat cu acele chei, în pachete UDP sau TCP.

Structura aceasta face OpenVPN foarte configurabil. Poți alege cifruri, metode de autentificare, porturi și transporturi și îl poți rula prin proxy-uri. Prețul flexibilității este complexitatea: mai mult cod, mai multe setări și mai multe feluri de a ajunge la o configurație slabă.

## De ce este blocat OpenVPN?

TLS din interiorul OpenVPN nu este același lucru cu o vizită HTTPS pe un site. OpenVPN își învelește handshake-ul TLS în propria încadrare de pachete, așa că traficul lui are o formă pe care traficul web obișnuit nu o are.

Cercetătorii au măsurat cât contează asta. O echipă de la University of Michigan și alții [au construit un sistem de amprentare](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) și l-au rulat în interiorul unui ISP cu aproximativ un milion de utilizatori. Sistemul a identificat **peste 85% din fluxurile OpenVPN**, cu foarte puține rezultate fals pozitive, și a prins majoritatea configurațiilor comerciale OpenVPN „mascate” pe care le-au testat.

Filtrarea din lumea reală urmează cercetarea. În august 2023, utilizatori din Rusia [au raportat](https://github.com/net4people/bbs/issues/274) că operatorii de telefonie mobilă tăiau conexiunile OpenVPN la scurt timp după ce începeau.

## Când să folosești OpenVPN?

- **Compatibilitate.** Routerele mai vechi, gateway-urile de companie și unele rețele corporative suportă OpenVPN și nimic mai nou.
- **Rețele doar cu TCP.** OpenVPN poate rula prin TCP când UDP este blocat, ceea ce [WireGuard](/vpn-protocols/wireguard) nu poate face fără ajutor.
- **Nu în rețele filtrate.** Acolo unde VPN-urile sunt blocate, OpenVPN tinde să cedeze devreme. Unealta mai potrivită este un protocol care imită traficul web normal, cum este [VLESS-Reality](/vpn-protocols/vless-reality). Al nostru [ghid despre cenzură](/bypass-censorship) explică cum decid sistemele de filtrare ce să taie.

## Folosește Doppler OpenVPN?

Nu. Doppler folosește VLESS-Reality pe fiecare platformă. Ghidul [de ce VLESS](/vpn-protocols/why-vless) explică cum l-am ales.
