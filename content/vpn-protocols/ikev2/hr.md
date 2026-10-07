> **Ukratko.** IKEv2/IPsec je VPN kojim vaš telefon i prijenosno računalo već znaju komunicirati bez ikakve aplikacije. Brz je i dobro podnosi prebacivanje između Wi-Fi-ja i mobilnih podataka. Radi i na fiksnim, dobro poznatim portovima, što ga čini jednim od najjednostavnijih protokola koje cenzor može blokirati.

## Što je IKEv2/IPsec?

„IKEv2” zapravo su dva dijela koja rade zajedno. IPsec je skup koji šifrira i autentificira IP pakete. IKE, Internet Key Exchange, protokol je kojim dvije strane potvrđuju identitet jedna drugoj i dogovaraju ključeve IPsec-a. Inačica 2 protokola IKE standardizirana je [u prosincu 2005.](https://en.wikipedia.org/wiki/Internet_Key_Exchange), a aktualna specifikacija je [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Budući da je standard IETF-a, IKEv2 je ugrađen u iOS, macOS i Windows, a u Android od inačice 11. Mnogi poslovni VPN pristupnici ga koriste.

## Kako radi?

Razmjena ključeva ide preko UDP-a, [obično na portu 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Kad se dvije strane dogovore o ključevima, IPsec stog operacijskog sustava šifrira vaš promet pomoću ESP-a (Encapsulating Security Payload). Kad je na putu NAT usmjerivač, kao na gotovo svakoj kućnoj i mobilnoj mreži, i IKE i ESP omotani su u UDP na portu 4500.

IKEv2 ima standardno proširenje zvano [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) koje vezi omogućuje da preživi promjenu IP adrese. Zato je IKEv2 ugodan na telefonima: izađete iz dometa Wi-Fi-ja na mobilne podatke i tunel se nastavlja umjesto da se spaja ispočetka.

## Zašto je IKEv2 lako blokirati?

IKEv2 ne pokušava izgledati kao nešto drugo. Njegov promet koristi dobro poznate UDP portove i ima standardne formate IKE i ESP koje svaki mrežni alat može raščlaniti. Za blokiranje nije potrebna čak ni duboka inspekcija paketa: filtar može odbaciti UDP portove 500 i 4500 ili izravno prepoznati razmjenu IKE-a.

To je razuman kompromis za poslovne mreže i putovanja u otvorenim zemljama, gdje prepoznavanje da je riječ o VPN-u ništa ne stoji. Na mrežama koje namjerno filtriraju VPN-ove obično prvi prestaje raditi.

## Kada koristiti IKEv2?

- **Kad aplikacija nije dopuštena.** Na upravljanom uređaju, gdje ne možete instalirati softver, ugrađeni klijent IKEv2 može biti jedina mogućnost.
- **Prijelaz između mreža na otvorenim mrežama.** MOBIKE čini prijelaz glatkim kad se krećete između mreža.
- **Ne pod cenzurom.** Na filtriranim mrežama odaberite protokol osmišljen da se stapa s ostalim prometom, poput [VLESS-Reality](/vpn-protocols/vless-reality). Naš [vodič o cenzuri](/bypass-censorship) objašnjava kako blokiranje radi.

## Koristi li Doppler IKEv2?

Ne. Doppler se povezuje s VLESS-Reality unutar vlastitih aplikacija. Razloge pogledajte u vodiču [zašto VLESS](/vpn-protocols/why-vless).
