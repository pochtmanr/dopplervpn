> **Na kratko.** VMess je izvirni protokol projekta V2Ray. Sam šifrira svoje glave in je običajno ovit v drug transport, na primer WebSocket prek TLS, da je videti kot spletni promet. Še vedno deluje, vendar njegova naslednika, VLESS in Trojan, opravita isto delo z manjšo dodatno obremenitvijo.

## Kaj je VMess?

VMess je šifriran proxy protokol, ki ga je [projekt V2Ray](https://github.com/v2fly/v2ray-core) uvedel ob začetku leta 2015. V2Ray je zrasel v modularno platformo za gradnjo proxyjev: eno jedro, veliko protokolov in transportov ter usmerjevalni mehanizem, ki odloči, kateri promet gre kam. VMess je bil njegov prvi protokol in več let glavni.

Tako kot Shadowsocks je VMess tehnično proxy, ne VPN, vendar lahko aplikacije na osnovi V2Ray skozenj usmerijo celotno napravo.

## Kako deluje?

Vsak uporabnik ima UUID, ki služi kot poverilnica. Po [dokumentaciji protokola](https://www.v2fly.org/en_US/developer/protocols/vmess.html) glava zahteve odjemalca vsebuje šifriran identifikator overjanja, sestavljen iz časovnega žiga Unix, naključnega števila in kontrolne vsote, šifriran s ključem, izpeljanim iz identifikatorja uporabnika. Strežnik ga uporabi, da prepozna uporabnika, nato pa dešifrira preostanek glave in podatke.

Dokumentacija opisuje dva načina zaščite glave. Sodobni uporablja šifriranje AEAD, ki zagotovi, da glava ni bila spremenjena. Starejši je uporabljal MD5 in AES-128-CFB in ni mogel zagotoviti celovitosti glave; dokumentacija svari pred njim. Ker identifikator overjanja vsebuje časovni žig, morata biti uri odjemalca in strežnika približno usklajeni, kar je pogost vir težav vrste »preprosto se ne poveže«.

## Kako težko je VMess blokirati?

Sam po sebi je VMess videti kot naključni bajti, kar ga postavi v isti položaj kot [Shadowsocks](/vpn-protocols/shadowsocks): izpostavljen je požarnim zidovom, ki blokirajo popolnoma šifriran promet. Zato VMess običajno postavijo znotraj WebSocket ali gRPC prek TLS, za domeno in certifikatom, tako da opazovalec vidi nekaj, kar je videti kot običajna povezava HTTPS s spletnim mestom.

Večino dela pri skrivanju prometa opravi ta ovojnica, prinese pa stroške: potrebujete domeno, certifikat in pogosto CDN pred strežnikom, strežnik pa podatke šifrira dvakrat, enkrat za TLS in enkrat za VMess.

## VMess, VLESS ali Trojan?

[VLESS](/vpn-protocols/vless-reality) je projekt Xray zasnoval kot lažjega naslednika: ohrani identiteto na osnovi UUID, opusti pa lastno šifriranje VMess in se v celoti zanese na plast TLS, kar se izogne dvojnemu šifriranju. [Trojan](/vpn-protocols/trojan) uporablja podoben pristop z geslom namesto UUID. Naša primerjava [VLESS, VMess in Trojan](/blog/vless-vs-vmess-vs-trojan) gre v podrobnosti.

## Ali Doppler uporablja VMess?

Ne. Doppler uporablja VLESS z Reality. Vodnik [zakaj VLESS](/vpn-protocols/why-vless) pojasni, zakaj.
