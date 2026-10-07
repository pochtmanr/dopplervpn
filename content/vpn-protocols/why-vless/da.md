> **Den korte version.** Vi byggede Doppler til mennesker på netværk, der blokerer VPN'er. På de netværk er spørgsmålet ikke, hvilken protokol der er hurtigst på papiret, men hvilken der stadig er forbundet i morgen. Vi valgte VLESS med Reality, fordi den giver en censor mindst at genkende og mindst at blokere, og vi accepterer de kompromiser, der følger med.

## Til hvad valgte vi?

Doppler er bygget til mennesker, der forbinder fra steder, hvor VPN'er filtreres med vilje: Rusland, Iran, Kina, dele af Golfen. På de netværk er kryptering den nemme del. Hver protokol i vores [sammenligning](/vpn-protocols) krypterer godt. Det, der adskiller dem, er, om et filtreringssystem kan se, at forbindelsen er en VPN, og hvad det kan blokere, når det kan.

Så vi vurderede hver mulighed ud fra tre spørgsmål:

1. **Har den et fast fingeraftryk?** Et handshake med fast størrelse eller en standardport kan matches af én enkelt regel.
2. **Hvad sker der, når en censor sonderer serveren?** Firewalls forbinder aktivt til mistænkte proxyer for at se, hvordan de svarer.
3. **Er der noget at sætte på en blokeringsliste?** Et domæne, et certifikat eller en genkendelig server er et mål, selv om selve trafikken er godt skjult.

## Hvorfor ikke WireGuard, OpenVPN eller IKEv2?

Alle tre fejler det første spørgsmål. Handshake-pakkerne i [WireGuard](/vpn-protocols/wireguard) er altid 148 og 92 byte. [OpenVPN](/vpn-protocols/openvpn) blev genkendt i over 85% af flowene af forskere, der arbejdede inde i en rigtig internetudbyder. [IKEv2](/vpn-protocols/ikev2) kører på standard-UDP-porte, der kan droppes i ét hug. I august 2023 [rapporterede](https://github.com/net4people/bbs/issues/274) brugere i Rusland, at operatører afbrød WireGuard og OpenVPN inden for de første pakker. Det er gode protokoller til åbne netværk. De blev ikke designet til vores.

## Hvorfor ikke Shadowsocks eller VMess?

De består det første spørgsmål ved at ligne tilfældige byte, og det viste sig at være et fingeraftryk i sig selv. Siden november 2021 har den store firewall [blokeret fuldt krypteret trafik](https://gfw.report/publications/usenixsecurity23/en/), der ikke ligner nogen kendt protokol. [VMess](/vpn-protocols/vmess) kan pakkes ind i TLS for at undgå det, men så skal den bruge et domæne, og så er vi ved det tredje spørgsmål.

## Hvorfor ikke Trojan?

[Trojan](/vpn-protocols/trojan) svarer godt på de to første spørgsmål: det er ægte TLS, og sonder ser et rigtigt website. Men hver Trojan-server skal bruge sit eget domæne og certifikat. Når en censor kender det domæne, kan det blokeres, og det er en konstant jagt at drive mange domæner.

## Hvad VLESS-Reality gør rigtigt

[VLESS-Reality](/vpn-protocols/vless-reality) svarer på alle tre:

- **Intet fast fingeraftryk.** Forbindelsen er TLS 1.3 over TCP, den mest udbredte krypterede trafik på internettet.
- **Sonder ser et rigtigt website.** Reality sender alle, der ikke kan godkende sig, videre til det rigtige site, hvis handshake den låner, med sitets ægte certifikat.
- **Intet af vores at blokere efter navn.** Der er intet Doppler-domæne eller -certifikat i handshaket.

Den kører også over TCP, så den bliver ved med at virke på netværk, der drosler eller blokerer UDP, hvor [Hysteria 2](/vpn-protocols/hysteria2) og [AmneziaWG](/vpn-protocols/amneziawg) har det svært. Og selve VLESS er lille: den bygger på TLS til kryptering i stedet for at tilføje sin egen, så der ikke er dobbelt kryptering.

## Hvad vi gav afkald på

- **Rå hastighed på forbindelser med pakketab.** TCP kommer sig mindre elegant over pakketab end QUIC eller WireGuards UDP. På en ren forbindelse er forskellen lille; på en dårlig kan den mærkes.
- **Indbygget OS-understøttelse.** Intet operativsystem leveres med en VLESS-klient, så du skal bruge en app. Vi besluttede, at det var acceptabelt, og byggede vores egne til iOS, Android, macOS og Windows.
- **Fuld usynlighed.** Den findes ikke. Forskning har vist, at [TLS inde i TLS kan fingeraftrykkes](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), og i november 2025 [blev det rapporteret](https://github.com/net4people/bbs/issues/546), at nogle russiske internetudbydere afbrød Reality-forbindelser. VLESS-Reality er et design til censurmodstand, ikke en garanti.

## Hvad vi gør ved begrænsningerne

Censur ændrer sig, så protokolvalget er ikke afslutningen på arbejdet. Vi justerer serverindstillinger og de sites, Reality låner, efterhånden som filtreringen ændrer sig, og vi følger den samme forskning og de samme fællesskabsrapporter, som disse sider henviser til. Hvis en bedre tilgang viser sig, står det her.

Den fulde tekniske gennemgang af, hvordan VLESS-Reality virker, står i [VLESS-Reality-tunnelen](/how-it-works/vless-reality-tunnel). For at prøve den, se [VLESS VPN](/vless-vpn).
