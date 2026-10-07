> **Pe scurt.** VMess este protocolul original al proiectului V2Ray. Își criptează propriile anteturi și este de obicei învelit într-un alt transport, cum este WebSocket peste TLS, ca să arate ca trafic web. Încă funcționează, dar urmașii lui, VLESS și Trojan, fac aceeași treabă cu mai puțină suprasarcină.

## Ce este VMess?

VMess este protocolul proxy criptat pe care [proiectul V2Ray](https://github.com/v2fly/v2ray-core) l-a introdus când a pornit, în 2015. V2Ray a crescut într-o platformă modulară pentru construirea de proxy-uri: un nucleu, multe protocoale și transporturi și un motor de rutare care decide ce trafic unde merge. VMess a fost primul lui protocol și, timp de câțiva ani, cel principal.

Ca și Shadowsocks, VMess este tehnic un proxy, nu un VPN, dar aplicațiile bazate pe V2Ray pot ruta tot dispozitivul tău prin el.

## Cum funcționează?

Fiecare utilizator are un UUID care îi servește drept credențial. Potrivit [documentației protocolului](https://www.v2fly.org/en_US/developer/protocols/vmess.html), antetul cererii clientului include un ID de autentificare criptat, construit dintr-un marcaj de timp Unix, un număr aleatoriu și o sumă de control, criptat cu o cheie derivată din ID-ul utilizatorului. Serverul îl folosește ca să recunoască utilizatorul, apoi decriptează restul antetului și datele.

Documentația descrie două feluri de a proteja antetul. Cel modern folosește criptare AEAD, care garantează că antetul nu a fost alterat. Cel mai vechi folosea MD5 și AES-128-CFB și nu putea garanta integritatea antetului; documentația avertizează împotriva lui. Pentru că ID-ul de autentificare include un marcaj de timp, ceasurile clientului și ale serverului trebuie să fie aproximativ sincronizate, o sursă frecventă a problemelor de tipul „pur și simplu nu se conectează”.

## Cât de greu este de blocat VMess?

Singur, VMess arată ca octeți aleatorii, ceea ce îl pune în aceeași situație ca [Shadowsocks](/vpn-protocols/shadowsocks): expus firewall-urilor care blochează traficul complet criptat. De aceea VMess este de obicei pus în funcțiune în WebSocket sau gRPC peste TLS, în spatele unui domeniu și al unui certificat, astfel încât un observator vede ce pare o conexiune HTTPS normală către un site.

Învelișul acela face cea mai mare parte din munca de a ascunde traficul și aduce costuri: îți trebuie un domeniu, un certificat și adesea un CDN în fața serverului, iar serverul criptează datele de două ori, o dată pentru TLS și o dată pentru VMess.

## VMess, VLESS sau Trojan?

[VLESS](/vpn-protocols/vless-reality) a fost proiectat de proiectul Xray ca un urmaș mai ușor: păstrează identitatea bazată pe UUID, dar renunță la criptarea proprie a VMess și se bazează în întregime pe stratul TLS, ceea ce evită criptarea dublă. [Trojan](/vpn-protocols/trojan) are o abordare asemănătoare, cu o parolă în loc de UUID. Comparația noastră dintre [VLESS, VMess și Trojan](/blog/vless-vs-vmess-vs-trojan) intră în detalii.

## Folosește Doppler VMess?

Nu. Doppler folosește VLESS cu Reality. Ghidul [de ce VLESS](/vpn-protocols/why-vless) explică de ce.
