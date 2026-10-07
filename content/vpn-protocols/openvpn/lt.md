> **Trumpai.** OpenVPN yra atvirojo kodo VPN veteranas: lankstus, plačiai palaikomas ir gerai ištirtas per daugiau nei du dešimtmečius. Jis taip pat lėtesnis už naujesnius protokolus ir, remiantis paskelbtais tyrimais, vienas iš lengviausiai interneto tiekėjo atpažįstamų protokolų.

## Kas yra OpenVPN?

OpenVPN yra nemokama atvirojo kodo VPN programinė įranga, kurią James Yonan pirmą kartą išleido [2001 m. gegužę](https://en.wikipedia.org/wiki/OpenVPN). Didžiąją 2000-ųjų ir 2010-ųjų dalį tai buvo numatytasis komercinių VPN paslaugų ir įmonių nuotolinės prieigos pasirinkimas, ir OpenVPN iki šiol diegiamas daugelyje maršrutizatorių bei įmonių produktų.

OpenVPN veikia naudotojo erdvėje, o ne operacinės sistemos branduolyje, ir raktų apsikeitimui remiasi OpenSSL biblioteka bei TLS protokolu. IANA priskirtas prievadas yra 1194, tačiau OpenVPN gali veikti per UDP arba TCP beveik bet kuriame prievade.

## Kaip jis veikia?

OpenVPN naudoja savą protokolą iš dviejų dalių. Valdymo kanalas naudoja TLS, kad autentifikuotų abi puses, paprastai sertifikatais, ir susitartų dėl raktų. Duomenų kanalas tada perduoda jūsų srautą, užšifruotą tais raktais, UDP arba TCP paketų viduje.

Tokia sandara daro OpenVPN labai konfigūruojamą. Galima rinktis šifrus, autentifikavimo būdus, prievadus ir transportą bei leisti jį per proksi. Lankstumo kaina yra sudėtingumas: daugiau kodo, daugiau nuostatų ir daugiau būdų gauti silpną konfigūraciją.

## Kodėl OpenVPN blokuoja?

TLS OpenVPN viduje nėra tas pats, kas HTTPS apsilankymas svetainėje. OpenVPN savo TLS rankos paspaudimą įvelka į savą paketų kadravimą, todėl jo srautas turi formą, kurios įprastas žiniatinklio srautas neturi.

Tyrėjai išmatavo, kiek tai svarbu. Mičigano universiteto ir kitų organizacijų komanda [sukūrė atspaudų nustatymo sistemą](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) ir paleido ją interneto tiekėjo, aptarnaujančio apie milijoną naudotojų, tinkle. Ji atpažino **daugiau kaip 85% OpenVPN srautų** su labai nedaug klaidingų teigiamų rezultatų ir taip pat pagavo daugumą išbandytų komercinių „užmaskuotų“ OpenVPN konfigūracijų.

Tikras filtravimas seka tyrimus. 2023 m. rugpjūtį naudotojai Rusijoje [pranešė](https://github.com/net4people/bbs/issues/274), kad mobiliojo ryšio operatoriai nutraukia OpenVPN ryšius netrukus po jų pradžios.

## Kada verta naudoti OpenVPN?

- **Suderinamumas.** Senesni maršrutizatoriai, įmonių šliuzai ir kai kurie įmonių tinklai palaiko OpenVPN ir nieko naujesnio.
- **Tik TCP tinklai.** OpenVPN gali veikti per TCP, kai UDP užblokuotas, o to [WireGuard](/vpn-protocols/wireguard) be pagalbos negali.
- **Ne filtruojamuose tinkluose.** Ten, kur VPN blokuojami, OpenVPN paprastai nustoja veikti anksti. Geriau tinka protokolas, imituojantis įprastą žiniatinklio srautą, pavyzdžiui [VLESS-Reality](/vpn-protocols/vless-reality). Mūsų [cenzūros vadovas](/bypass-censorship) paaiškina, kaip filtravimo sistemos nusprendžia, ką nutraukti.

## Ar Doppler naudoja OpenVPN?

Ne. Doppler visose platformose naudoja VLESS-Reality. Kaip jį pasirinkome, paaiškina vadovas [„Kodėl VLESS“](/vpn-protocols/why-vless).
