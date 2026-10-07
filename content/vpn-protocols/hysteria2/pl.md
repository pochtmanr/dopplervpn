> **W skrócie.** Hysteria 2 to protokół proxy zbudowany na QUIC, transporcie stojącym za HTTP/3. Zaprojektowano go z myślą o szybkości na słabych połączeniach ze stratami, a dla każdego bez hasła jego serwer zachowuje się jak zwykła strona HTTP/3. Słabym punktem jest zależność od UDP, które niektóre sieci ograniczają albo blokują całkowicie.

## Czym jest Hysteria 2?

Hysteria to otwartoźródłowy projekt od [apernet](https://github.com/apernet/hysteria); wersja 2, przeprojektowany protokół, ukazała się we wrześniu 2023 roku. Podobnie jak Shadowsocks i VLESS jest proxy, a nie klasycznym VPN-em, a klienci mogą kierować przez nie całe urządzenie.

## Jak to działa?

Według [specyfikacji protokołu](https://v2.hysteria.network/docs/developers/Protocol/) Hysteria 2 działa przez QUIC opisany w [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), z rozszerzeniem zawodnych datagramów dla ruchu UDP. QUIC już daje szyfrowanie TLS 1.3, zwielokrotnione strumienie i szybkie nawiązywanie połączenia.

Uwierzytelnianie jest miejscem, w którym pojawia się kamuflaż. Specyfikacja wymaga, by serwer Hysteria **musiał implementować prawdziwy serwer HTTP/3** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) i obsługiwać żądania tak, jak zrobiłby to dowolny serwer WWW. Klient uwierzytelnia się specjalnym żądaniem HTTP/3; każdy inny, czy to ciekawski odwiedzający, czy aktywna sonda, dostaje zwykłe odpowiedzi WWW. Specyfikacja stwierdza, że dla osoby trzeciej bez poświadczeń serwer zachowuje się dokładnie jak standardowy serwer WWW HTTP/3.

## Dlaczego jest szybki?

QUIC działa przez UDP i po utracie pakietów wznawia transmisję, nie zatrzymując każdego strumienia, jak robi to TCP. Hysteria może też używać własnej kontroli przeciążenia, nastawionej na niestabilne łącza, więc zwykle utrzymuje szybkość w zatłoczonych sieciach komórkowych, na dalekich trasach i w Wi-Fi z zakłóceniami, tam gdzie protokoły oparte na TCP zwalniają.

## Jak trudno zablokować Hysteria 2?

Wobec aktywnego sondowania trzyma się dobrze, bo sondy widzą serwer WWW. Narażeniem jest transport. Cenzor może ograniczać albo blokować UDP, albo konkretnie QUIC, nie psując większości stron, ponieważ przeglądarki wracają do HTTP/2 przez TCP, gdy HTTP/3 zawiedzie. Gdy tak się dzieje, Hysteria 2 nie ma dokąd pójść, a protokoły oparte na TCP, takie jak [VLESS-Reality](/vpn-protocols/vless-reality), działają dalej.

## Kiedy warto używać Hysteria 2?

- **Łącza ze stratami lub dalekie**, gdzie opłaca się jej kontrola przeciążenia i odtwarzanie strat w QUIC.
- **Sieci, które dopuszczają UDP.** Sprawdź, zanim na tym polegasz.
- Jako drugi protokół obok opcji TCP, żeby przełączyć się, gdy UDP jest filtrowane. Nasz [przewodnik o cenzurze](/bypass-censorship) opisuje, jak filtry celują w transporty.

## Czy Doppler używa Hysteria 2?

Nie. Doppler używa VLESS-Reality przez TCP, który działa dalej w sieciach blokujących UDP. Zobacz [dlaczego VLESS](/vpn-protocols/why-vless).
