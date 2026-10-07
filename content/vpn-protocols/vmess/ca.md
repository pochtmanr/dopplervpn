> **En resum.** VMess és el protocol original del projecte V2Ray. Xifra les seves pròpies capçaleres i normalment va embolcallat en un altre transport, com WebSocket sobre TLS, per semblar trànsit web. Encara funciona, però els seus successors, VLESS i Trojan, fan la mateixa feina amb menys sobrecàrrega.

## Què és VMess?

VMess és el protocol de proxy xifrat que el [projecte V2Ray](https://github.com/v2fly/v2ray-core) va presentar quan va començar el 2015. V2Ray va créixer fins a ser una plataforma modular per construir proxies: un nucli, molts protocols i transports, i un motor d'encaminament que decideix quin trànsit va on. VMess va ser el seu primer protocol i, durant uns quants anys, el principal.

Com Shadowsocks, VMess és tècnicament un proxy i no una VPN, però les aplicacions basades en V2Ray poden fer-hi passar tot el dispositiu.

## Com funciona?

Cada usuari té un UUID que fa de credencial. Segons la [documentació del protocol](https://www.v2fly.org/en_US/developer/protocols/vmess.html), la capçalera de petició del client inclou un identificador d'autenticació xifrat, construït a partir d'una marca de temps Unix, un nombre aleatori i una suma de comprovació, xifrat amb una clau derivada de l'identificador de l'usuari. El servidor el fa servir per reconèixer l'usuari i després desxifra la resta de la capçalera i les dades.

La documentació descriu dues maneres de protegir la capçalera. La moderna fa servir xifratge AEAD, que garanteix que la capçalera no s'ha alterat. L'antiga feia servir MD5 i AES-128-CFB i no podia garantir la integritat de la capçalera; la documentació en desaconsella l'ús. Com que l'identificador d'autenticació inclou una marca de temps, els rellotges del client i del servidor han d'anar aproximadament sincronitzats, una causa habitual dels problemes de l'estil «simplement no es connecta».

## Com és de difícil bloquejar VMess?

Per si sol, VMess sembla bytes aleatoris, cosa que el posa en la mateixa situació que [Shadowsocks](/vpn-protocols/shadowsocks): exposat als tallafocs que bloquegen el trànsit totalment xifrat. Per això VMess normalment es desplega dins de WebSocket o gRPC sobre TLS, darrere d'un domini i un certificat, de manera que un observador veu el que sembla una connexió HTTPS normal amb un lloc web.

Aquest embolcall fa la major part de la feina d'amagar el trànsit, i té un cost: cal un domini, un certificat i sovint una CDN davant del servidor, i el servidor xifra les dades dues vegades, una per a TLS i una altra per a VMess.

## VMess, VLESS o Trojan?

[VLESS](/vpn-protocols/vless-reality) el va dissenyar el projecte Xray com a successor més lleuger: conserva la identitat basada en UUID, però deixa el xifratge propi de VMess i es basa del tot en la capa TLS, cosa que evita el doble xifratge. [Trojan](/vpn-protocols/trojan) fa un enfocament semblant, amb una contrasenya en lloc d'un UUID. La nostra comparació de [VLESS, VMess i Trojan](/blog/vless-vs-vmess-vs-trojan) entra en els detalls.

## Doppler fa servir VMess?

No. Doppler fa servir VLESS amb Reality. La guia [per què VLESS](/vpn-protocols/why-vless) n'explica el perquè.
