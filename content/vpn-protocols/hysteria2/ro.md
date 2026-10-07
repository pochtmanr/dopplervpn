> **Pe scurt.** Hysteria 2 este un protocol proxy construit pe QUIC, transportul din spatele HTTP/3. Este făcut pentru viteză pe conexiuni slabe și cu pierderi, iar pentru oricine nu are parola serverul lui se comportă ca un site HTTP/3 obișnuit. Punctul lui slab este că depinde de UDP, pe care unele rețele îl limitează sau îl blochează de-a dreptul.

## Ce este Hysteria 2?

Hysteria este un proiect open-source de la [apernet](https://github.com/apernet/hysteria); versiunea 2, un protocol reproiectat, a fost lansată în septembrie 2023. Ca Shadowsocks și VLESS, este un proxy, nu un VPN clasic, iar clienții pot ruta un întreg dispozitiv prin el.

## Cum funcționează?

Potrivit [specificației protocolului](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 rulează peste QUIC, așa cum este definit în [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), cu extensia de datagrame negarantate pentru traficul UDP. QUIC oferă deja criptare TLS 1.3, fluxuri multiplexate și stabilirea rapidă a conexiunii.

Autentificarea este locul unde intervine deghizarea. Specificația cere ca un server Hysteria **să implementeze un server HTTP/3 real** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) și să trateze cererile așa cum ar face orice server web. Un client se autentifică printr-o cerere HTTP/3 specială; oricine altcineva, fie un vizitator curios, fie o sondă activă, primește răspunsuri web obișnuite. Specificația spune că, pentru un terț fără credențiale, serverul se comportă exact ca un server web HTTP/3 standard.

## De ce este rapid?

QUIC rulează peste UDP și își revine după pierderea de pachete fără să oprească fiecare flux, așa cum face TCP. Hysteria poate folosi și propriul control al congestiei, gândit pentru legături instabile, așa că tinde să își păstreze viteza pe rețele mobile aglomerate, pe rute lungi și pe Wi-Fi cu interferențe, acolo unde protocoalele bazate pe TCP încetinesc.

## Cât de greu este de blocat Hysteria 2?

La sondarea activă rezistă bine, pentru că sondele văd un server web. Expunerea este transportul. Un cenzor poate limita sau bloca UDP, sau QUIC anume, fără să strice majoritatea site-urilor, pentru că browserele revin la HTTP/2 peste TCP când HTTP/3 eșuează. Acolo unde se întâmplă asta, Hysteria 2 nu mai are încotro, în timp ce protocoalele bazate pe TCP, cum este [VLESS-Reality](/vpn-protocols/vless-reality), continuă să funcționeze.

## Când să folosești Hysteria 2?

- **Legături cu pierderi sau pe distanță lungă**, unde controlul congestiei și recuperarea pierderilor din QUIC își merită locul.
- **Rețele care permit UDP.** Verifică înainte să contezi pe el.
- Ca al doilea protocol, lângă o opțiune TCP, ca să poți schimba când UDP este filtrat. Al nostru [ghid despre cenzură](/bypass-censorship) acoperă cum vizează filtrele transporturile.

## Folosește Doppler Hysteria 2?

Nu. Doppler folosește VLESS-Reality peste TCP, care continuă să funcționeze în rețelele care blochează UDP. Vezi [de ce VLESS](/vpn-protocols/why-vless).
