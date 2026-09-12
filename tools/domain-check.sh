#!/bin/bash
# Prueft, ob unter der Domain die neue Seite ausgeliefert wird, die
# Weiterleitungen der alten WordPress-Adressen greifen und die E-Mail-Records
# unangetastet sind.
#
#   bash tools/domain-check.sh
#
# Die Seite laeuft auf dem Plesk-Webspace (Dokumentstamm httpdocs/neu), nicht
# auf GitHub Pages - siehe README, Abschnitt "Hosting-Variante Plesk".

DOMAIN="baeckerei-eichholz.de"
SERVER_IP="94.199.215.70"
MAIL_IP="94.199.215.70"
SEITEN="/ /ueber-uns.html /sortiment.html /shop.html /hochzeitstorten.html \
/oeffnungszeiten.html /kontakt.html /impressum.html /datenschutz.html /agb.html"
ALTE="/ueber-uns/ /produktsortiment/ /torten/ /torten/hochzeitstorten/ /filialen/ \
/kontakt/ /impressum/ /datenschutz/ /cookie-richtlinie-eu/ /unsere-neue-filiale/ \
/wo-kommt-unser-brot-denn-her/ /torten/bestellformular/ /torten/tortendekoration/ \
/torten/kinder-und-festtagstorten/ /template-item/produktsortiment/"

fehler=0
ok()   { printf '  \033[32mOK\033[0m    %s\n' "$1"; }
fail() { printf '  \033[31mFEHLT\033[0m %s\n' "$1"; fehler=$((fehler+1)); }

echo
echo "== DNS: Web =="
a_ist=$(dig +short "$DOMAIN" A | tr '\n' ' ' | sed 's/ $//')
if [ "$a_ist" = "$SERVER_IP" ]; then ok "Domain zeigt auf den Webspace ($SERVER_IP)"
else fail "A-Record: $a_ist (erwartet: $SERVER_IP)"; fi
www=$(curl -s -o /dev/null -w '%{redirect_url}' "https://www.$DOMAIN/")
case "$www" in "https://$DOMAIN/"*) ok "www leitet auf die Hauptadresse um" ;;
  *) fail "www leitet nach '${www:-nirgends}' - Bevorzugte Domain in Plesk gesetzt?" ;; esac

echo
echo "== DNS: E-Mail (muss unveraendert sein) =="
mx=$(dig +short "$DOMAIN" MX)
case "$mx" in *"mail.$DOMAIN"*) ok "MX: $mx" ;; *) fail "MX ist '$mx' - erwartet mail.$DOMAIN" ;; esac
for h in mail webmail imap smtp autodiscover autoconfig; do
  ip=$(dig +short "$h.$DOMAIN" A | head -1)
  if [ "$ip" = "$MAIL_IP" ]; then ok "$h.$DOMAIN -> $ip"; else fail "$h.$DOMAIN -> '${ip:-nichts}' (erwartet $MAIL_IP)"; fi
done
spf=$(dig +short "$DOMAIN" TXT | grep -i "v=spf1")
if [ -z "$spf" ]; then fail "kein SPF-Record gefunden"
else ok "SPF: $spf"; fi
# Hinweis: Der 'a'-Mechanismus im SPF zeigt auf den A-Record der Domain. Der
# ist weiterhin der Mailserver selbst, also unschaedlich. Erst wenn die Domain
# einmal auf einen fremden Webhost (z. B. GitHub Pages) zeigt, muss 'a' raus -
# sonst waere dessen IP als Mailversender autorisiert.

echo
echo "== HTTPS =="
zert=$(echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null \
       | openssl x509 -noout -issuer -enddate 2>/dev/null)
if [ -n "$zert" ]; then ok "Zertifikat: $(echo "$zert" | tr '\n' ' ')"; else fail "kein gueltiges Zertifikat erreichbar"; fi
code=$(curl -s -o /dev/null -w '%{http_code}' -I "http://$DOMAIN/")
case "$code" in 30*) ok "http:// leitet auf https um ($code)" ;; *) fail "http:// antwortet mit $code statt einer Weiterleitung (Enforce HTTPS gesetzt?)" ;; esac

echo
echo "== Seiten =="
for p in $SEITEN; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN$p")
  if [ "$code" = "200" ]; then ok "$p"; else fail "$p -> $code"; fi
done
titel=$(curl -s "https://$DOMAIN/" | grep -io '<title>[^<]*</title>')
case "$titel" in *"Frische"*|*"Konditorei"*) ok "Startseite ist die neue Fassung" ;;
  *) fail "unerwarteter Seitentitel: ${titel:-keiner}" ;; esac
for p in /wp-admin/ /wp-login.php /index.php; do
  c=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN$p")
  case "$c" in 200) fail "$p ist noch erreichbar - alte WordPress-Seite wird ausgeliefert" ;;
    *) ok "$p nicht mehr erreichbar ($c)" ;; esac
done

echo
echo "== Weiterleitungen alter WordPress-Adressen =="
for p in $ALTE; do
  ziel=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "https://$DOMAIN$p")
  case "$ziel" in 301*"$DOMAIN/"*.html) ok "$p -> ${ziel#301 }" ;;
    *) fail "$p ergibt '$ziel' statt einer 301-Weiterleitung" ;; esac
done

echo
if [ "$fehler" -eq 0 ]; then printf '\033[32mAlles in Ordnung.\033[0m\n\n'
else printf '\033[31m%s Pruefung(en) offen.\033[0m\n\n' "$fehler"; fi
exit $([ "$fehler" -eq 0 ] && echo 0 || echo 1)
