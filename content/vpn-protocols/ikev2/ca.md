> **En resum.** IKEv2/IPsec és la VPN que el teu telèfon i el teu portàtil ja saben parlar sense cap aplicació. És ràpida i gestiona bé el canvi entre Wi-Fi i dades mòbils. També funciona en ports fixos i ben coneguts, cosa que la converteix en un dels protocols més senzills de bloquejar per a un censor.

## Què és IKEv2/IPsec?

«IKEv2» són en realitat dues peces que treballen juntes. IPsec és el conjunt que xifra i autentica els paquets IP. IKE, l'Internet Key Exchange, és el protocol que les dues bandes fan servir per autenticar-se mútuament i acordar les claus IPsec. La versió 2 d'IKE es va estandarditzar [el desembre de 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), i l'especificació actual és [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Com que és un estàndard IETF, IKEv2 està integrat a iOS, macOS i Windows, i a Android des de la versió 11. Moltes passarel·les VPN corporatives el fan servir.

## Com funciona?

L'intercanvi de claus va per UDP, [normalment al port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Un cop les dues bandes acorden les claus, la pila IPsec del sistema operatiu xifra el teu trànsit amb l'Encapsulating Security Payload (ESP). Quan hi ha un encaminador NAT pel mig, com a gairebé totes les xarxes domèstiques i mòbils, tant IKE com ESP s'embolcallen en UDP al port 4500.

IKEv2 té una extensió estàndard anomenada [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) que permet que una connexió sobrevisqui a un canvi d'adreça IP. Per això IKEv2 és còmode als telèfons: surts de la cobertura Wi-Fi cap a les dades mòbils i el túnel continua, en lloc de reconnectar-se des de zero.

## Per què és fàcil bloquejar IKEv2?

IKEv2 no intenta semblar res més. El seu trànsit fa servir ports UDP ben coneguts i té els formats estàndard d'IKE i d'ESP que qualsevol eina de xarxa pot analitzar. Bloquejar-lo ni tan sols exigeix inspecció profunda de paquets: un filtre pot descartar els ports UDP 500 i 4500, o reconèixer l'intercanvi IKE directament.

Això és un compromís raonable per a xarxes corporatives i per viatjar en països oberts, on ser reconegut com a VPN no costa res. A les xarxes que filtren les VPN expressament, acostuma a ser el primer que deixa de funcionar.

## Quan has de fer servir IKEv2?

- **Quan no es pot instal·lar cap aplicació.** En un dispositiu gestionat on no pots instal·lar programari, el client IKEv2 integrat pot ser l'única opció.
- **Itinerància mòbil en xarxes obertes.** MOBIKE fa que el pas d'una xarxa a una altra sigui fluid.
- **No sota censura.** En xarxes filtrades, tria un protocol dissenyat per confondre's amb el trànsit normal, com [VLESS-Reality](/vpn-protocols/vless-reality). La nostra [guia de censura](/bypass-censorship) explica com funcionen els bloquejos.

## Doppler fa servir IKEv2?

No. Doppler es connecta amb VLESS-Reality dins de les seves pròpies aplicacions. Mira [per què VLESS](/vpn-protocols/why-vless) per als motius.
