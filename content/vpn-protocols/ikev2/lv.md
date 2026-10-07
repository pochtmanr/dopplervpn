> **Īsumā.** IKEv2/IPsec ir VPN, ko jūsu tālrunis un klēpjdators jau prot bez jebkādas lietotnes. Tas ir ātrs un labi panes pārslēgšanos starp Wi-Fi un mobilajiem datiem. Tas darbojas arī fiksētos, labi zināmos portos, tāpēc cenzoram tas ir viens no vienkāršākajiem protokoliem, ko bloķēt.

## Kas ir IKEv2/IPsec?

"IKEv2" patiesībā ir divas daļas, kas strādā kopā. IPsec ir komplekts, kas šifrē un autentificē IP paketes. IKE, Internet Key Exchange, ir protokols, ar kuru abas puses autentificē viena otru un vienojas par IPsec atslēgām. IKE 2. versija tika standartizēta [2005. gada decembrī](https://en.wikipedia.org/wiki/Internet_Key_Exchange), un pašreizējā specifikācija ir [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Tā kā tas ir IETF standarts, IKEv2 ir iebūvēts iOS, macOS un Windows, kā arī Android kopš 11. versijas. Daudzas uzņēmumu VPN vārtejas to izmanto.

## Kā tas darbojas?

Atslēgu apmaiņa notiek pa UDP, [parasti 500. portā](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Kad abas puses ir vienojušās par atslēgām, operētājsistēmas IPsec steks šifrē jūsu datplūsmu, izmantojot Encapsulating Security Payload (ESP). Kad ceļā ir NAT maršrutētājs, kā gandrīz katrā mājas un mobilajā tīklā, gan IKE, gan ESP tiek ietīti UDP 4500. portā.

IKEv2 ir standarta paplašinājums ar nosaukumu [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), kas ļauj savienojumam pārdzīvot IP adreses maiņu. Tāpēc IKEv2 ir patīkams tālruņos: izejot no Wi-Fi zonas uz mobilajiem datiem, tunelis turpinās, nevis savienojas no jauna.

## Kāpēc IKEv2 ir viegli bloķēt?

IKEv2 nemēģina izskatīties pēc kaut kā cita. Tā datplūsma izmanto labi zināmus UDP portus un standarta IKE un ESP formātus, ko var nolasīt jebkurš tīkla rīks. Lai to bloķētu, pat nav vajadzīga dziļā pakešu inspekcija: filtrs var atmest UDP portus 500 un 4500 vai atpazīt IKE apmaiņu tieši.

Tas ir saprātīgs kompromiss uzņēmumu tīkliem un ceļošanai atvērtās valstīs, kur atpazīšana par VPN neko nemaksā. Tīklos, kas VPN filtrē ar nolūku, tas parasti ir pirmais, kas pārstāj darboties.

## Kad lietot IKEv2?

- **Kad lietotne nav atļauta.** Pārvaldītā ierīcē, kur nevar instalēt programmatūru, iebūvētais IKEv2 klients var būt vienīgā iespēja.
- **Mobilajai viesabonēšanai atvērtos tīklos.** MOBIKE padara pāreju starp tīkliem vienmērīgu.
- **Ne zem cenzūras.** Filtrētos tīklos izvēlieties protokolu, kas veidots, lai saplūstu, piemēram, [VLESS-Reality](/vpn-protocols/vless-reality). Mūsu [cenzūras ceļvedis](/bypass-censorship) skaidro, kā darbojas bloķēšana.

## Vai Doppler izmanto IKEv2?

Nē. Doppler savās lietotnēs savienojas ar VLESS-Reality. Skatiet [kāpēc VLESS](/vpn-protocols/why-vless), lai uzzinātu iemeslus.
