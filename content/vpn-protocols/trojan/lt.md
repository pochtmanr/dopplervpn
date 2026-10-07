> **Trumpai.** Trojan slepia proksi srautą tikrame TLS ryšyje su tikra svetaine, kurią valdote. Kas prisijungia be slaptažodžio, tiesiog mato svetainę. Tai veikia gerai, bet reikia savo domeno ir sertifikato, o juos galima rasti ir užblokuoti.

## Kas yra Trojan?

Trojan yra proksi protokolas iš [trojan-gfw projekto](https://github.com/trojan-gfw/trojan), pirmą kartą išleistas 2017 m. spalį. Idėja slypi pavadinime: užuot kūręs maskuotę, jis slepiasi dažniausiame šifruotame interneto sraute — HTTPS.

## Kaip jis veikia?

[Protokolo aprašas](https://trojan-gfw.github.io/trojan/protocol) trumpas. Trojan serveris klauso kaip paprastas HTTPS serveris, su tikru sertifikatu tikram domenui. Klientas atlieka tikrą TLS rankos paspaudimą. Tada šifruoto ryšio viduje jis siunčia:

- bendro slaptažodžio šešioliktainę SHA-224 maišą, kuri yra 56 simbolių,
- eilutės lūžį,
- trumpą užklausą, kur nukreipti srautą, į SOCKS5 panašiu formatu,
- dar vieną eilutės lūžį, o po jo — pirmąją duomenų dalį.

Jei maiša ir užklausa teisingos, serveris atidaro tunelį iki paskirties. Jei kas nors neteisinga, serveris ryšį laiko „kitais protokolais“ ir perduoda jį atsarginiam žiniatinklio serveriui, todėl lankytojas mato paprastą svetainę.

## Kaip sunku užblokuoti Trojan?

Iš išorės Trojan ryšys yra TLS seansas su jūsų domenu ir jūsų sertifikatu. Aktyvieji zondai gauna tikrą svetainę. Todėl Trojan išskirti daug sunkiau nei protokolus, kurie atrodo atsitiktiniai, pavyzdžiui [Shadowsocks](/vpn-protocols/shadowsocks).

Jo silpnoji vieta yra pats domenas. Kiekvienam serveriui reikia domeno ir sertifikato, o cenzorius, sužinojęs, kurie domenai priklauso proksi, gali juos užblokuoti pagal pavadinimą arba pagal IP. Tyrėjai taip pat parodė, kad TLS, nešamas TLS viduje, palieka laiko ir dydžio dėsningumus, pagal kuriuos jį galima [atpažinti](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), ir tai liečia Trojan bei panašias sandaras.

[VLESS-Reality](/vpn-protocols/vless-reality) domeno problemą pašalina pasiskolindamas esamos, populiarios svetainės TLS rankos paspaudimą, o ne jūsų pačių.

## Kada verta naudoti Trojan?

- **Kai valdote domeną** ir norite paprastos, gerai suprantamos sąrankos, kuri atrodo kaip HTTPS.
- **Vidutiniškai filtruojamuose tinkluose**, kur jūsų domenas vargu ar taps taikiniu.
- Mūsų palyginimas [VLESS, VMess ir Trojan](/blog/vless-vs-vmess-vs-trojan) padeda, jei renkatės tarp jų.

## Ar Doppler naudoja Trojan?

Ne. Doppler naudoja VLESS-Reality, kuriam nereikia savo domeno. Žr. [„Kodėl VLESS“](/vpn-protocols/why-vless).
