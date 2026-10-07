> **Ukratko.** Doppler smo gradili za ljude na mrežama koje blokiraju VPN-ove. Na tim mrežama pitanje nije koji je protokol najbrži na papiru, nego koji će i sutra ostati spojen. Odabrali smo VLESS s Realityjem jer cenzoru daje najmanje toga za prepoznati i najmanje toga za blokirati, i prihvaćamo kompromise koji uz to idu.

## Za što smo birali?

Doppler je građen za ljude koji se spajaju s mjesta gdje se VPN-ovi namjerno filtriraju: Rusija, Iran, Kina, dijelovi Perzijskog zaljeva. Na tim mrežama šifriranje je lakši dio. Svaki protokol u našoj [usporedbi](/vpn-protocols) dobro šifrira. Ono po čemu se razlikuju jest može li sustav filtriranja prepoznati da je veza VPN i što može blokirati kad to prepozna.

Zato smo svaku mogućnost prosuđivali po tri pitanja:

1. **Ima li fiksni otisak?** Rukovanje fiksne veličine ili standardni port može uhvatiti jedno pravilo.
2. **Što se događa kad cenzor ispituje poslužitelj?** Vatrozidi se aktivno spajaju na sumnjive proxyje da vide kako odgovaraju.
3. **Ima li što staviti na popis za blokiranje?** Domena, certifikat ili prepoznatljiv poslužitelj meta je čak i kad je sam promet dobro skriven.

## Zašto ne WireGuard, OpenVPN ili IKEv2?

Sva tri padaju na prvom pitanju. Paketi rukovanja [WireGuarda](/vpn-protocols/wireguard) uvijek su 148 i 92 bajta. [OpenVPN](/vpn-protocols/openvpn) istraživači su prepoznali u više od 85 % tokova radeći unutar stvarnog davatelja usluge. [IKEv2](/vpn-protocols/ikev2) radi na standardnim UDP portovima koje se može odbaciti u cijelosti. U kolovozu 2023. korisnici u Rusiji [javili su](https://github.com/net4people/bbs/issues/274) da operateri prekidaju WireGuard i OpenVPN unutar prvih paketa. To su dobri protokoli za otvorene mreže. Za naše nisu osmišljeni.

## Zašto ne Shadowsocks ili VMess?

Prvo pitanje prolaze jer izgledaju kao slučajni bajtovi, a to se pokazalo zasebnim otiskom. Od studenoga 2021. Veliki kineski vatrozid [blokira potpuno šifrirani promet](https://gfw.report/publications/usenixsecurity23/en/) koji ne nalikuje nijednom poznatom protokolu. [VMess](/vpn-protocols/vmess) može se omotati u TLS da se to izbjegne, ali tada treba domenu, što nas dovodi do trećeg pitanja.

## Zašto ne Trojan?

[Trojan](/vpn-protocols/trojan) dobro odgovara na prva dva pitanja: to je pravi TLS, a probe vide pravo web-mjesto. Ali svakom poslužitelju Trojan treba vlastita domena i certifikat. Kad cenzor sazna tu domenu, može je blokirati, a vođenje mnogih domena stalna je potjera.

## Što VLESS-Reality radi kako treba

[VLESS-Reality](/vpn-protocols/vless-reality) odgovara na sva tri:

- **Nema fiksnog otiska.** Veza je TLS 1.3 preko TCP-a, najčešći šifrirani promet na internetu.
- **Probe vide pravo web-mjesto.** Reality prosljeđuje svakoga tko se ne može autentificirati na pravo web-mjesto čije rukovanje posuđuje, s pravim certifikatom tog web-mjesta.
- **Ništa naše za blokiranje po imenu.** U rukovanju nema domene ni certifikata Dopplera.

Radi i preko TCP-a, pa nastavlja raditi na mrežama koje usporavaju ili blokiraju UDP, gdje [Hysteria 2](/vpn-protocols/hysteria2) i [AmneziaWG](/vpn-protocols/amneziawg) imaju poteškoća. A sam VLESS je malen: za šifriranje se oslanja na TLS umjesto da dodaje vlastito, pa nema dvostrukog šifriranja.

## Čega smo se odrekli

- **Gole brzine na vezama s gubicima.** TCP se od gubitka paketa oporavlja manje spretno nego QUIC ili UDP WireGuarda. Na čistoj vezi razlika je mala; na lošoj može biti primjetna.
- **Ugrađene podrške u operacijskom sustavu.** Nijedan operacijski sustav ne isporučuje klijent VLESS, pa treba aplikacija. Odlučili smo da je to prihvatljivo i napravili vlastite za iOS, Android, macOS i Windows.
- **Savršene nevidljivosti.** Ne postoji. Istraživanja su pokazala da se [TLS unutar TLS-a može prepoznati po otisku](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), a u studenome 2025. [javljeno je](https://github.com/net4people/bbs/issues/546) da neki ruski davatelji usluge prekidaju veze Realityja. VLESS-Reality je nacrt otpornosti na cenzuru, a ne jamstvo.

## Što radimo s tim ograničenjima

Cenzura se mijenja, pa odabir protokola nije kraj posla. Prilagođavamo postavke poslužitelja i web-mjesta koja Reality posuđuje kako se filtriranje mijenja, i pratimo ista istraživanja i izvješća zajednice na koja se ove stranice pozivaju. Ako se pojavi bolji pristup, ova će stranica to reći.

Za cijelu tehničku priču o tome kako VLESS-Reality radi pročitajte [tunel VLESS-Reality](/how-it-works/vless-reality-tunnel). Da ga isprobate, pogledajte [VLESS VPN](/vless-vpn).
