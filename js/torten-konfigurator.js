/* ---------------------------------------------------------
   HOCHZEITSTORTEN – Anfrageformular
   Baut das schematische Etagen-Diagramm sowie die Auswahlfelder
   für Bisquit/Füllung je Etage und verschickt die Anfrage per
   mailto:. Rein DOM-basiert, keine externen Bibliotheken.
--------------------------------------------------------- */

// Only the flavours offered on the real order form:
const FUELLUNGEN = ["Erdbeer","Himbeer","Kiwi","Kirsch","Schokolade","Vanille","Pfirsich","Ananas","Kokos","Eierlikör","Maracuja","Mango","Heidelbeer"];
const BISQUITS   = ["Hell","Kakao","Haselnuss","Kokos","Eierlikör","Mohn"];
const NUM_TIERS  = 8;

function optionList(items){
  return ['<option value="">nicht gewählt</option>']
    .concat(items.map(x=>`<option>${x}</option>`)).join("");
}

// --- schematic cake diagram (tier 1 bottom → 8 top), matching the order form ---
(function buildDiagram(){
  const el = document.getElementById("tkTierDiagram");
  if(!el) return;
  const W = 200, topPad = 10, th = 30, gap = 4;
  const H = topPad*2 + NUM_TIERS*th + (NUM_TIERS-1)*gap;
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  for(let i=0;i<NUM_TIERS;i++){          // i=0 → top tier (8),  i=7 → bottom tier (1)
    const num = NUM_TIERS - i;
    const w = 70 + i*15;                  // widest at the bottom
    const x = (W - w)/2;
    const y = topPad + i*(th+gap);
    const ry = 5;
    s += `<rect x="${x.toFixed(1)}" y="${y}" width="${w}" height="${th}" rx="${ry}" ry="${ry}" fill="#ffffff" stroke="#2b241c" stroke-width="1.2"/>`;
    s += `<line x1="${(x+7).toFixed(1)}" y1="${y+th/2}" x2="${(x+w-7).toFixed(1)}" y2="${y+th/2}" stroke="#c6a55c" stroke-width="1.6"/>`;
    s += `<text x="${(x-12).toFixed(1)}" y="${y+th/2+4}" font-family="Georgia,serif" font-size="13" fill="#2b241c" text-anchor="end">${num}</text>`;
  }
  s += `</svg>`;
  el.innerHTML = s;
})();

// --- per-tier Füllung + Bisquit selects, ordered 8 → 1 like the order form ---
(function buildTierSelects(){
  const grid = document.getElementById("tkTiersGrid");
  if(!grid) return;
  let html = "";
  for(let t=NUM_TIERS; t>=1; t--){
    html += `<div class="tk-field">
        <label for="tk-fuellung${t}">Füllung ${t}</label>
        <select id="tk-fuellung${t}">${optionList(FUELLUNGEN)}</select>
      </div>
      <div class="tk-field">
        <label for="tk-bisquit${t}">Bisquit ${t}</label>
        <select id="tk-bisquit${t}">${optionList(BISQUITS)}</select>
      </div>`;
  }
  grid.innerHTML = html;
})();

/* ---------------------------------------------------------
   FORMULAR-VERSAND — öffnet das E-Mail-Programm des Kunden mit
   vorausgefüllter Anfrage (mailto:), genau wie der bisherige
   "Tortenanfragen"-Link auf dieser Seite. Diese statische Website hat
   kein Server-Backend, daher ist mailto: der bestehende Versand-Weg
   (siehe auch der Hinweis auf kontakt.html).
--------------------------------------------------------- */
const ORDER_RECIPIENT = "hochzeitstorten@baeckerei-eichholz.de";

function fieldValue(id){
  const el = document.getElementById(id);
  if(!el) return "";
  return (el.value || "").trim();
}

function radioValue(name){
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}

function checkboxLabel(id, label){
  const el = document.getElementById(id);
  return el && el.checked ? label : "Nein";
}

function buildOrderMailBody(){
  const lines = [];
  const add = (label, value) => { if(value) lines.push(`${label}: ${value}`); };

  add("Datum der Feierlichkeit", fieldValue("tk-datum"));
  add("Name der Torte", fieldValue("tk-tortenname"));
  add("Größe der Torte", fieldValue("tk-groesse"));
  add("Form der Torte", fieldValue("tk-form"));
  add("Dekorations-/Blumenmaterial", fieldValue("tk-deko"));
  add("Farbe der Dekoration/Blume", fieldValue("tk-dekofarbe"));
  add("Art der Blume", fieldValue("tk-blumenart"));
  add("Art des Tortengestells", fieldValue("tk-gestell"));
  add("Brautpaar gewünscht", fieldValue("tk-brautpaar"));
  add("Brautpaar-Nummer", fieldValue("tk-brautpaarnr"));

  lines.push("");
  lines.push("Tortenfüllungen (Etage 8 oben → Etage 1 unten):");
  for(let t=NUM_TIERS; t>=1; t--){
    const fuellung = fieldValue(`tk-fuellung${t}`);
    const bisquit = fieldValue(`tk-bisquit${t}`);
    if(fuellung || bisquit){
      lines.push(`  Etage ${t}: Bisquit ${bisquit || "-"} / Füllung ${fuellung || "-"}`);
    }
  }

  lines.push("");
  add("Ort der Feierlichkeit", fieldValue("tk-ort"));
  add("Lieferung gewünscht", fieldValue("tk-lieferung"));
  add("Zeit der Anlieferung/Abholung", fieldValue("tk-zeit"));

  lines.push("");
  lines.push("Anschrift:");
  add("Anrede", radioValue("tk-anrede"));
  add("Name", fieldValue("tk-aname"));
  add("Firma", fieldValue("tk-firma"));
  add("Anschrift", fieldValue("tk-anschrift"));
  add("Telefon", fieldValue("tk-telefon"));
  add("Rückruf gewünscht", checkboxLabel("tk-rueckruf", "Ja"));
  add("Fax", fieldValue("tk-fax"));
  add("E-Mail", fieldValue("tk-email"));

  lines.push("");
  lines.push("Nachricht:");
  lines.push(fieldValue("tk-nachricht") || "-");

  return lines.join("\n");
}

const orderForm = document.getElementById("tkOrderForm");
if(orderForm){
  orderForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const btn = e.target.querySelector("button[type=submit]");
    const original = btn.textContent;

    const tortenname = fieldValue("tk-tortenname");
    const subject = `Tortenanfrage${tortenname ? " – " + tortenname : ""}`;
    const body = buildOrderMailBody();
    const mailtoUrl = `mailto:${ORDER_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    btn.textContent = "Ihr E-Mail-Programm öffnet sich…";
    setTimeout(()=> btn.textContent = original, 3200);
  });
}
