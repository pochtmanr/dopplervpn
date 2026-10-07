> **W skrócie.** OpenVPN to weteran otwartoźródłowych VPN-ów: elastyczny, szeroko wspierany i dobrze poznany po ponad dwóch dekadach. Jest też wolniejszy od nowszych protokołów i, według opublikowanych badań, jeden z najłatwiejszych do rozpoznania przez dostawcę internetu.

## Czym jest OpenVPN?

OpenVPN to darmowe, otwartoźródłowe oprogramowanie VPN, po raz pierwszy wydane przez Jamesa Yonana [w maju 2001 roku](https://en.wikipedia.org/wiki/OpenVPN). Przez większość lat 2000. i 2010. był domyślnym wyborem komercyjnych usług VPN i zdalnego dostępu w firmach, a nadal jest dołączany do wielu routerów i produktów korporacyjnych.

Działa w przestrzeni użytkownika, a nie w jądrze systemu operacyjnego, a do wymiany kluczy wykorzystuje bibliotekę OpenSSL i protokół TLS. Port przypisany przez IANA to 1194, choć OpenVPN może działać przez UDP lub TCP na niemal dowolnym porcie.

## Jak to działa?

OpenVPN używa własnego protokołu złożonego z dwóch części. Kanał sterujący wykorzystuje TLS do uwierzytelnienia obu stron, zwykle za pomocą certyfikatów, i do uzgodnienia kluczy. Następnie kanał danych przesyła Twój ruch, zaszyfrowany tymi kluczami, w pakietach UDP lub TCP.

Taka struktura sprawia, że OpenVPN jest bardzo konfigurowalny. Można wybierać szyfry, metody uwierzytelniania, porty i transporty oraz uruchamiać go przez serwery proxy. Ceną za tę elastyczność jest złożoność: więcej kodu, więcej ustawień i więcej sposobów na słabą konfigurację.

## Dlaczego OpenVPN jest blokowany?

TLS wewnątrz OpenVPN to nie to samo, co wizyta na stronie przez HTTPS. OpenVPN opakowuje uzgadnianie TLS we własne ramkowanie pakietów, więc jego ruch ma kształt, którego zwykły ruch internetowy nie ma.

Badacze zmierzyli, jak bardzo to ma znaczenie. Zespół z University of Michigan i innych ośrodków [zbudował system do rozpoznawania](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) i uruchomił go u dostawcy internetu obsługującego około miliona użytkowników. Zidentyfikował **ponad 85% przepływów OpenVPN** przy bardzo niewielkiej liczbie fałszywych alarmów, a także wychwycił większość komercyjnych „zaciemnionych” konfiguracji OpenVPN, które przetestowano.

Rzeczywiste filtrowanie idzie za badaniami. W sierpniu 2023 roku użytkownicy w Rosji [zgłaszali](https://github.com/net4people/bbs/issues/274), że operatorzy komórkowi zrywają połączenia OpenVPN krótko po ich rozpoczęciu.

## Kiedy warto używać OpenVPN?

- **Zgodność.** Starsze routery, bramy korporacyjne i niektóre sieci firmowe obsługują OpenVPN i nic nowszego.
- **Sieci tylko z TCP.** OpenVPN może działać przez TCP, gdy UDP jest zablokowany, czego [WireGuard](/vpn-protocols/wireguard) nie potrafi bez pomocy.
- **Nie w sieciach z filtrowaniem.** Tam, gdzie VPN-y są blokowane, OpenVPN zwykle szybko przestaje działać. Lepszym narzędziem jest protokół naśladujący zwykły ruch internetowy, taki jak [VLESS-Reality](/vpn-protocols/vless-reality). Nasz [przewodnik o cenzurze](/bypass-censorship) wyjaśnia, jak systemy filtrujące decydują, co odciąć.

## Czy Doppler używa OpenVPN?

Nie. Doppler używa VLESS-Reality na każdej platformie. Przewodnik [dlaczego VLESS](/vpn-protocols/why-vless) wyjaśnia, jak go wybraliśmy.
