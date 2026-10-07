> **Īsumā.** VMess ir V2Ray projekta sākotnējais protokols. Tas šifrē savas galvenes un parasti tiek ietīts citā transportā, piemēram, WebSocket virs TLS, lai izskatītos pēc tīmekļa datplūsmas. Tas joprojām darbojas, bet tā pēcteči VLESS un Trojan dara to pašu ar mazāku virsgalvu.

## Kas ir VMess?

VMess ir šifrētais starpniekprotokols, ko [V2Ray projekts](https://github.com/v2fly/v2ray-core) ieviesa, kad sāka darbu 2015. gadā. V2Ray izauga par modulāru platformu starpnieku veidošanai: viens kodols, daudzi protokoli un transporti un maršrutēšanas dzinējs, kas izlemj, kura datplūsma iet kur. VMess bija tā pirmais protokols un vairākus gadus galvenais.

Tāpat kā Shadowsocks, VMess tehniski ir starpnieks, nevis VPN, bet uz V2Ray balstītas lietotnes var novirzīt caur to visu ierīci.

## Kā tas darbojas?

Katram lietotājam ir UUID, kas kalpo kā viņa pilnvara. Saskaņā ar [protokola dokumentāciju](https://www.v2fly.org/en_US/developer/protocols/vmess.html) klienta pieprasījuma galvene ietver šifrētu autentifikācijas ID, kas veidots no Unix laika zīmoga, nejauša skaitļa un kontrolsummas un šifrēts ar atslēgu, kas atvasināta no lietotāja ID. Serveris to izmanto, lai atpazītu lietotāju, pēc tam atšifrē pārējo galveni un datus.

Dokumentācija apraksta divus galvenes aizsardzības veidus. Mūsdienīgais izmanto AEAD šifrēšanu, kas garantē, ka galvene nav mainīta. Vecākais izmantoja MD5 un AES-128-CFB un nevarēja garantēt galvenes integritāti; dokumentācija no tā brīdina. Tā kā autentifikācijas ID ietver laika zīmogu, klienta un servera pulksteņiem jābūt aptuveni sinhronizētiem — biežs iemesls problēmām "tas vienkārši nesavienojas".

## Cik grūti ir bloķēt VMess?

Pats par sevi VMess izskatās pēc nejaušiem baitiem, kas to nostāda tajā pašā situācijā kā [Shadowsocks](/vpn-protocols/shadowsocks): tas ir pakļauts ugunsmūriem, kas bloķē pilnībā šifrētu datplūsmu. Tāpēc VMess parasti izvieto WebSocket vai gRPC iekšienē virs TLS, aiz domēna un sertifikāta, lai novērotājs redzētu to, kas izskatās pēc parasta HTTPS savienojuma ar vietni.

Šis ietvars veic lielāko daļu datplūsmas slēpšanas darba, un tam ir izmaksas: vajag domēnu, sertifikātu un bieži CDN servera priekšā, un serveris tagad datus šifrē divreiz — vienreiz TLS un vienreiz VMess.

## VMess, VLESS vai Trojan?

[VLESS](/vpn-protocols/vless-reality) tika veidots Xray projektā kā vieglāks pēctecis: tas patur uz UUID balstīto identitāti, bet atmet VMess paša šifrēšanu un pilnībā paļaujas uz TLS slāni, kas novērš dubulto šifrēšanu. [Trojan](/vpn-protocols/trojan) izmanto līdzīgu pieeju ar paroli UUID vietā. Mūsu salīdzinājums [VLESS, VMess un Trojan](/blog/vless-vs-vmess-vs-trojan) iedziļinās detaļās.

## Vai Doppler izmanto VMess?

Nē. Doppler izmanto VLESS ar Reality. [Kāpēc VLESS](/vpn-protocols/why-vless) ceļvedis skaidro, kāpēc.
