> **W skrócie.** Shadowsocks to lekkie szyfrowane proxy, zbudowane w Chinach, by przechodzić przez Wielki Firewall. Przez lata działał dzięki temu, że wyglądał jak zupełnie nic. Od 2021 roku badania pokazują, że firewall blokuje właśnie taki ruch, bo prawdziwy ruch rzadko bywa aż tak losowy.

## Czym jest Shadowsocks?

Shadowsocks to otwartoźródłowy protokół proxy, po raz pierwszy wydany [w kwietniu 2012 roku](https://en.wikipedia.org/wiki/Shadowsocks). Ściśle rzecz biorąc nie jest VPN-em: to proxy w stylu SOCKS5 z szyfrowaniem, a aplikacje decydują, który ruch przez nie wysłać. W praktyce większość klientów Shadowsocks oferuje dziś tryb obejmujący cały system, który zachowuje się jak VPN.

Jest popularny, bo jest prosty i szybki. Aktualne wersje używają [szyfrów AEAD](https://shadowsocks.org/doc/aead.html), które w jednym kroku dają poufność, integralność i autentyczność, a [wydanie z 2022 roku](https://shadowsocks.org/doc/sip022.html) zaostrzyło ochronę przed powtórzeniami.

## Jak to działa?

Klient i serwer mają wspólne hasło, z którego powstaje klucz szyfrowania. Wszystko, co wysyła klient, łącznie z adresem strony, do której chce trafić, jest szyfrowane od pierwszego bajtu. Nie ma rozpoznawalnego uzgadniania, certyfikatu ani nagłówka w postaci jawnej. Dla obserwatora połączenie Shadowsocks to strumień bajtów wyglądających na losowe.

## Jak Wielki Firewall wykrywa Shadowsocks?

Najpierw przez aktywne sondowanie. Badacze z GFW Report [zarejestrowali](https://gfw.report/publications/imc20/en/), że firewall wysyłał dziesiątki tysięcy sond do podejrzanych serwerów Shadowsocks, odtwarzając i zmieniając prawdziwe połączenia, by zobaczyć, jak zareaguje serwer.

Potem, od listopada 2021 roku, prostszą i szerszą metodą. [Badanie z USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) wykazało, że firewall blokuje ruch „w pełni zaszyfrowany” w czasie rzeczywistym. Firewall patrzy na pierwszy pakiet połączenia i zwalnia wszystko, co wygląda jak znany protokół albo zawiera dość tekstu drukowalnego. Jedna reguła mierzy średnią liczbę ustawionych bitów na bajt: wartości równe 3.4 lub niższe albo równe 4.6 lub wyższe są zwolnione, a losowo wyglądające dane pomiędzy nimi — nie. To, co zostaje, można zablokować.

Badacze ustalili też, że firewall stosował to do około 26% połączeń i tylko do zakresów IP popularnych centrów danych, prawdopodobnie po to, by ograniczyć szkody uboczne. Wniosek dla projektantów protokołów był jasny: wygląd losowy sam w sobie jest cechą rozpoznawczą.

## Kiedy warto używać Shadowsocks?

- **Lekkie, szybkie proxy** w sieciach, które nie sprawdzają ruchu dokładnie.
- **Własny serwer** z narzędziami takimi jak Outline, które upraszczają konfigurację.
- **Ostrożnie przy silnym filtrowaniu.** W Chinach i w innych miejscach, które blokują w pełni zaszyfrowany ruch, Shadowsocks jest znacznie mniej niezawodny niż protokoły naśladujące prawdziwy TLS, takie jak [VLESS-Reality](/vpn-protocols/vless-reality). Nasza [historia protokołów cenzury](/blog/censorship-protocol-history) prześledza, jak ta dziedzina poszła dalej.

## Czy Doppler używa Shadowsocks?

Nie. Doppler używa VLESS-Reality, z powodów opisanych w przewodniku [dlaczego VLESS](/vpn-protocols/why-vless).
