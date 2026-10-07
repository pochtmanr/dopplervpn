> **Pe scurt.** IKEv2/IPsec este VPN-ul pe care telefonul și laptopul tău îl știu deja să-l folosească, fără nicio aplicație. Este rapid și trece bine de la Wi-Fi la date mobile. Rulează însă pe porturi fixe, bine cunoscute, ceea ce îl face unul dintre cele mai simple protocoale de blocat pentru un cenzor.

## Ce este IKEv2/IPsec?

„IKEv2” înseamnă, de fapt, două piese care lucrează împreună. IPsec este suita care criptează și autentifică pachetele IP. IKE, Internet Key Exchange, este protocolul prin care cele două părți se autentifică reciproc și cad de acord asupra cheilor IPsec. Versiunea 2 a IKE a fost standardizată [în decembrie 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), iar specificația actuală este [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Pentru că este un standard IETF, IKEv2 este integrat în iOS, macOS și Windows, iar în Android începând cu versiunea 11. Multe gateway-uri VPN de companie îl folosesc.

## Cum funcționează?

Schimbul de chei rulează prin UDP, [de obicei pe portul 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). După ce cele două părți cad de acord asupra cheilor, stiva IPsec a sistemului de operare îți criptează traficul cu Encapsulating Security Payload (ESP). Când în cale este un router NAT, ca în aproape orice rețea de acasă sau mobilă, atât IKE, cât și ESP sunt învelite în UDP pe portul 4500.

IKEv2 are o extensie standard numită [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), care lasă o conexiune să supraviețuiască unei schimbări de adresă IP. De aceea IKEv2 este plăcut pe telefoane: ieși din zona Wi-Fi pe date mobile, iar tunelul continuă, în loc să se reconecteze de la zero.

## De ce este IKEv2 ușor de blocat?

IKEv2 nu încearcă să arate ca altceva. Traficul lui folosește porturi UDP bine cunoscute și are formatele standard IKE și ESP, pe care orice unealtă de rețea le poate analiza. Blocarea nici măcar nu cere inspecție profundă a pachetelor: un filtru poate arunca porturile UDP 500 și 4500 sau poate recunoaște direct schimbul IKE.

Este un compromis rezonabil pentru rețelele de companie și pentru călătoriile în țări deschise, unde a fi recunoscut ca VPN nu costă nimic. În rețelele care filtrează VPN-urile intenționat, de obicei este primul care se oprește.

## Când să folosești IKEv2?

- **Când nu e permisă nicio aplicație.** Pe un dispozitiv administrat, unde nu poți instala software, clientul IKEv2 integrat poate fi singura opțiune.
- **Roaming mobil în rețele deschise.** MOBIKE face trecerea lină când te muți între rețele.
- **Nu sub cenzură.** În rețelele filtrate, alege un protocol făcut să se amestece în trafic, cum este [VLESS-Reality](/vpn-protocols/vless-reality). Al nostru [ghid despre cenzură](/bypass-censorship) explică cum funcționează blocarea.

## Folosește Doppler IKEv2?

Nu. Doppler se conectează cu VLESS-Reality în propriile aplicații. Vezi [de ce VLESS](/vpn-protocols/why-vless) pentru motive.
