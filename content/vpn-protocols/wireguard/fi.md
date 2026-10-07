> **Lyhyesti.** WireGuard on nopein ja yksinkertaisin valtavirran VPN-protokolla, ja suodattamattomassa verkossa se on erinomainen valinta. Sitä ei kuitenkaan koskaan suunniteltu piilottamaan, että se on VPN, ja Venäjällä, Iranissa ja Kiinassa se kuuluu ensimmäisiin estettäviin protokolliin.

## Mikä WireGuard on?

WireGuard on Jason A. Donenfeldin kirjoittama VPN-protokolla, joka julkaistiin ensimmäisen kerran vuonna 2015. Sen tavoite oli korvata sitä edeltäneet suuret, säädettävät protokollat jollakin niin pienellä, että sen voi tarkastaa. Maaliskuussa 2020 se [liitettiin Linux 5.6 -ytimeen](https://en.wikipedia.org/wiki/WireGuard), ja viralliset sovellukset ovat nyt olemassa Windowsille, macOS:lle, iOS:lle, Androidille ja Linuxille.

Sen sijaan, että osapuolet neuvottelisivat salauspaketista, WireGuard kiinnittää yhden joukon nykyaikaisia primitiivejä. Sen [protokollasivu](https://www.wireguard.com/protocol/) luettelee ne: ChaCha20 ja Poly1305 salaukseen, Curve25519 avaintenvaihtoon ja BLAKE2s tiivistämiseen. Ei ole mitään, minkä voisi määrittää väärin, eikä vanhempaa, heikompaa vaihtoehtoa, johon palata.

## Miten se toimii?

Jokaisella laitteella on avainpari, samaan tapaan kuin SSH:ssa. Asiakas ja palvelin tuntevat toistensa julkiset avaimet etukäteen, ja kättely perustuu Noise-protokollakehykseen (protokollasivu nimeää tarkan rakenteen, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Kaikki paketit lähetetään UDP:llä](https://www.wireguard.com/protocol/), ja uusi istunto muodostetaan yhdellä edestakaisella kierroksella.

Tämä rakenne tekee WireGuardista nopean tuntuisen. Neuvoteltavaa on vähän, koodi toimii Linuxissa käyttöjärjestelmän ytimessä, ja siirtymä Wi-Fin ja mobiilidatan välillä hoituu hiljaa, koska protokolla ei pidä pitkäikäistä yhteyttä auki.

## Miksi WireGuard estetään?

Sama yksinkertaisuus, joka tekee WireGuardista helpon tarkastaa, tekee siitä helpon tunnistaa. Sen [tekninen kuvaus](https://www.wireguard.com/papers/wireguard.pdf) määrittelee kättelyviestit tavu tavulta, joten asiakkaan ensimmäinen paketti on aina 148 tavua ja vastaus aina 92 tavua, ja kumpikin alkaa kiinteällä viestityypin kentällä. Syvä pakettitarkastus (DPI) tarvitsee vain lyhyen säännön havaitakseen tämän kuvion UDP:ssä.

Sensuroijat ovat tehneet juuri niin. Elokuussa 2023 käyttäjät Venäjällä [kertoivat](https://github.com/net4people/bbs/issues/274), että suuret mobiilioperaattorit katkaisivat WireGuard-istunnot heti kättelyn jälkeen. Salaus suojasi yhä sisältöä, mutta itse yhteys oli poissa.

Tämä on suunnittelun kompromissi, ei vika. WireGuardin tekijät valitsivat kiinteän, minimaalisen protokollan, eikä naamiointi kuulunut tavoitteisiin. Projektit kuten [AmneziaWG](/vpn-protocols/amneziawg) muuttavat pakettien muotoja palauttaakseen osan peitteestä.

## Milloin WireGuardia kannattaa käyttää?

- **Suodattamattomat verkot.** Kotona, töissä tai matkustaessa maassa, joka ei estä VPN:iä, WireGuardia on vaikea päihittää nopeudessa ja akun kestossa.
- **Oma palvelin.** Jos pidät omaa palvelinta, WireGuard on yksi helpoimmista protokollista asentaa oikein.
- **Ei DPI-suodatuksen alla.** Jos verkko estää VPN:t, paremmin sopii protokolla, joka on tehty näyttämään tavalliselta verkkoliikenteeltä, kuten [VLESS-Reality](/vpn-protocols/vless-reality). Vertailumme [VLESS-Reality ja WireGuard](/blog/vless-reality-vs-wireguard) käy kompromissin tarkemmin läpi.

## Käyttääkö Doppler WireGuardia?

Ei. Dopplerin sovellukset yhdistävät VLESS-Realityn kautta, koska Doppler on rakennettu verkkoihin, joissa WireGuard suodatetaan. [Miksi VLESS](/vpn-protocols/why-vless) -opas selittää perustelut.
