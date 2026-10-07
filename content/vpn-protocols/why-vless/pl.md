> **W skrócie.** Zbudowaliśmy Dopplera dla ludzi w sieciach, które blokują VPN-y. W takich sieciach pytanie nie brzmi, który protokół jest najszybszy na papierze, tylko który jutro nadal będzie połączony. Wybraliśmy VLESS z Reality, bo daje cenzorowi najmniej do rozpoznania i najmniej do zablokowania, i przyjmujemy kompromisy, które się z tym wiążą.

## Do czego wybieraliśmy?

Doppler powstał dla ludzi, którzy łączą się z miejsc, gdzie VPN-y filtruje się celowo: z Rosji, Iranu, Chin i części Zatoki Perskiej. W tych sieciach szyfrowanie to łatwa część. Każdy protokół w naszym [porównaniu](/vpn-protocols) szyfruje dobrze. Różni je to, czy system filtrujący potrafi rozpoznać, że połączenie jest VPN-em, i co może zablokować, gdy już to zrobi.

Ocenialiśmy więc każdą opcję według trzech pytań:

1. **Czy ma stały odcisk?** Uzgadnianie o stałym rozmiarze albo standardowy port da się dopasować jedną regułą.
2. **Co się dzieje, gdy cenzor sonduje serwer?** Firewalle aktywnie łączą się z podejrzanymi proxy, by zobaczyć, jak odpowiadają.
3. **Czy jest coś do wpisania na listę blokad?** Domena, certyfikat albo rozpoznawalny serwer jest celem, nawet jeśli sam ruch jest dobrze ukryty.

## Dlaczego nie WireGuard, OpenVPN ani IKEv2?

Wszystkie trzy odpadają przy pierwszym pytaniu. Pakiety uzgadniania [WireGuarda](/vpn-protocols/wireguard) mają zawsze 148 i 92 bajty. [OpenVPN](/vpn-protocols/openvpn) rozpoznano w ponad 85% przepływów w badaniu prowadzonym wewnątrz prawdziwego dostawcy internetu. [IKEv2](/vpn-protocols/ikev2) działa na standardowych portach UDP, które można odrzucać hurtowo. W sierpniu 2023 roku użytkownicy w Rosji [zgłaszali](https://github.com/net4people/bbs/issues/274), że operatorzy zrywali WireGuard i OpenVPN w pierwszych pakietach. To dobre protokoły do sieci otwartych. Nie projektowano ich dla naszych.

## Dlaczego nie Shadowsocks ani VMess?

Przechodzą pierwsze pytanie, bo wyglądają jak losowe bajty, a to okazało się odciskiem samym w sobie. Od listopada 2021 roku Wielki Firewall [blokuje w pełni zaszyfrowany ruch](https://gfw.report/publications/usenixsecurity23/en/), który nie przypomina żadnego znanego protokołu. [VMess](/vpn-protocols/vmess) można opakować w TLS, by tego uniknąć, ale wtedy potrzebuje domeny, a to prowadzi do trzeciego pytania.

## Dlaczego nie Trojan?

[Trojan](/vpn-protocols/trojan) dobrze odpowiada na pierwsze dwa pytania: to prawdziwy TLS, a sondy widzą prawdziwą stronę. Ale każdy serwer Trojan potrzebuje własnej domeny i certyfikatu. Gdy cenzor pozna tę domenę, może ją zablokować, a prowadzenie wielu domen to nieustanna pogoń.

## Co VLESS-Reality robi dobrze

[VLESS-Reality](/vpn-protocols/vless-reality) odpowiada na wszystkie trzy:

- **Brak stałego odcisku.** Połączenie to TLS 1.3 przez TCP, najpowszechniejszy szyfrowany ruch w internecie.
- **Sondy widzą prawdziwą stronę.** Reality przekazuje każdego, kto nie potrafi się uwierzytelnić, do prawdziwej strony, której uzgadnianie pożycza, z prawdziwym certyfikatem tej strony.
- **Nic naszego do zablokowania po nazwie.** W uzgadnianiu nie ma domeny ani certyfikatu Doppler.

Działa też przez TCP, więc działa dalej w sieciach, które ograniczają albo blokują UDP, gdzie [Hysteria 2](/vpn-protocols/hysteria2) i [AmneziaWG](/vpn-protocols/amneziawg) mają trudności. A sam VLESS jest mały: do szyfrowania polega na TLS, zamiast dodawać własne, więc nie ma podwójnego szyfrowania.

## Z czego zrezygnowaliśmy

- **Surowa szybkość na łączach ze stratami.** TCP po utracie pakietów odzyskuje ciągłość mniej zgrabnie niż QUIC albo UDP WireGuarda. Na czystym połączeniu różnica jest niewielka; na słabym może być zauważalna.
- **Wbudowana obsługa w systemie.** Żaden system operacyjny nie dostarcza klienta VLESS, więc potrzebna jest aplikacja. Uznaliśmy, że to do przyjęcia, i zbudowaliśmy własne na iOS, Androida, macOS i Windows.
- **Doskonała niewidzialność.** Nie istnieje. Badania pokazały, że [TLS wewnątrz TLS da się rozpoznać](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), a w listopadzie 2025 roku [zgłaszano](https://github.com/net4people/bbs/issues/546), że niektórzy rosyjscy dostawcy internetu zrywali połączenia Reality. VLESS-Reality to konstrukcja odporna na cenzurę, a nie gwarancja.

## Co robimy z ograniczeniami

Cenzura się zmienia, więc wybór protokołu nie kończy pracy. Dostrajamy ustawienia serwerów i strony, które Reality pożycza, w miarę jak zmienia się filtrowanie, i dalej śledzimy te same badania oraz zgłoszenia społeczności cytowane na tych stronach. Jeśli pojawi się lepsze podejście, ta strona to powie.

Pełną techniczną historię działania VLESS-Reality opisuje [tunel VLESS-Reality](/how-it-works/vless-reality-tunnel). Żeby go wypróbować, zobacz [VLESS VPN](/vless-vpn).
