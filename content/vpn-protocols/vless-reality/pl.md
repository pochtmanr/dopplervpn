> **W skrócie.** VLESS to minimalny protokół proxy z projektu Xray. Reality to warstwa TLS, która sprawia, że połączenie VLESS wygląda jak zwykła wizyta TLS 1.3 na prawdziwej, popularnej stronie, bez własnej domeny ani certyfikatu. Razem są obecnie najtrudniejszą popularną kombinacją do zablokowania przez cenzorów. Ta strona jest streszczeniem; nasz [szczegółowy przewodnik](/how-it-works/vless-reality-tunnel) ma pełną historię.

## Czym jest VLESS?

VLESS [zaproponowano w lipcu 2020 roku](https://github.com/v2ray/v2ray-core/issues/2636) jako lżejszego następcę [VMess](/vpn-protocols/vmess). Jego [specyfikacja](https://xtls.github.io/en/development/protocols/vless.html) jest celowo mała: wersja protokołu, 16-bajtowy UUID identyfikujący użytkownika, opcjonalne pole dodatków oraz polecenie, port i adres miejsca docelowego. VLESS nie ma własnego szyfrowania. Polega na leżącej pod spodem warstwie TLS, więc ruch nie jest szyfrowany dwukrotnie.

VLESS jest częścią [Xray-core](https://github.com/XTLS/Xray-core), projektu, który odłączył się od V2Ray w listopadzie 2020 roku i dziś prowadzi rozwój tej rodziny protokołów.

## Co dodaje Reality?

Protokoły takie jak [Trojan](/vpn-protocols/trojan) ukrywają się w TLS do własnej domeny, a ta domena staje się tym, co cenzor może zablokować. [Reality](https://github.com/XTLS/REALITY), wydane w Xray-core [1.8.0 w marcu 2023 roku](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), ten problem usuwa.

Serwer Reality przedstawia uzgadnianie TLS prawdziwej, zewnętrznej strony. Dla obserwatora połączenie to zwykła wizyta TLS 1.3 na tej stronie. Klient, który zna klucz serwera, jest wpuszczany do tunelu VLESS; każdy inny, w tym aktywna sonda cenzora, jest przekazywany do prawdziwej strony i widzi jej prawdziwy certyfikat. Nie ma domeny ani certyfikatu Doppler, które można by wpisać na listę blokad.

## Jak trudno zablokować VLESS-Reality?

To najbardziej odporna popularna opcja, jaką znamy, ale nie jest niewidzialna. Badania opublikowane w 2024 roku pokazały, że [TLS niesiony wewnątrz TLS da się rozpoznać](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) po czasie i rozmiarach pakietów, a w listopadzie 2025 roku użytkownicy [zgłaszali](https://github.com/net4people/bbs/issues/546), że niektórzy rosyjscy dostawcy internetu zrywali połączenia Reality. Usługodawcy odpowiadają, dostrajając ustawienia serwerów i strony, które pożyczają, a zabawa w kotka i myszkę trwa.

## Jak szybki jest?

W codziennym użyciu narzut jest niewielki. Nagłówek VLESS jest wysyłany raz na połączenie, a przepływ XTLS Vision unika ponownego szyfrowania już zaszyfrowanego ruchu stron. Ponieważ działa przez TCP, VLESS-Reality może być wolniejszy niż protokoły UDP, takie jak [WireGuard](/vpn-protocols/wireguard), w sieciach ze stratami pakietów, ale działa tam, gdzie te są blokowane.

## Gdzie mogę dowiedzieć się więcej?

- [Tunel VLESS-Reality w szczegółach](/how-it-works/vless-reality-tunnel): historia, mechanizm, ograniczenia.
- [Czym jest VLESS?](/blog/what-is-vless) oraz [format URI VLESS](/blog/vless-uri-format) na naszym blogu.
- [VLESS VPN](/vless-vpn): jak Doppler pakuje VLESS-Reality w aplikacje uruchamiane jednym stuknięciem.
