> **W skrócie.** Trojan ukrywa ruch proxy wewnątrz prawdziwego połączenia TLS z prawdziwą stroną, którą kontrolujesz. Każdy, kto łączy się bez hasła, po prostu dostaje stronę. Działa dobrze, ale potrzebujesz własnej domeny i certyfikatu, a te da się znaleźć i zablokować.

## Czym jest Trojan?

Trojan to protokół proxy z [projektu trojan-gfw](https://github.com/trojan-gfw/trojan), po raz pierwszy wydany w październiku 2017 roku. Pomysł jest w nazwie: zamiast wymyślać kamuflaż, ukrywa się w najpowszechniejszym szyfrowanym ruchu w internecie, czyli HTTPS.

## Jak to działa?

[Opis protokołu](https://trojan-gfw.github.io/trojan/protocol) jest krótki. Serwer Trojan nasłuchuje jak zwykły serwer HTTPS, z prawdziwym certyfikatem dla prawdziwej domeny. Klient wykonuje prawdziwe uzgadnianie TLS. Potem, wewnątrz zaszyfrowanego połączenia, wysyła:

- szesnastkowy skrót SHA-224 wspólnego hasła, który ma 56 znaków,
- znak nowej linii,
- niewielkie żądanie mówiące, dokąd ma iść ruch, w formacie podobnym do SOCKS5,
- kolejny znak nowej linii, a po nim pierwszy fragment danych.

Jeśli skrót i żądanie są poprawne, serwer otwiera tunel do miejsca docelowego. Jeśli cokolwiek jest nie tak, serwer traktuje połączenie jako „inne protokoły” i przekazuje je do zapasowego serwera WWW, więc odwiedzający widzi zwykłą stronę.

## Jak trudno zablokować Trojan?

Z zewnątrz połączenie Trojan to sesja TLS do Twojej domeny, z Twoim certyfikatem. Aktywne sondy dostają w odpowiedzi prawdziwą stronę. Dlatego Trojana znacznie trudniej wyłowić niż protokoły wyglądające losowo, takie jak [Shadowsocks](/vpn-protocols/shadowsocks).

Słabym punktem jest sama domena. Każdy serwer potrzebuje domeny i certyfikatu, a cenzor, który dowie się, które domeny należą do proxy, może je zablokować po nazwie albo po adresie IP. Badacze pokazali też, że TLS niesiony wewnątrz TLS zostawia wzorce czasu i rozmiaru, które da się [rozpoznać](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), co dotyczy Trojana i podobnych konstrukcji.

[VLESS-Reality](/vpn-protocols/vless-reality) usuwa problem domeny, bo pożycza uzgadnianie TLS istniejącej, popularnej strony zamiast Twojej własnej.

## Kiedy warto używać Trojana?

- **Gdy kontrolujesz domenę** i chcesz prostą, dobrze poznaną konfigurację, która wygląda jak HTTPS.
- **W umiarkowanie filtrowanych sieciach**, w których Twoja domena raczej nie będzie celem.
- Nasze porównanie [VLESS, VMess i Trojan](/blog/vless-vs-vmess-vs-trojan) pomaga, gdy wybierasz między nimi.

## Czy Doppler używa Trojana?

Nie. Doppler używa VLESS-Reality, który nie potrzebuje własnej domeny. Zobacz [dlaczego VLESS](/vpn-protocols/why-vless).
