#!/usr/bin/env python3
import base64, pathlib

# Paths relative to the repo, regardless of the execution directory.
REPO_ROOT = pathlib.Path(__file__).resolve().parents[3]
FONTS_DIR = REPO_ROOT / "public" / "fonts"
OUT = pathlib.Path(__file__).resolve().parent / "preview-dyslexie.html"

def datauri(name):
    b = (FONTS_DIR / name).read_bytes()
    return "data:font/woff2;base64," + base64.b64encode(b).decode()

sylex = datauri("SylexiadSansMedium.woff2")
andika = datauri("Andika-Regular.woff2")
inter = datauri("Inter-VariableFont_opsz,wght.woff2")
giga = datauri("LexendGiga-VariableFont_wght.woff2")
deca = datauri("LexendDeca-VariableFont_wght.woff2")
quick = datauri("Quicksand-VariableFont_wght.woff2")

CONTENT = """
  <h1>Portfolio accessible</h1>
  <h2>Concevoir pour tous</h2>
  <p>Je conçois des sites où l'accessibilité n'est pas une couche ajoutée
  après coup, mais le socle de l'architecture. Chaque composant reste
  utilisable au clavier, au lecteur d'écran et en vision réduite.</p>
  <p>Le mode dyslexie hiérarchise titres, sous-titres et corps de texte,
  augmente les espacements et compense la taille perçue des paragraphes.</p>
  <ul>
    <li>Espacements entre lettres et lignes augmentés</li>
    <li>Taille des paragraphes compensée</li>
    <li>Une police adaptée par niveau de lecture</li>
  </ul>
"""

HTML = f"""<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Réglage mode dyslexie — Sylexiad / Andika indépendants (phase 4)</title>
<style>
@font-face {{ font-family:"SylexiadSans"; src:url("{sylex}") format("woff2"); font-weight:normal; }}
@font-face {{ font-family:"Andika"; src:url("{andika}") format("woff2"); font-weight:normal; }}
@font-face {{ font-family:"Inter"; src:url("{inter}") format("woff2-variations"); font-weight:100 900; }}
@font-face {{ font-family:"Lexend Giga"; src:url("{giga}") format("woff2"); font-weight:100 900; }}
@font-face {{ font-family:"Lexend Deca"; src:url("{deca}") format("woff2"); font-weight:100 900; }}
@font-face {{ font-family:"Quicksand"; src:url("{quick}") format("woff2"); font-weight:300 700; }}

:root {{ color-scheme: light dark;
  --syl-adj:0.56; --syl-scale:1;
  --and-adj:0.56; --and-scale:1;
  --lh:1.75; --ls:0.04em; --ws:0.128em; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; font-family:"Inter",system-ui,sans-serif; background:#f4f5f7; color:#1a1a1a; }}
@media (prefers-color-scheme:dark){{ body{{ background:#15171a; color:#e8e8e8; }} }}

.panel {{ position:sticky; top:0; z-index:5; background:#fff; border-bottom:2px solid #0003;
  padding:.7rem 1.2rem; display:flex; flex-wrap:wrap; gap:.6rem 2.2rem; align-items:flex-start; }}
@media (prefers-color-scheme:dark){{ .panel{{ background:#1e2126; }} }}
.group {{ display:flex; flex-wrap:wrap; gap:.5rem 1.2rem; align-items:center;
  padding:.5rem .8rem; border:1px solid #0003; border-radius:.6rem; }}
.group > strong {{ width:100%; font:700 .8rem/1 "Inter",sans-serif; }}
.group.syl > strong {{ color:#b3541e; }} .group.and > strong {{ color:#1f5eb3; }}
@media (prefers-color-scheme:dark){{ .group.syl > strong{{color:#f0a06a;}} .group.and > strong{{color:#7db3f0;}} }}
.panel label {{ display:flex; flex-direction:column; gap:.2rem; font:600 .72rem/1 "Inter",sans-serif; }}
.panel input[type=range] {{ width:140px; }}
.panel output {{ font:700 .85rem/1 ui-monospace,monospace; color:#1f7a4d; }}
@media (prefers-color-scheme:dark){{ .panel output{{ color:#5fd39a; }} }}

.grid {{ display:grid; grid-template-columns:1fr 1fr 1fr; }}
@media (max-width:1100px){{ .grid{{ grid-template-columns:1fr; }} }}
.col {{ padding:1.3rem 1.5rem 2rem; border-left:1px solid #0002; }}
.col:first-child {{ border-left:none; }}
.tag {{ display:inline-block; font:700 .7rem/1 "Inter",sans-serif; letter-spacing:.08em;
  text-transform:uppercase; padding:.35rem .6rem; border-radius:999px; margin-bottom:.9rem; }}
.witness .tag {{ background:#e0e0e0; color:#444; }}
.col-sylexiad .tag {{ background:#b3541e; color:#fff; }}
.col-andika .tag {{ background:#1f5eb3; color:#fff; }}

/* Identical heading sizes across the 3 columns (fair comparison) */
.col h1 {{ font-size:1.7rem; margin:.2rem 0 .5rem; }}
.col h2 {{ font-size:1.3rem; margin:0 0 .9rem; }}
.col ul {{ padding-left:1.3em; }} .col li {{ margin:.3em 0; }}

/* ── Témoin : site en mode NORMAL ── */
.witness h1 {{ font-family:"Lexend Giga",sans-serif; font-weight:600; line-height:1.3; letter-spacing:-.025em; }}
.witness h2 {{ font-family:"Quicksand",sans-serif; font-weight:600; letter-spacing:-.02em; }}
.witness p, .witness li {{ font-family:"Inter",sans-serif; font-weight:400; line-height:1.5; }}

/* ── Mode dyslexie : titres = niveaux 1 et 2 du module (identiques aux 2 colonnes) ── */
.tuned h1 {{ font-family:"Lexend Giga",sans-serif; font-weight:600; line-height:1.3; letter-spacing:-.025em; }}
.tuned h2 {{ font-family:"Lexend Deca",sans-serif; font-weight:600; letter-spacing:-.02em; }}

/* ── Corps : réglages indépendants par police via variables scopées ── */
.tuned p, .tuned li {{
  font-weight:400;
  font-size-adjust:var(--adj);
  font-size:calc(1em * var(--scale));
  line-height:var(--lh);
  letter-spacing:var(--ls);
  word-spacing:var(--ws);
}}
.col-sylexiad {{ --adj:var(--syl-adj); --scale:var(--syl-scale); }}
.col-sylexiad p, .col-sylexiad li {{ font-family:"SylexiadSans",sans-serif; }}
.col-andika {{ --adj:var(--and-adj); --scale:var(--and-scale); }}
.col-andika p, .col-andika li {{ font-family:"Andika",sans-serif; }}
</style></head><body>

<div class="panel">
  <div class="group syl">
    <strong>Sylexiad — ton site</strong>
    <label>font-size-adjust
      <input type="range" id="syl-adj" min="0.45" max="0.68" step="0.005" value="0.56">
      <output id="syl-adj-v">0.560</output>
    </label>
    <label>agrandissement
      <input type="range" id="syl-scale" min="1" max="1.45" step="0.01" value="1">
      <output id="syl-scale-v">1.00</output>
    </label>
  </div>
  <div class="group and">
    <strong>Andika — défaut paquet</strong>
    <label>font-size-adjust
      <input type="range" id="and-adj" min="0.45" max="0.68" step="0.005" value="0.56">
      <output id="and-adj-v">0.560</output>
    </label>
    <label>agrandissement
      <input type="range" id="and-scale" min="1" max="1.45" step="0.01" value="1">
      <output id="and-scale-v">1.00</output>
    </label>
  </div>
  <div class="group">
    <strong>Commun (espacements corps)</strong>
    <label>line-height
      <input type="range" id="lh" min="1.5" max="2" step="0.05" value="1.75">
      <output id="lh-v">1.75</output>
    </label>
    <label>letter-spacing (em)
      <input type="range" id="ls" min="0" max="0.12" step="0.005" value="0.04">
      <output id="ls-v">0.040</output>
    </label>
  </div>
</div>

<div class="grid">
  <div class="col witness">
    <span class="tag">Témoin — mode normal (Inter / Quicksand)</span>
    {CONTENT}
  </div>
  <div class="col tuned col-sylexiad">
    <span class="tag">Dyslexie · corps Sylexiad</span>
    {CONTENT}
  </div>
  <div class="col tuned col-andika">
    <span class="tag">Dyslexie · corps Andika</span>
    {CONTENT}
  </div>
</div>

<script>
const root = document.documentElement;
const conf = {{
  "syl-adj":   {{ v:"--syl-adj",   f:3 }},
  "syl-scale": {{ v:"--syl-scale", f:2 }},
  "and-adj":   {{ v:"--and-adj",   f:3 }},
  "and-scale": {{ v:"--and-scale", f:2 }},
  "lh":        {{ v:"--lh",        f:2 }},
  "ls":        {{ v:null,          f:3 }},
}};
for (const [id, c] of Object.entries(conf)) {{
  document.getElementById(id).addEventListener("input", (e) => {{
    const val = +e.target.value;
    document.getElementById(id + "-v").textContent = val.toFixed(c.f);
    if (c.v) root.style.setProperty(c.v, val);
    else {{
      root.style.setProperty("--ls", val + "em");
      root.style.setProperty("--ws", (val * 3.2).toFixed(3) + "em");
    }}
  }});
}}
</script>
</body></html>"""

OUT.write_text(HTML)
print("écrit:", OUT, f"({OUT.stat().st_size//1024} Ko)")
