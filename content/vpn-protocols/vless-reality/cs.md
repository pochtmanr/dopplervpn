> **Ve zkratce.** VLESS je minimální proxy protokol z projektu Xray. Reality je vrstva TLS, díky které spojení VLESS vypadá jako běžná návštěva TLS 1.3 skutečného, oblíbeného webu, bez vlastní domény a certifikátu. Společně jsou teď běžnou kombinací, kterou je pro cenzory nejtěžší zablokovat. Tato stránka je shrnutí; celý příběh je v našem [podrobném průvodci](/how-it-works/vless-reality-tunnel).

## Co je VLESS?

VLESS byl [navržen v červenci 2020](https://github.com/v2ray/v2ray-core/issues/2636) jako lehčí nástupce [VMess](/vpn-protocols/vmess). Jeho [specifikace](https://xtls.github.io/en/development/protocols/vless.html) je záměrně malá: verze protokolu, 16bajtové UUID, které identifikuje uživatele, volitelné pole doplňků a příkaz, port a adresa cíle. VLESS nemá vlastní šifrování. Spoléhá se na vrstvu TLS pod sebou, takže se provoz nešifruje dvakrát.

VLESS je součástí [Xray-core](https://github.com/XTLS/Xray-core), projektu, který se v listopadu 2020 oddělil od V2Ray a dnes vede vývoj této rodiny protokolů.

## Co přidává Reality?

Protokoly jako [Trojan](/vpn-protocols/trojan) se schovávají uvnitř TLS k vaší vlastní doméně a z této domény se stává to, co může cenzor zablokovat. [Reality](https://github.com/XTLS/REALITY), vydané v Xray-core [1.8.0 v březnu 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), to odstraňuje.

Server Reality předkládá navázání spojení TLS skutečného webu třetí strany. Pro pozorovatele je spojení běžná návštěva toho webu po TLS 1.3. Klient, který zná klíč serveru, je vpuštěn do tunelu VLESS; všichni ostatní, včetně aktivní sondy cenzora, jsou předáni skutečnému webu a vidí jeho pravý certifikát. Není tu doména ani certifikát Doppler, které by šlo dát na seznam blokovaných.

## Jak těžké je VLESS-Reality zablokovat?

Je to nejodolnější běžná možnost, kterou známe, ale není neviditelná. Výzkum publikovaný v roce 2024 ukázal, že [TLS nesené uvnitř TLS lze rozpoznat](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) podle času a velikosti paketů a v listopadu 2025 uživatelé [hlásili](https://github.com/net4people/bbs/issues/546), že někteří ruští poskytovatelé přerušují spojení Reality. Provozovatelé VPN odpovídají laděním nastavení serverů a webů, které si půjčují, a hra na kočku a myš pokračuje.

## Jak je rychlý?

V běžném používání je režie malá. Hlavička VLESS se posílá jednou na spojení a režim XTLS Vision se vyhýbá tomu, aby už šifrovaný webový provoz šifroval podruhé. Protože běží po TCP, může být VLESS-Reality na sítích se ztrátami pomalejší než protokoly UDP jako [WireGuard](/vpn-protocols/wireguard), ale funguje dál tam, kde jsou ty zablokované.

## Kde se dozvím víc?

- [Tunel VLESS-Reality podrobně](/how-it-works/vless-reality-tunnel): historie, mechanismus, limity.
- [Co je VLESS?](/blog/what-is-vless) a [formát odkazů VLESS](/blog/vless-uri-format) na našem blogu.
- [VLESS VPN](/vless-vpn): jak Doppler balí VLESS-Reality do aplikací s připojením jedním klepnutím.
