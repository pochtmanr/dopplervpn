> **Īsumā.** Hysteria 2 ir starpniekprotokols, kas būvēts uz QUIC — transporta, kas ir HTTP/3 pamatā. Tas ir veidots ātrumam sliktos un zudumiem bagātos savienojumos, un ikvienam bez paroles tā serveris uzvedas kā parasta HTTP/3 vietne. Tā vājā vieta ir atkarība no UDP, ko daži tīkli ierobežo vai bloķē pavisam.

## Kas ir Hysteria 2?

Hysteria ir atvērtā koda projekts no [apernet](https://github.com/apernet/hysteria); 2. versija, pārveidots protokols, tika izlaista 2023. gada septembrī. Tāpat kā Shadowsocks un VLESS tas ir starpnieks, nevis klasisks VPN, un klienti var novirzīt caur to visu ierīci.

## Kā tas darbojas?

Saskaņā ar tā [protokola specifikāciju](https://v2.hysteria.network/docs/developers/Protocol/) Hysteria 2 darbojas pa QUIC, kā noteikts [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), ar neuzticamo datagrammu paplašinājumu UDP datplūsmai. QUIC jau nodrošina TLS 1.3 šifrēšanu, multipleksētas plūsmas un ātru savienojuma izveidi.

Autentifikācija ir vieta, kur ienāk maskēšanās. Specifikācija prasa, lai Hysteria serveris **īstenotu īstu HTTP/3 serveri** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) un apstrādātu pieprasījumus tā, kā to darītu jebkurš tīmekļa serveris. Klients autentificējas ar īpašu HTTP/3 pieprasījumu; ikviens cits — vai ziņkārīgs apmeklētājs, vai aktīva zonde — saņem parastas tīmekļa atbildes. Specifikācija nosaka, ka trešajai pusei bez pilnvarām serveris uzvedas tieši kā standarta HTTP/3 tīmekļa serveris.

## Kāpēc tas ir ātrs?

QUIC darbojas pa UDP un atgūstas no pakešu zuduma, neapturot katru plūsmu tā, kā to dara TCP. Hysteria var izmantot arī savu sastrēgumu kontroli, kas vērsta uz nestabiliem savienojumiem, tāpēc tā mēdz noturēt ātrumu noslogotos mobilajos tīklos, tālos maršrutos un Wi-Fi ar traucējumiem, kur uz TCP balstīti protokoli palēninās.

## Cik grūti ir bloķēt Hysteria 2?

Pret aktīvo zondēšanu tas turas labi, jo zondes redz tīmekļa serveri. Vājā vieta ir transports. Cenzors var ierobežot vai bloķēt UDP vai konkrēti QUIC, nesalaužot lielāko daļu vietņu, jo pārlūkprogrammas atkāpjas uz HTTP/2 pa TCP, kad HTTP/3 neizdodas. Kur tas notiek, Hysteria 2 nav kur iet, bet uz TCP balstīti protokoli, piemēram, [VLESS-Reality](/vpn-protocols/vless-reality), turpina darboties.

## Kad lietot Hysteria 2?

- **Zudumiem bagātos vai tālos savienojumos**, kur atmaksājas tā sastrēgumu kontrole un QUIC zudumu atgūšana.
- **Tīklos, kas atļauj UDP.** Pārbaudiet, pirms uz to paļauties.
- Kā otrs protokols blakus TCP variantam, lai varētu pārslēgties, kad UDP ir filtrēts. Mūsu [cenzūras ceļvedis](/bypass-censorship) aptver, kā filtri vēršas pret transportiem.

## Vai Doppler izmanto Hysteria 2?

Nē. Doppler izmanto VLESS-Reality pa TCP, kas turpina darboties tīklos, kuri bloķē UDP. Skatiet [kāpēc VLESS](/vpn-protocols/why-vless).
