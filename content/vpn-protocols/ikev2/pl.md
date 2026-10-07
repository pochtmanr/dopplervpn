> **W skrócie.** IKEv2/IPsec to VPN, który telefon i laptop już obsługują bez żadnej aplikacji. Jest szybki i dobrze radzi sobie z przełączaniem między Wi-Fi a siecią komórkową. Działa też na stałych, dobrze znanych portach, przez co dla cenzora jest jednym z najprostszych protokołów do zablokowania.

## Czym jest IKEv2/IPsec?

„IKEv2” to tak naprawdę dwie części działające razem. IPsec to zestaw, który szyfruje i uwierzytelnia pakiety IP. IKE, czyli Internet Key Exchange, to protokół, którym obie strony uwierzytelniają się nawzajem i uzgadniają klucze IPsec. Wersję 2 protokołu IKE ustandaryzowano [w grudniu 2005 roku](https://en.wikipedia.org/wiki/Internet_Key_Exchange), a aktualna specyfikacja to [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Ponieważ jest to standard IETF, IKEv2 jest wbudowany w iOS, macOS i Windows, a w Androida od wersji 11. Korzysta z niego wiele firmowych bram VPN.

## Jak to działa?

Wymiana kluczy idzie przez UDP, [zwykle na porcie 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Gdy obie strony uzgodnią klucze, stos IPsec systemu operacyjnego szyfruje Twój ruch za pomocą Encapsulating Security Payload (ESP). Gdy po drodze jest router NAT, jak w niemal każdej sieci domowej i komórkowej, zarówno IKE, jak i ESP są opakowane w UDP na porcie 4500.

IKEv2 ma standardowe rozszerzenie o nazwie [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), które pozwala połączeniu przetrwać zmianę adresu IP. Dlatego IKEv2 jest wygodny na telefonach: gdy wyjdziesz z zasięgu Wi-Fi na sieć komórkową, tunel działa dalej, zamiast łączyć się od zera.

## Dlaczego IKEv2 łatwo zablokować?

IKEv2 wcale nie próbuje wyglądać jak coś innego. Jego ruch używa dobrze znanych portów UDP i ma standardowe formaty IKE oraz ESP, które odczyta dowolne narzędzie sieciowe. Do zablokowania nie potrzeba nawet głębokiej inspekcji pakietów: filtr może odrzucać porty UDP 500 i 4500 albo rozpoznawać wymianę IKE bezpośrednio.

To rozsądny kompromis dla sieci firmowych i podróży w krajach bez filtrowania, gdzie rozpoznanie ruchu jako VPN nic nie kosztuje. W sieciach, które celowo filtrują VPN-y, zwykle przestaje działać jako pierwszy.

## Kiedy warto używać IKEv2?

- **Gdy nie wolno instalować aplikacji.** Na zarządzanym urządzeniu, na którym nie można instalować oprogramowania, wbudowany klient IKEv2 może być jedyną opcją.
- **Roaming mobilny w sieciach otwartych.** MOBIKE sprawia, że przejście między sieciami jest płynne.
- **Nie przy cenzurze.** W sieciach z filtrowaniem wybierz protokół zaprojektowany tak, by wtapiał się w tło, na przykład [VLESS-Reality](/vpn-protocols/vless-reality). Nasz [przewodnik o cenzurze](/bypass-censorship) wyjaśnia, jak działa blokowanie.

## Czy Doppler używa IKEv2?

Nie. Doppler łączy się przez VLESS-Reality we własnych aplikacjach. Powody opisuje przewodnik [dlaczego VLESS](/vpn-protocols/why-vless).
