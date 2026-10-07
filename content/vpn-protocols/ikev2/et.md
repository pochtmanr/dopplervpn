> **Lühidalt.** IKEv2/IPsec on VPN, mida teie telefon ja sülearvuti juba oskavad kasutada ilma ühegi rakenduseta. See on kiire ja tuleb hästi toime Wi-Fi ja mobiilandmeside vahel vahetamisega. See töötab ka fikseeritud, üldtuntud portidel, mis teeb sellest ühe lihtsama protokolli, mida tsensor saab blokeerida.

## Mis on IKEv2/IPsec?

„IKEv2“ on tegelikult kaks osa, mis töötavad koos. IPsec on komplekt, mis krüpteerib ja autentib IP-pakette. IKE, Internet Key Exchange, on protokoll, millega pooled teineteist autentivad ja lepivad kokku IPseci võtmetes. IKE versioon 2 standarditi [2005. aasta detsembris](https://en.wikipedia.org/wiki/Internet_Key_Exchange) ning kehtiv spetsifikatsioon on [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Kuna see on IETF-i standard, on IKEv2 sisse ehitatud iOS-i, macOS-i ja Windowsi ning Androidisse alates versioonist 11. Paljud ettevõtte VPN-lüüsid kasutavad seda.

## Kuidas see töötab?

Võtmevahetus käib UDP kaudu, [tavaliselt pordil 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Kui pooled on võtmetes kokku leppinud, krüpteerib operatsioonisüsteemi IPseci pinu teie liikluse, kasutades ESP-d (Encapsulating Security Payload). Kui vahel on NAT-ruuter, nagu peaaegu igas kodu- ja mobiilivõrgus, mähitakse nii IKE kui ka ESP UDP-sse pordil 4500.

IKEv2-l on standardne laiendus nimega [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), mis laseb ühendusel IP-aadressi muutuse üle elada. Seepärast on IKEv2 telefonis mugav: väljute Wi-Fi levialast mobiilandmesidele ja tunnel jätkab, selle asemel et otsast peale uuesti ühenduda.

## Miks on IKEv2 lihtne blokeerida?

IKEv2 ei püüagi millegi muu moodi välja näha. Selle liiklus kasutab üldtuntud UDP-porte ning sellel on standardsed IKE ja ESP vormingud, mida iga võrguvahend oskab lugeda. Blokeerimiseks pole isegi süvapaketikontrolli vaja: filter võib UDP-pordid 500 ja 4500 ära visata või IKE vahetuse otse ära tunda.

Ettevõtte võrkudes ja reisimisel avatud riikides on see mõistlik kompromiss, sest VPN-ina äratuntav olemine ei maksa seal midagi. Võrkudes, mis filtreerivad VPN-e meelega, lakkab see tavaliselt esimesena töötamast.

## Millal IKEv2 kasutada?

- **Kui rakendust paigaldada ei tohi.** Hallataval seadmel, kuhu tarkvara paigaldada ei saa, võib sisseehitatud IKEv2 klient olla ainus võimalus.
- **Mobiilne liikumine avatud võrkudes.** MOBIKE teeb võrkude vahel liikumise sujuvaks.
- **Mitte tsensuuri all.** Filtreeritud võrkudes valige protokoll, mis on loodud sulanduma, näiteks [VLESS-Reality](/vpn-protocols/vless-reality). Meie [tsensuurijuhend](/bypass-censorship) selgitab, kuidas blokeerimine töötab.

## Kas Doppler kasutab IKEv2?

Ei. Doppler ühendub VLESS-Realityga enda rakendustes. Põhjused on juhendis [miks VLESS](/vpn-protocols/why-vless).
