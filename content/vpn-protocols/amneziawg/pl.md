> **W skrócie.** AmneziaWG to fork WireGuarda, który zachowuje jego szybkość i kryptografię, ale zmienia kształty pakietów i nagłówki, przez które WireGuarda łatwo rozpoznać. To mocna opcja tam, gdzie zwykły WireGuard jest blokowany, z jednym zastrzeżeniem: po włączeniu zaciemniania nie rozmawia już ze standardowymi serwerami WireGuarda.

## Czym jest AmneziaWG?

AmneziaWG rozwija zespół stojący za [Amnezia VPN](https://amnezia.org/), otwartoźródłową aplikacją do uruchamiania własnego serwera VPN. [Implementacja w Go](https://github.com/amnezia-vpn/amneziawg-go) projektu ruszyła w 2023 roku. Bierze [WireGuard](/vpn-protocols/wireguard), który jest szybki i prosty, ale ma stałe, rozpoznawalne uzgadnianie, i dodaje warstwę, która go maskuje.

## Co zmienia?

[Dokumentacja AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) opisuje kilka mechanizmów, a każdym sterują parametry konfiguracji:

- **Dynamiczne nagłówki (H1–H4).** Standardowe pakiety WireGuarda zaczynają się od stałego typu komunikatu dla każdego z czterech formatów pakietów. AmneziaWG zastępuje te wartości liczbami wybranymi ze skonfigurowanych zakresów, więc dwie różne konfiguracje nie dzielą nagłówków i żadna pojedyncza reguła filtra nie pasuje do wszystkich.
- **Losowanie długości pakietów (S1–S4).** W WireGuardzie początkowy pakiet uzgadniania ma zawsze dokładnie 148 bajtów. AmneziaWG dodaje losowe prefiksy do każdego typu pakietu, więc rozmiary się różnią.
- **Pakiety śmieciowe (Jc, Jmin, Jmax).** Przed uzgadnianiem klient wysyła konfigurowalną liczbę pseudolosowych pakietów o losowej długości, które rozmywają początek sesji zarówno w czasie, jak i w rozmiarze.
- **Ochrona nagłówka.** Nowsze wersje potrafią też szyfrować samo pole typu komunikatu.

Pod spodem kryptografia i ogólna konstrukcja pozostają takie jak w WireGuardzie.

## Jak trudno zablokować AmneziaWG?

Usuwa proste sygnatury, których filtry używają przeciw WireGuardowi: stałe rozmiary i stałe wartości nagłówków. Dzięki temu jest znacznie odporniejszy niż zwykły WireGuard w sieciach, które blokują VPN-y.

Nadal działa przez UDP, więc sieci, które szeroko ograniczają albo blokują UDP, będą na niego wpływać, a jego ruch nie naśladuje żadnej konkretnej aplikacji tak, jak [VLESS-Reality](/vpn-protocols/vless-reality) naśladuje wizytę TLS na prawdziwej stronie. Filtr, który od razu blokuje nierozpoznawalne UDP, nadal mógłby go złapać.

## Kiedy warto używać AmneziaWG?

- **Tam, gdzie WireGuard jest blokowany**, ale UDP nadal działa i chcesz szybkości zbliżonej do WireGuarda.
- **Własne serwery**, konfigurowane aplikacją Amnezia VPN.
- Miej pod ręką opcję opartą na TCP, taką jak VLESS-Reality, dla sieci filtrujących UDP. Nasz [przewodnik dla Rosji](/vpn-for-russia) opisuje, co obecnie tam przechodzi.

## Czy Doppler używa AmneziaWG?

Nie. Doppler używa VLESS-Reality. Zobacz [dlaczego VLESS](/vpn-protocols/why-vless).
