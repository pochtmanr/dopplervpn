> **Īsumā.** OpenVPN ir atvērtā koda VPN veterāns: elastīgs, plaši atbalstīts un labi izpētīts pēc vairāk nekā divām desmitgadēm. Tas ir arī lēnāks par jaunākiem protokoliem un, saskaņā ar publicētiem pētījumiem, viens no vienkāršākajiem, ko interneta pakalpojumu sniedzējs var atpazīt pēc pirkstu nospieduma.

## Kas ir OpenVPN?

OpenVPN ir bezmaksas, atvērtā koda VPN programmatūra, ko James Yonan pirmo reizi izlaida [2001. gada maijā](https://en.wikipedia.org/wiki/OpenVPN). Lielāko daļu 2000. un 2010. gadu tā bija noklusējuma izvēle komerciālajiem VPN pakalpojumiem un uzņēmumu attālinātajai piekļuvei, un tā joprojām ir iekļauta daudzos maršrutētājos un uzņēmumu produktos.

Tā darbojas lietotāja telpā, nevis operētājsistēmas kodolā, un atslēgu apmaiņai paļaujas uz OpenSSL bibliotēku un TLS protokolu. IANA piešķirtais ports ir 1194, lai gan OpenVPN var darboties pa UDP vai TCP gandrīz jebkurā portā.

## Kā tas darbojas?

OpenVPN izmanto savu protokolu ar divām daļām. Vadības kanāls izmanto TLS, lai autentificētu abas puses, parasti ar sertifikātiem, un vienotos par atslēgām. Datu kanāls pēc tam nes jūsu datplūsmu, šifrētu ar šīm atslēgām, UDP vai TCP paketēs.

Šī struktūra padara OpenVPN ļoti konfigurējamu. Var izvēlēties šifrus, autentifikācijas metodes, portus un transportus un palaist to caur starpniekserveriem. Šīs elastības cena ir sarežģītība: vairāk koda, vairāk iestatījumu un vairāk veidu, kā nonākt pie vājas konfigurācijas.

## Kāpēc OpenVPN bloķē?

TLS OpenVPN iekšienē nav tas pats, kas HTTPS apmeklējums vietnē. OpenVPN ietin savu TLS rokasspiedienu savā pakešu ietvarā, tāpēc tā datplūsmai ir forma, kādas parastai tīmekļa datplūsmai nav.

Pētnieki izmērīja, cik ļoti tas ir svarīgi. Mičiganas Universitātes un citu komanda [izveidoja pirkstu nospiedumu sistēmu](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) un palaida to interneta pakalpojumu sniedzēja tīklā, kas apkalpo aptuveni miljonu lietotāju. Tā atpazina **vairāk nekā 85% OpenVPN plūsmu** ar ļoti maz viltus pozitīvu rezultātu un noķēra arī lielāko daļu komerciālo "maskēto" OpenVPN iestatījumu, ko viņi testēja.

Reālā filtrēšana seko pētījumiem. 2023. gada augustā lietotāji Krievijā [ziņoja](https://github.com/net4people/bbs/issues/274), ka mobilo sakaru operatori pārtrauc OpenVPN savienojumus neilgi pēc to sākuma.

## Kad lietot OpenVPN?

- **Saderībai.** Vecāki maršrutētāji, uzņēmumu vārtejas un daži korporatīvie tīkli atbalsta OpenVPN un neko jaunāku.
- **Tikai TCP tīklos.** OpenVPN var darboties pa TCP, kad UDP ir bloķēts, ko [WireGuard](/vpn-protocols/wireguard) bez palīdzības nevar.
- **Ne filtrētos tīklos.** Tur, kur VPN ir bloķēti, OpenVPN mēdz ātri nestrādāt. Labāks rīks ir protokols, kas atdarina parasto tīmekļa datplūsmu, piemēram, [VLESS-Reality](/vpn-protocols/vless-reality). Mūsu [cenzūras ceļvedis](/bypass-censorship) skaidro, kā filtrēšanas sistēmas izlemj, ko pārtraukt.

## Vai Doppler izmanto OpenVPN?

Nē. Doppler visās platformās izmanto VLESS-Reality. [Kāpēc VLESS](/vpn-protocols/why-vless) ceļvedis skaidro, kā mēs to izvēlējāmies.
