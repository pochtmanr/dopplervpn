> **W skrócie.** VMess to pierwotny protokół projektu V2Ray. Szyfruje własne nagłówki i zwykle jest opakowany w inny transport, na przykład WebSocket przez TLS, by wyglądać jak ruch stron. Nadal działa, ale jego następcy, VLESS i Trojan, robią to samo przy mniejszym narzucie.

## Czym jest VMess?

VMess to szyfrowany protokół proxy, który [projekt V2Ray](https://github.com/v2fly/v2ray-core) wprowadził na starcie w 2015 roku. V2Ray wyrósł na modularną platformę do budowania proxy: jeden rdzeń, wiele protokołów i transportów oraz silnik routingu, który decyduje, dokąd idzie który ruch. VMess był jego pierwszym protokołem i przez kilka lat głównym.

Podobnie jak Shadowsocks, VMess jest technicznie proxy, a nie VPN-em, ale aplikacje oparte na V2Ray mogą kierować przez niego całe urządzenie.

## Jak to działa?

Każdy użytkownik ma UUID, który służy jako poświadczenie. Według [dokumentacji protokołu](https://www.v2fly.org/en_US/developer/protocols/vmess.html) nagłówek żądania klienta zawiera zaszyfrowany identyfikator uwierzytelniania zbudowany ze znacznika czasu Unix, liczby losowej i sumy kontrolnej, zaszyfrowany kluczem wyprowadzonym z identyfikatora użytkownika. Serwer używa go, by rozpoznać użytkownika, a potem odszyfrowuje resztę nagłówka i dane.

Dokumentacja opisuje dwa sposoby ochrony nagłówka. Nowoczesny używa szyfrowania AEAD, które gwarantuje, że nagłówka nie zmieniono. Starszy używał MD5 i AES-128-CFB i nie mógł zagwarantować integralności nagłówka; dokumentacja przed nim ostrzega. Ponieważ identyfikator uwierzytelniania zawiera znacznik czasu, zegary klienta i serwera muszą być z grubsza zsynchronizowane — to częste źródło problemów w stylu „po prostu się nie łączy”.

## Jak trudno zablokować VMess?

Sam z siebie VMess wygląda jak losowe bajty, co stawia go w tej samej sytuacji co [Shadowsocks](/vpn-protocols/shadowsocks): jest narażony na firewalle, które blokują w pełni zaszyfrowany ruch. Dlatego VMess zwykle wdraża się wewnątrz WebSocket lub gRPC przez TLS, za domeną i certyfikatem, tak by obserwator widział coś, co wygląda jak zwykłe połączenie HTTPS ze stroną.

Ta otoczka wykonuje większość pracy przy ukrywaniu ruchu i niesie koszty: potrzebna jest domena, certyfikat i często CDN przed serwerem, a serwer szyfruje dane dwukrotnie, raz dla TLS i raz dla VMess.

## VMess, VLESS czy Trojan?

[VLESS](/vpn-protocols/vless-reality) zaprojektowano w projekcie Xray jako lżejszego następcę: zachowuje tożsamość opartą na UUID, ale rezygnuje z własnego szyfrowania VMess i polega w całości na warstwie TLS, co pozwala uniknąć podwójnego szyfrowania. [Trojan](/vpn-protocols/trojan) stosuje podobne podejście, z hasłem zamiast UUID. Nasze porównanie [VLESS, VMess i Trojan](/blog/vless-vs-vmess-vs-trojan) wchodzi w szczegóły.

## Czy Doppler używa VMess?

Nie. Doppler używa VLESS z Reality. Przewodnik [dlaczego VLESS](/vpn-protocols/why-vless) wyjaśnia dlaczego.
