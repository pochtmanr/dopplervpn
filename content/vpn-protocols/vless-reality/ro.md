> **Pe scurt.** VLESS este un protocol proxy minimal, din proiectul Xray. Reality este stratul TLS care face o conexiune VLESS să arate ca o vizită TLS 1.3 obișnuită la un site real și popular, fără domeniu sau certificat propriu. Împreună, sunt în prezent combinația de masă cea mai greu de blocat de către cenzori. Pagina aceasta este rezumatul; al nostru [ghid detaliat](/how-it-works/vless-reality-tunnel) are povestea completă.

## Ce este VLESS?

VLESS a fost [propus în iulie 2020](https://github.com/v2ray/v2ray-core/issues/2636) ca un urmaș mai ușor al [VMess](/vpn-protocols/vmess). [Specificația](https://xtls.github.io/en/development/protocols/vless.html) lui este deliberat mică: o versiune de protocol, un UUID de 16 octeți care identifică utilizatorul, un câmp opțional de add-on-uri și comanda, portul și adresa destinației. VLESS nu are criptare proprie. Se bazează pe stratul TLS de dedesubt, așa că traficul nu este criptat de două ori.

VLESS face parte din [Xray-core](https://github.com/XTLS/Xray-core), proiectul care s-a desprins din V2Ray în noiembrie 2020 și conduce acum dezvoltarea acestei familii de protocoale.

## Ce adaugă Reality?

Protocoale precum [Trojan](/vpn-protocols/trojan) se ascund în TLS către propriul domeniu, iar domeniul acela devine lucrul pe care un cenzor îl poate bloca. [Reality](https://github.com/XTLS/REALITY), lansat în Xray-core [1.8.0 în martie 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), îl înlătură.

Un server Reality prezintă handshake-ul TLS al unui site terț real. Pentru un observator, conexiunea este o vizită TLS 1.3 normală la acel site. Un client care cunoaște cheia serverului este lăsat să intre în tunelul VLESS; oricine altcineva, inclusiv o sondă activă a unui cenzor, este pasat către site-ul real și vede certificatul lui autentic. Nu există un domeniu sau un certificat Doppler de pus pe o listă de blocare.

## Cât de greu este de blocat VLESS-Reality?

Este cea mai rezistentă opțiune de masă pe care o cunoaștem, dar nu este invizibilă. O cercetare publicată în 2024 a arătat că [TLS purtat în interiorul TLS poate fi amprentat](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) după timpi și după dimensiunile pachetelor, iar în noiembrie 2025 utilizatori [au raportat](https://github.com/net4people/bbs/issues/546) că unii ISP din Rusia tăiau conexiunile Reality. Furnizorii răspund ajustând setările serverelor și site-urile pe care le împrumută, iar jocul de-a șoarecele și pisica continuă.

## Cât de rapid este?

În utilizarea de zi cu zi, suprasarcina este mică. Antetul VLESS este trimis o dată pe conexiune, iar fluxul XTLS Vision evită să cripteze a doua oară traficul web deja criptat. Pentru că rulează prin TCP, VLESS-Reality poate fi mai lent decât protocoalele UDP precum [WireGuard](/vpn-protocols/wireguard) în rețele cu pierderi, dar continuă să funcționeze acolo unde acelea sunt blocate.

## Unde pot afla mai mult?

- [Tunelul VLESS-Reality, în detaliu](/how-it-works/vless-reality-tunnel): istorie, mecanism, limite.
- [Ce este VLESS?](/blog/what-is-vless) și [formatul URI VLESS](/blog/vless-uri-format) pe blogul nostru.
- [VPN VLESS](/vless-vpn): cum împachetează Doppler VLESS-Reality în aplicații cu o singură atingere.
