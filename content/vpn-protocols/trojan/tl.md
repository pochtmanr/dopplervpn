> **Ang maikling bersyon.** Itinatago ng Trojan ang proxy traffic sa loob ng tunay na koneksyon ng TLS patungo sa tunay na website na kontrolado mo. Sinumang kumonekta nang walang password ay nakukuha lang ang website. Gumagana ito nang maayos, ngunit kailangan mo ng sarili mong domain at certificate, at maaaring matuklasan at ma-block ang mga iyon.

## Ano ang Trojan?

Ang Trojan ay proxy protocol mula sa [proyektong trojan-gfw](https://github.com/trojan-gfw/trojan), na unang inilabas noong Oktubre 2017. Nasa pangalan ang ideya nito: sa halip na mag-imbento ng pagbabalatkayo, nagtatago ito sa loob ng pinakakaraniwang naka-encrypt na traffic sa internet, ang HTTPS.

## Paano ito gumagana?

Maikli ang [paglalarawan ng protocol](https://trojan-gfw.github.io/trojan/protocol). Nakikinig ang isang Trojan server na parang karaniwang HTTPS server, na may tunay na certificate para sa tunay na domain. Gumagawa ang client ng tunay na TLS handshake. Pagkatapos, sa loob ng naka-encrypt na koneksyon, ipinapadala nito:

- ang hex-encoded na SHA-224 hash ng pinagsasaluhang password, na 56 na character,
- isang line break,
- isang maliit na request na nagsasabi kung saan dapat pumunta ang traffic, sa format na kahawig ng SOCKS5,
- isa pang line break, na sinusundan ng unang piraso ng data.

Kung valid ang hash at ang request, binubuksan ng server ang tunnel patungo sa destinasyon. Kung may mali, itinuturing ng server ang koneksyon bilang "iba pang protocol" at ipinapasa ito sa isang fallback na web server, kaya nakikita ng bisita ang isang karaniwang website.

## Gaano kahirap i-block ang Trojan?

Mula sa labas, ang koneksyon ng Trojan ay isang TLS session patungo sa domain mo, na may certificate mo. Nakakakuha ng tunay na website ang mga active probe. Dahil dito, mas mahirap ihiwalay ang Trojan kaysa sa mga protocol na mukhang random, tulad ng [Shadowsocks](/vpn-protocols/shadowsocks).

Ang mahinang punto nito ay ang mismong domain. Kailangan ng bawat server ng domain at certificate, at ang censor na nakaalam kung aling mga domain ang pag-aari ng mga proxy ay maaaring i-block ang mga ito ayon sa pangalan o ayon sa IP. Ipinakita rin ng mga mananaliksik na ang TLS na dinadala sa loob ng TLS ay nag-iiwan ng mga pattern ng timing at laki na maaaring [i-fingerprint](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), na apektado ang Trojan at mga katulad na disenyo.

Inaalis ng [VLESS-Reality](/vpn-protocols/vless-reality) ang problema sa domain sa pamamagitan ng paghiram sa TLS handshake ng isang umiiral at sikat na website sa halip na sa iyo.

## Kailan mo dapat gamitin ang Trojan?

- **Kapag kontrolado mo ang isang domain** at gusto mo ng simple at lubos na nauunawaang setup na mukhang HTTPS.
- **Sa mga network na katamtaman ang filter** kung saan malabong pagtuunan ang domain mo.
- Nakatutulong ang aming paghahambing ng [VLESS, VMess, at Trojan](/blog/vless-vs-vmess-vs-trojan) kung pumipili ka sa kanila.

## Gumagamit ba ang Doppler ng Trojan?

Hindi. Gumagamit ang Doppler ng VLESS-Reality, na hindi nangangailangan ng sarili nitong domain. Tingnan ang [bakit VLESS](/vpn-protocols/why-vless).
