> **Ang maikling bersyon.** Ang IKEv2/IPsec ay VPN na alam nang gamitin ng telepono at laptop mo nang walang anumang app. Mabilis ito at mahusay sa paglipat sa pagitan ng Wi-Fi at mobile data. Tumatakbo rin ito sa mga nakapirmi at kilalang port, kaya isa ito sa pinakasimpleng protocol na i-block ng isang censor.

## Ano ang IKEv2/IPsec?

Ang "IKEv2" ay talagang dalawang bahaging magkasamang gumagana. Ang IPsec ang suite na nag-eencrypt at nag-aauthenticate ng mga IP packet. Ang IKE, o Internet Key Exchange, ang protocol na ginagamit ng dalawang panig para i-authenticate ang isa't isa at magkasundo sa mga IPsec key. Na-standardize ang bersyon 2 ng IKE [noong Disyembre 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), at ang kasalukuyang specification ay [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Dahil isa itong IETF standard, built-in ang IKEv2 sa iOS, macOS, at Windows, at sa Android mula bersyon 11. Maraming corporate VPN gateway ang gumagamit nito.

## Paano ito gumagana?

Tumatakbo ang key exchange sa UDP, [karaniwan sa port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Kapag nagkasundo na ang dalawang panig sa mga key, ine-encrypt ng IPsec stack ng operating system ang traffic mo gamit ang Encapsulating Security Payload (ESP). Kapag may NAT router sa pagitan, tulad ng sa halos lahat ng home at mobile network, parehong ibinabalot sa UDP sa port 4500 ang IKE at ESP.

May karaniwang extension ang IKEv2 na tinatawag na [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) na nagpapahintulot sa isang koneksyon na magpatuloy kahit magbago ang IP address. Kaya maganda ang IKEv2 sa telepono: kapag lumabas ka sa saklaw ng Wi-Fi at lumipat sa mobile data, nagpapatuloy ang tunnel sa halip na muling kumonekta mula sa simula.

## Bakit madaling i-block ang IKEv2?

Hindi nagtatangkang magmukhang iba ang IKEv2. Gumagamit ng mga kilalang UDP port ang traffic nito at may karaniwang format ng IKE at ESP na kayang basahin ng anumang network tool. Hindi na nga kailangan ng deep packet inspection para i-block ito: maaaring i-drop ng isang filter ang mga UDP port 500 at 4500, o direktang kilalanin ang IKE exchange.

Makatwirang trade-off iyon para sa mga corporate network at sa paglalakbay sa mga bansang bukas, kung saan walang kapalit ang pagkilalang VPN ito. Sa mga network na sadyang nagsasala ng mga VPN, kadalasan ito ang unang tumitigil gumana.

## Kailan mo dapat gamitin ang IKEv2?

- **Walang pinapayagang app.** Sa device na pinamamahalaan ng iba kung saan hindi ka makapag-install ng software, maaaring ang built-in na IKEv2 client lang ang opsyon.
- **Mobile roaming sa mga bukas na network.** Pinapaganda ng MOBIKE ang paglipat mo mula sa isang network patungo sa iba.
- **Hindi para sa may censorship.** Sa mga network na may filter, pumili ng protocol na idinisenyong makihalo, tulad ng [VLESS-Reality](/vpn-protocols/vless-reality). Ipinaliliwanag ng aming [gabay sa censorship](/bypass-censorship) kung paano gumagana ang pag-block.

## Gumagamit ba ang Doppler ng IKEv2?

Hindi. Kumokonekta ang Doppler gamit ang VLESS-Reality sa loob ng sarili nitong mga app. Tingnan ang [bakit VLESS](/vpn-protocols/why-vless) para sa mga dahilan.
