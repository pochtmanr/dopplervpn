> **Trumpai.** VMess yra pirmasis V2Ray projekto protokolas. Jis pats šifruoja savo antraštes ir paprastai įvelkamas į kitą transportą, pavyzdžiui WebSocket ant TLS, kad atrodytų kaip žiniatinklio srautas. Jis vis dar veikia, bet jo įpėdiniai, VLESS ir Trojan, tą patį padaro su mažesnėmis papildomomis sąnaudomis.

## Kas yra VMess?

VMess yra šifruotas proksi protokolas, kurį [V2Ray projektas](https://github.com/v2fly/v2ray-core) pristatė pradėjęs veikti 2015 m. V2Ray išaugo į modulinę platformą proksi kurti: vienas branduolys, daug protokolų ir transportų bei maršrutizavimo variklis, kuris nusprendžia, kuris srautas kur keliauja. VMess buvo pirmasis jo protokolas ir kelerius metus pagrindinis.

Kaip ir Shadowsocks, VMess techniškai yra proksi, o ne VPN, bet V2Ray pagrindu veikiančios programėlės gali per jį nukreipti visą įrenginio srautą.

## Kaip jis veikia?

Kiekvienas naudotojas turi UUID, kuris veikia kaip jo tapatybės duomenys. Pagal [protokolo dokumentaciją](https://www.v2fly.org/en_US/developer/protocols/vmess.html) kliento užklausos antraštėje yra užšifruotas autentifikavimo identifikatorius, sudarytas iš Unix laiko žymos, atsitiktinio skaičiaus ir kontrolinės sumos, užšifruotas raktu, išvestu iš naudotojo identifikatoriaus. Pagal jį serveris atpažįsta naudotoją, tada iššifruoja likusią antraštę ir duomenis.

Dokumentacija aprašo du antraštės apsaugos būdus. Šiuolaikinis naudoja AEAD šifravimą, kuris garantuoja, kad antraštė nebuvo pakeista. Senesnis naudojo MD5 ir AES-128-CFB ir negalėjo garantuoti antraštės vientisumo; dokumentacija nuo jo perspėja. Kadangi autentifikavimo identifikatoriuje yra laiko žyma, kliento ir serverio laikrodžiai turi būti apytikriai sinchroniški — dažna „tiesiog neprisijungia“ problemų priežastis.

## Kaip sunku užblokuoti VMess?

Pats savaime VMess atrodo kaip atsitiktiniai baitai, todėl atsiduria toje pačioje padėtyje kaip [Shadowsocks](/vpn-protocols/shadowsocks): jį gali pagauti ugniasienės, blokuojančios visiškai užšifruotą srautą. Todėl VMess paprastai diegiamas WebSocket arba gRPC viduje, ant TLS, už domeno ir sertifikato, kad stebėtojas matytų tai, kas panašu į įprastą HTTPS ryšį su svetaine.

Didžiąją slėpimo darbo dalį atlieka šis apvalkalas, ir jis turi kainą: reikia domeno, sertifikato ir dažnai CDN prieš serverį, o serveris duomenis šifruoja du kartus — kartą TLS ir kartą VMess.

## VMess, VLESS ar Trojan?

[VLESS](/vpn-protocols/vless-reality), kurį Xray projektas sukūrė kaip lengvesnį įpėdinį, išlaiko tapatybę pagal UUID, bet atsisako paties VMess šifravimo ir visiškai remiasi TLS sluoksniu, taip išvengdamas dvigubo šifravimo. [Trojan](/vpn-protocols/trojan) naudoja panašų būdą, tik su slaptažodžiu vietoj UUID. Mūsų palyginimas [VLESS, VMess ir Trojan](/blog/vless-vs-vmess-vs-trojan) tai aptaria išsamiau.

## Ar Doppler naudoja VMess?

Ne. Doppler naudoja VLESS su Reality. Kodėl, paaiškina vadovas [„Kodėl VLESS“](/vpn-protocols/why-vless).
