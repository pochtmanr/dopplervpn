> **Na kratko.** IKEv2/IPsec je VPN, ki ga vaš telefon in prenosnik že znata uporabljati brez kakršne koli aplikacije. Je hiter in dobro prenese preklop med Wi-Fi in mobilnimi podatki. Teče pa na fiksnih, dobro znanih vratih, zato je za cenzorja eden najpreprostejših protokolov za blokiranje.

## Kaj je IKEv2/IPsec?

»IKEv2« sta v resnici dva dela, ki delujeta skupaj. IPsec je zbirka, ki šifrira in overja pakete IP. IKE, Internet Key Exchange, je protokol, s katerim se strani overita in dogovorita o ključih IPsec. Različica 2 protokola IKE je bila standardizirana [decembra 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), trenutna specifikacija pa je [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Ker je standard IETF, je IKEv2 vgrajen v iOS, macOS in Windows ter v Android od različice 11. Uporablja ga veliko poslovnih prehodov VPN.

## Kako deluje?

Izmenjava ključev teče prek UDP, [običajno na vratih 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Ko se strani dogovorita o ključih, sklad IPsec operacijskega sistema šifrira vaš promet z Encapsulating Security Payload (ESP). Ko je vmes usmerjevalnik NAT, kot v skoraj vsakem domačem in mobilnem omrežju, sta tako IKE kot ESP ovita v UDP na vratih 4500.

IKEv2 ima standardno razširitev [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), ki povezavi omogoči, da preživi spremembo naslova IP. Zato je IKEv2 na telefonih prijeten: ko stopite iz dosega Wi-Fi na mobilne podatke, se tunel nadaljuje, namesto da bi se povezoval znova od začetka.

## Zakaj je IKEv2 enostavno blokirati?

IKEv2 se sploh ne trudi biti videti kot kaj drugega. Njegov promet uporablja dobro znana vrata UDP in ima standardni obliki IKE in ESP, ki ju zna razčleniti vsako omrežno orodje. Za blokiranje niti ni potreben globok pregled paketov: filter lahko zavrže vrata UDP 500 in 4500 ali neposredno prepozna izmenjavo IKE.

To je razumen kompromis za poslovna omrežja in potovanja v odprtih državah, kjer prepoznavnost kot VPN nič ne stane. V omrežjih, ki VPN-je filtrirajo namenoma, običajno prvi preneha delovati.

## Kdaj uporabiti IKEv2?

- **Ko aplikacija ni dovoljena.** Na upravljani napravi, kjer programske opreme ni mogoče namestiti, je vgrajeni odjemalec IKEv2 morda edina možnost.
- **Mobilni preklop v odprtih omrežjih.** MOBIKE naredi prehod med omrežji gladek.
- **Ne pod cenzuro.** V filtriranih omrežjih izberite protokol, zasnovan tako, da se zlije z okolico, na primer [VLESS-Reality](/vpn-protocols/vless-reality). Naš [vodnik o cenzuri](/bypass-censorship) pojasni, kako blokiranje deluje.

## Ali Doppler uporablja IKEv2?

Ne. Doppler se povezuje z VLESS-Reality v lastnih aplikacijah. Razlogi so v vodniku [zakaj VLESS](/vpn-protocols/why-vless).
