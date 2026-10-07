> **W skrócie.** WireGuard to najszybszy i najprostszy z popularnych protokołów VPN, a w sieci bez filtrowania jest doskonałym wyborem. Nigdy jednak nie projektowano go tak, by ukrywał, że jest VPN-em, i w Rosji, Iranie oraz Chinach należy do pierwszych blokowanych protokołów.

## Czym jest WireGuard?

WireGuard to protokół VPN napisany przez Jasona A. Donenfelda i po raz pierwszy opublikowany w 2015 roku. Jego celem było zastąpienie rozbudowanych, konfigurowalnych protokołów z przeszłości czymś na tyle małym, by dało się to zaudytować. W marcu 2020 roku został [włączony do jądra Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), a oficjalne aplikacje są dziś dostępne na Windows, macOS, iOS, Androida i Linuksa.

Zamiast pozwalać stronom negocjować zestaw szyfrów, WireGuard na stałe określa jeden zestaw nowoczesnych algorytmów. [Strona protokołu](https://www.wireguard.com/protocol/) wymienia je: ChaCha20 z Poly1305 do szyfrowania, Curve25519 do wymiany kluczy oraz BLAKE2s do haszowania. Nie ma czego źle skonfigurować ani starszej, słabszej opcji, do której można by się cofnąć.

## Jak to działa?

Każde urządzenie ma parę kluczy, podobnie jak w SSH. Klient i serwer znają nawzajem swoje klucze publiczne z góry, a uzgadnianie połączenia opiera się na frameworku Noise (strona protokołu podaje dokładną konstrukcję: `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Wszystkie pakiety są wysyłane przez UDP](https://www.wireguard.com/protocol/), a nowa sesja jest nawiązywana w jednej wymianie komunikatów.

To dlatego WireGuard działa tak szybko. Prawie nie ma czego negocjować, na Linuksie kod działa w jądrze systemu, a przełączanie między Wi-Fi a siecią komórkową przebiega niezauważenie, ponieważ protokół nie utrzymuje długotrwałego otwartego połączenia.

## Dlaczego WireGuard jest blokowany?

Ta sama prostota, która ułatwia audyt WireGuarda, ułatwia też jego rozpoznanie. [Dokument techniczny](https://www.wireguard.com/papers/wireguard.pdf) opisuje komunikaty uzgadniania bajt po bajcie, więc pierwszy pakiet od klienta ma zawsze 148 bajtów, a odpowiedź zawsze 92 bajty, przy czym każdy zaczyna się od stałego pola typu komunikatu. System głębokiej inspekcji pakietów (DPI) potrzebuje tylko krótkiej reguły, by wychwycić taki wzorzec w UDP.

Cenzorzy dokładnie tak robią. W sierpniu 2023 roku użytkownicy w Rosji [zgłaszali](https://github.com/net4people/bbs/issues/274), że więksi operatorzy komórkowi zrywali sesje WireGuarda tuż po uzgadnianiu. Szyfrowanie nadal chroniło zawartość, ale samo połączenie przestawało istnieć.

To kompromis wynikający z konstrukcji, a nie błąd. Autorzy WireGuarda wybrali stały, minimalny protokół, a maskowanie nie należało do ich celów. Projekty takie jak [AmneziaWG](/vpn-protocols/amneziawg) zmieniają kształt pakietów, by przywrócić część osłony.

## Kiedy warto używać WireGuarda?

- **W sieciach bez filtrowania.** W domu, w pracy lub w podróży do kraju, który nie blokuje VPN-ów, WireGuard trudno pokonać pod względem szybkości i zużycia baterii.
- **Przy własnym serwerze.** Jeśli prowadzisz własny serwer, WireGuard to jeden z najłatwiejszych protokołów do poprawnego skonfigurowania.
- **Nie przy filtrowaniu DPI.** Jeśli sieć blokuje VPN-y, lepiej sprawdzi się protokół zbudowany tak, by wyglądał jak zwykły ruch internetowy, na przykład [VLESS-Reality](/vpn-protocols/vless-reality). Nasze porównanie [VLESS-Reality i WireGuarda](/blog/vless-reality-vs-wireguard) opisuje ten kompromis dokładniej.

## Czy Doppler używa WireGuarda?

Nie. Aplikacje Doppler łączą się przez VLESS-Reality, ponieważ Doppler powstał z myślą o sieciach, w których WireGuard jest filtrowany. Przewodnik [dlaczego VLESS](/vpn-protocols/why-vless) wyjaśnia to rozumowanie.
