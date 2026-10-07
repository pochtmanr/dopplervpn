> **Na kratko.** Shadowsocks je lahek šifriran proxy, narejen na Kitajskem za prehod skozi Veliki kitajski požarni zid. Leta je deloval tako, da ni bil videti kot nič. Od leta 2021 raziskave kažejo, da požarni zid blokira prav tak promet, ker je pravi promet redko tako naključen.

## Kaj je Shadowsocks?

Shadowsocks je odprtokodni proxy protokol, prvič izdan [aprila 2012](https://en.wikipedia.org/wiki/Shadowsocks). Strogo vzeto to ni VPN: je proxy v slogu SOCKS5 s šifriranjem, aplikacije pa same odločijo, kateri promet poslati skozenj. V praksi večina odjemalcev Shadowsocks zdaj ponuja način za celotno napravo, ki se obnaša kot VPN.

Priljubljen je, ker je preprost in hiter. Trenutne različice uporabljajo [šifre AEAD](https://shadowsocks.org/doc/aead.html), ki v enem koraku zagotovijo zaupnost, celovitost in pristnost, [izdaja protokola iz leta 2022](https://shadowsocks.org/doc/sip022.html) pa je okrepila zaščito pred ponavljanjem.

## Kako deluje?

Odjemalec in strežnik si delita geslo, iz katerega nastane šifrirni ključ. Vse, kar odjemalec pošlje, vključno z naslovom spletnega mesta, ki ga želi, je šifrirano od prvega bajta. Ni prepoznavnega rokovanja, certifikata ali glave v čistopisu. Za opazovalca je povezava Shadowsocks tok bajtov, ki so videti naključni.

## Kako Veliki kitajski požarni zid zazna Shadowsocks?

Najprej z aktivnim sondiranjem. Raziskovalci pri GFW Report so [zabeležili](https://gfw.report/publications/imc20/en/), kako je požarni zid na domnevne strežnike Shadowsocks poslal desettisoče sond, pri tem pa ponavljal in spreminjal prave povezave, da bi videl, kako se strežnik odzove.

Nato, od novembra 2021, z bolj grobo in širšo metodo. [Študija z USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) je ugotovila, da požarni zid v realnem času blokira »popolnoma šifriran« promet. Pogleda prvi paket povezave in izvzame vse, kar je videti kot znan protokol ali vsebuje dovolj natisljivega besedila. Eno pravilo meri povprečno število nastavljenih bitov na bajt: vrednosti 3.4 ali manj oziroma 4.6 ali več so izvzete, podatki, ki so videti naključni in padejo vmes, pa ne. Kar ostane, je mogoče blokirati.

Raziskovalci so tudi ugotovili, da je požarni zid to uporabil pri približno 26% povezav in samo pri obsegih IP priljubljenih podatkovnih centrov, verjetno zato, da omeji spremljajočo škodo. Nauk za snovalce protokolov je bil jasen: videti naključno je samo po sebi prstni odtis.

## Kdaj uporabiti Shadowsocks?

- **Lahko, hitro posredovanje** v omrežjih, ki prometa ne pregledujejo natančno.
- **Lastni strežnik** z orodji, kot je Outline, ki nastavitev naredijo preprosto.
- **Previdno ob močnem filtriranju.** Na Kitajskem in drugod, kjer blokirajo popolnoma šifriran promet, je Shadowsocks veliko manj zanesljiv od protokolov, ki posnemajo pravi TLS, na primer [VLESS-Reality](/vpn-protocols/vless-reality). Naša [zgodovina protokolov za obhod cenzure](/blog/censorship-protocol-history) pokaže, kako se je področje premaknilo naprej.

## Ali Doppler uporablja Shadowsocks?

Ne. Doppler uporablja VLESS-Reality, iz razlogov v vodniku [zakaj VLESS](/vpn-protocols/why-vless).
