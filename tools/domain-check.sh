#!/bin/bash
# Prueft nach der DNS-Umstellung, ob die Domain auf GitHub Pages zeigt, die
# Seite ausgeliefert wird und die E-Mail-Records unangetastet geblieben sind.
#
#   bash tools/domain-check.sh
#
# Solange die Umstellung noch nicht durch ist (oder der DNS-Cache noch die
# alten Werte hat), schlagen die Web-Pruefungen fehl - das ist dann erwartet.

DOMAIN="baeckerei-eichholz.de"
PAGES_HOST="aktienklar.github.io"
GH_IPS="185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153"
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
a_ist=$(dig +short "$DOMAIN" A | sort | tr '\n' ' ')
a_soll=$(echo $GH_IPS | tr ' ' '\n' | sort | tr '\n' ' ')
if [ "$a_ist" = "$a_soll" ]; then ok "A-Records zeigen auf GitHub Pages"
else fail "A-Records: $a_ist (erwartet: $a_soll)"; fi

www=$(dig +short "www.$DOMAIN" CNAME)
case "$www" in
  "$PAGES_HOST."*|"$PAGES_HOST") ok "www ist CNAME auf $PAGES_HOST" ;;
  "") fail "www hat keinen CNAME (zeigt auf: $(dig +short www.$DOMAIN A | tr '\n' ' '))" ;;
  *)  fail "www zeigt auf $www" ;;
esac

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
elif echo "$spf" | grep -qE '(^|[ "])a([ "]|$)'; then fail "SPF enthaelt noch 'a' (wuerde GitHub-IPs als Mailversender erlauben): $spf"
else ok "SPF ohne 'a': $spf"; fi

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
srv=$(curl -sI "https://$DOMAIN/" | grep -i '^server:' | tr -d '\r')
case "$srv" in *GitHub*) ok "ausgeliefert von GitHub Pages ($srv)" ;; *) fail "Server-Header: ${srv:-keiner} - noch nicht GitHub Pages" ;; esac

echo
echo "== Weiterleitungen alter WordPress-Adressen =="
for p in $ALTE; do
  if curl -s "https://$DOMAIN$p" | grep -q "ALTE_ADRESSEN"; then ok "$p erreicht die Weiterleitungsseite"
  else fail "$p landet nicht auf 404.html"; fi
done

echo
if [ "$fehler" -eq 0 ]; then printf '\033[32mAlles in Ordnung.\033[0m\n\n'
else printf '\033[31m%s Pruefung(en) offen.\033[0m\n\n' "$fehler"; fi
exit $([ "$fehler" -eq 0 ] && echo 0 || echo 1)
