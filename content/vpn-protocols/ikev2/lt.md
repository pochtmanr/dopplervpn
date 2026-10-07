> **Trumpai.** IKEv2/IPsec yra VPN, kurį jūsų telefonas ir nešiojamasis kompiuteris jau moka naudoti be jokios programėlės. Jis greitas ir gerai ištveria perėjimą tarp Wi-Fi ir mobiliojo ryšio. Jis taip pat veikia fiksuotuose, gerai žinomuose prievaduose, todėl cenzoriui tai vienas paprasčiausių protokolų užblokuoti.

## Kas yra IKEv2/IPsec?

„IKEv2“ iš tikrųjų yra dvi kartu veikiančios dalys. IPsec yra rinkinys, kuris šifruoja ir autentifikuoja IP paketus. IKE, Internet Key Exchange, yra protokolas, kuriuo abi pusės autentifikuoja viena kitą ir susitaria dėl IPsec raktų. 2-oji IKE versija buvo standartizuota [2005 m. gruodį](https://en.wikipedia.org/wiki/Internet_Key_Exchange), o dabartinė specifikacija yra [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Kadangi tai IETF standartas, IKEv2 įtaisytas į iOS, macOS ir Windows, o į Android — nuo 11 versijos. Jį naudoja daugelis įmonių VPN šliuzų.

## Kaip jis veikia?

Raktų apsikeitimas vyksta per UDP, [paprastai 500 prievadu](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Kai abi pusės susitaria dėl raktų, operacinės sistemos IPsec stekas šifruoja jūsų srautą naudodamas Encapsulating Security Payload (ESP). Kai kelyje yra NAT maršrutizatorius, kaip beveik kiekviename namų ir mobiliajame tinkle, ir IKE, ir ESP įvelkami į UDP 4500 prievadu.

IKEv2 turi standartinį plėtinį [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), kuris leidžia ryšiui ištverti IP adreso pasikeitimą. Todėl IKEv2 patogus telefonuose: išėjus iš Wi-Fi zonos į mobilųjį ryšį, tunelis tęsiasi, o ne užmezgamas iš naujo.

## Kodėl IKEv2 lengva užblokuoti?

IKEv2 net nebando atrodyti kaip kas nors kita. Jo srautas naudoja gerai žinomus UDP prievadus ir turi standartinius IKE bei ESP formatus, kuriuos supranta bet kuris tinklo įrankis. Blokavimui net nereikia giluminės paketų patikros: filtras gali atmesti UDP 500 ir 4500 prievadus arba atpažinti IKE apsikeitimą tiesiogiai.

Įmonių tinklams ir kelionėms atvirose šalyse tai protingas kompromisas: ten būti atpažintam kaip VPN nieko nekainuoja. Tinkluose, kurie VPN filtruoja tyčia, jis paprastai nustoja veikti pirmas.

## Kada verta naudoti IKEv2?

- **Kai programėlės neleidžiamos.** Valdomame įrenginyje, kur programinės įrangos įdiegti negalima, įtaisytas IKEv2 klientas gali būti vienintelė galimybė.
- **Judėjimas atviruose tinkluose.** MOBIKE padaro perėjimą tarp tinklų sklandų.
- **Ne cenzūros sąlygomis.** Filtruojamuose tinkluose rinkitės protokolą, sukurtą susilieti su įprastu srautu, pavyzdžiui [VLESS-Reality](/vpn-protocols/vless-reality). Kaip veikia blokavimas, paaiškina mūsų [cenzūros vadovas](/bypass-censorship).

## Ar Doppler naudoja IKEv2?

Ne. Doppler jungiasi per VLESS-Reality savo programėlėse. Priežastys — vadove [„Kodėl VLESS“](/vpn-protocols/why-vless).
