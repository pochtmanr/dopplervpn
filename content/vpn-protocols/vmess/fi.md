> **Lyhyesti.** VMess on V2Ray-projektin alkuperäinen protokolla. Se salaa omat otsikkonsa ja kääritään yleensä toiseen kuljetukseen, kuten WebSocketiin TLS:n päällä, jotta se näyttäisi verkkoliikenteeltä. Se toimii yhä, mutta sen seuraajat, VLESS ja Trojan, tekevät saman työn pienemmällä yleiskustannuksella.

## Mikä VMess on?

VMess on salattu välitysprotokolla, jonka [V2Ray-projekti](https://github.com/v2fly/v2ray-core) esitteli aloittaessaan vuonna 2015. V2Ray kasvoi modulaariseksi alustaksi välityspalvelinten rakentamiseen: yksi ydin, monta protokollaa ja kuljetusta sekä reititysmoottori, joka päättää, mikä liikenne menee minne. VMess oli sen ensimmäinen protokolla ja usean vuoden ajan sen pääprotokolla.

Kuten Shadowsocks, VMess on teknisesti välityspalvelin eikä VPN, mutta V2Ray-pohjaiset sovellukset voivat ohjata koko laitteen sen kautta.

## Miten se toimii?

Jokaisella käyttäjällä on UUID, joka toimii tunnuksena. [Protokolladokumentaation](https://www.v2fly.org/en_US/developer/protocols/vmess.html) mukaan asiakkaan pyyntöotsikko sisältää salatun todennustunnuksen, joka kootaan Unix-aikaleimasta, satunnaisluvusta ja tarkistussummasta ja salataan käyttäjän tunnuksesta johdetulla avaimella. Palvelin tunnistaa sillä käyttäjän ja purkaa sitten otsikon lopun ja datan.

Dokumentaatio kuvaa kaksi tapaa suojata otsikko. Nykyaikainen käyttää AEAD-salausta, joka takaa, ettei otsikkoa ole muutettu. Vanhempi käytti MD5:tä ja AES-128-CFB:tä eikä voinut taata otsikon eheyttä; dokumentaatio varoittaa siitä. Koska todennustunnus sisältää aikaleiman, asiakkaan ja palvelimen kellojen pitää olla suunnilleen samassa ajassa. Se on yleinen syy ongelmiin, joissa "se ei vain yhdistä".

## Kuinka vaikea VMess on estää?

Sellaisenaan VMess näyttää satunnaisilta tavuilta, mikä asettaa sen samaan asemaan kuin [Shadowsocks](/vpn-protocols/shadowsocks): alttiiksi palomuureille, jotka estävät täysin salattua liikennettä. Siksi VMess otetaan yleensä käyttöön WebSocketin tai gRPC:n sisällä TLS:n päällä, verkkotunnuksen ja sertifikaatin takana, jotta tarkkailija näkee jotain, joka näyttää tavalliselta HTTPS-yhteydeltä sivustolle.

Tuo kääre tekee suurimman osan liikenteen piilottamisesta, ja sillä on hintansa: tarvitaan verkkotunnus, sertifikaatti ja usein CDN palvelimen eteen, ja palvelin salaa datan kahdesti, kerran TLS:ää ja kerran VMess:ää varten.

## VMess, VLESS vai Trojan?

[VLESS](/vpn-protocols/vless-reality) suunniteltiin Xray-projektissa kevyemmäksi seuraajaksi: se säilyttää UUID-pohjaisen tunnistuksen mutta luopuu VMessin omasta salauksesta ja nojaa kokonaan TLS-kerrokseen, mikä välttää kaksinkertaisen salauksen. [Trojan](/vpn-protocols/trojan) käyttää samanlaista lähestymistapaa salasanalla UUID:n sijaan. Vertailumme [VLESS, VMess ja Trojan](/blog/vless-vs-vmess-vs-trojan) käy yksityiskohdat läpi.

## Käyttääkö Doppler VMess:ää?

Ei. Doppler käyttää VLESS:ää ja Realityä. [Miksi VLESS](/vpn-protocols/why-vless) -opas kertoo miksi.
