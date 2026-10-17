#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build cong cu "so-dep.html" (1 file, tu chua anh nen -> chay offline).

Chay:  python3 build_tool.py
Muon doi anh nen: thay file bckground.png roi chay lai lenh tren.
"""
import base64, pathlib

BG = "bckground.png"
OUT = "so-dep.html"
PASSWORD = "ngotanthong"      # <-- doi mat khau o day

TEMPLATE = r"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Số đẹp VinaPhone - Điền nhanh</title>
<style>
  :root{ --sdt:#122342; --ck:#c0201a; }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;background:#eef2f7;color:#1b2735}
  #app{display:none;gap:20px;padding:20px;align-items:flex-start}
  body.open #app{display:flex}

  /* ---- man hinh mat khau ---- */
  #lock{position:fixed;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(160deg,#0a3c78,#1a6fd4 55%,#2ea3f2)}
  body.open #lock{display:none}
  #lock .box{background:#fff;border-radius:18px;padding:34px 32px;width:340px;text-align:center;
        box-shadow:0 20px 50px rgba(0,20,50,.4)}
  #lock .box .ic{font-size:40px;line-height:1}
  #lock .box h2{font-size:19px;margin:12px 0 4px;color:#0a3c78}
  #lock .box p.sub{font-size:12.5px;color:#6b7a8d;margin-bottom:18px}
  #lock .box input{width:100%;padding:12px 14px;border:1.5px solid #c7d4e4;border-radius:10px;
        font-size:15px;outline:none;text-align:center}
  #lock .box input:focus{border-color:#1a6fd4;box-shadow:0 0 0 3px #1a6fd422}
  #lock .box button{width:100%;margin-top:12px;padding:12px;border:0;border-radius:10px;
        background:#1a6fd4;color:#fff;font-size:15px;font-weight:700;cursor:pointer}
  #lock .box button:hover{filter:brightness(1.07)}
  #lock .err{color:#c0201a;font-size:12.5px;font-weight:700;margin-top:10px;min-height:16px}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
  .shake{animation:shake .28s}

  .panel{width:370px;flex:0 0 370px;background:#fff;border-radius:14px;padding:18px;
         box-shadow:0 6px 20px rgba(20,50,90,.12);position:sticky;top:20px}
  .panel h1{font-size:18px;margin-bottom:6px}
  .panel p.hint{font-size:12.5px;color:#5b6b7f;margin-bottom:12px;line-height:1.5}
  .panel p.hint code{background:#eef4ff;border:1px solid #d5e2f7;border-radius:5px;
       padding:1px 6px;font:12px "Courier New",monospace;color:#12437f;font-weight:700}
  textarea{width:100%;height:250px;border:1.5px solid #c7d4e4;border-radius:10px;
           padding:10px;font:13px/1.55 "Courier New",monospace;resize:vertical;outline:none}
  textarea:focus{border-color:#1a6fd4;box-shadow:0 0 0 3px #1a6fd422}
  .row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
  button{flex:1;min-width:110px;padding:11px 12px;border:0;border-radius:9px;
         font-size:14px;font-weight:700;cursor:pointer;background:#1a6fd4;color:#fff}
  button.ghost{background:#e8effa;color:#1a4f9c}
  button:hover{filter:brightness(1.06)}
  .opts{display:flex;gap:14px;margin-top:14px;flex-wrap:wrap;align-items:center;font-size:12.5px}
  .opts label{display:flex;align-items:center;gap:6px;color:#5b6b7f;font-weight:700}
  input[type=color]{width:36px;height:28px;border:1px solid #c7d4e4;border-radius:6px;background:#fff;padding:2px}
  input[type=number]{width:62px;border:1.5px solid #c7d4e4;border-radius:8px;padding:6px;font-size:13px}
  input[type=file]{margin-top:10px;font-size:12px;width:100%}
  #restore{display:none;margin-top:9px;font-size:12px;color:#1a6fd4;cursor:pointer;
           text-decoration:underline;font-weight:700}
  #restore.show{display:inline-block}
  .count{margin-top:12px;font-size:12.5px;color:#1a4f9c;font-weight:700}
  .stage{flex:1;min-width:0;container-type:inline-size}
  .poster{position:relative;width:100%;aspect-ratio:1448/1086;background:#fff;
          box-shadow:0 10px 30px rgba(10,40,80,.28);border-radius:6px;overflow:hidden;
          --fs:31}
  .poster img{position:absolute;inset:0;width:100%;height:100%;display:block}
  .cell{position:absolute;transform:translate(-50%,-50%);white-space:nowrap;
        font-weight:bold;font-family:Arial,Helvetica,sans-serif;line-height:1;
        font-size:calc(var(--fs) * 0.06906cqw)}
  .cell.sdt{color:var(--sdt)}
  .cell.ck{color:var(--ck)}
  @media print{
    @page{size:1448px 1086px;margin:0}
    body{background:#fff}
    #lock{display:none}
    body.open #app{display:block;padding:0}
    .panel{display:none}
    .stage{width:1448px}
    .poster{box-shadow:none;border-radius:0}
  }
</style>
</head>
<body>
  <div id="lock">
    <form class="box" id="lockForm" autocomplete="off">
      <div class="ic">&#128274;</div>
      <h2>Nh&#7853;p m&#7853;t kh&#7849;u</h2>
      <p class="sub">C&ocirc;ng c&#7909; &#273;i&#7873;n poster S&#7889; &#272;&#7864;P VinaPhone</p>
      <input type="password" id="pw" placeholder="M&#7853;t kh&#7849;u" autofocus>
      <button type="submit">M&#7903;</button>
      <div class="err" id="err"></div>
    </form>
  </div>

  <div id="app">
  <div class="panel">
    <h1>&#272;i&#7873;n s&#7889; v&agrave;o poster</h1>
    <p class="hint">D&aacute;n danh s&aacute;ch t&#7915; Excel / Google Sheets ho&#7863;c g&otilde; tay.
      M&#7895;i d&ograve;ng 1 s&#7889;, 2 c&#7897;t c&aacute;ch nhau b&#7857;ng Tab, v&iacute; d&#7909;:
      <br><code>0846 74 7979&#9;800k</code><br>
      N&#7897;i dung &#273;&#432;&#7907;c gi&#7919; <b>y nguy&ecirc;n</b> nh&#432; anh g&otilde;
      (d&#7845;u c&aacute;ch trong s&#7889;, ch&#7919; &ldquo;k&rdquo;, d&#7845;u ch&#7845;m...).
      C&oacute; th&#7875; th&ecirc;m c&#7897;t STT &#7903; &#273;&#7847;u c&#361;ng &#273;&#432;&#7907;c.</p>
    <textarea id="inp" spellcheck="false" placeholder=""></textarea>
    <input type="file" id="file" accept=".csv,.txt,.tsv">
    <div id="restore">&#8617; Kh&ocirc;i ph&#7909;c danh s&aacute;ch v&#7915;a nh&#7853;p</div>
    <div class="row">
      <button id="print">&#128424; In / L&#432;u PDF</button>
      <button id="png" class="ghost">&#11015; T&#7843;i PNG</button>
      <button id="clear" class="ghost">X&oacute;a</button>
    </div>
    <div class="opts">
      <label>M&agrave;u s&#7889;<input type="color" id="cSdt" value="#122342"></label>
      <label>M&agrave;u CK<input type="color" id="cCk" value="#c0201a"></label>
      <label>C&#7905; ch&#7919;<input type="number" id="fs" value="31" min="18" max="46"></label>
    </div>
    <div class="count" id="count">0 s&#7889;</div>
  </div>

  <div class="stage">
    <div class="poster" id="poster">
      <img id="bg" src="__BG__" alt="poster">
    </div>
  </div>
  </div><!-- /#app -->

<script>
const W = 1448, H = 1086;
const ROW_Y = [489.5,533.5,579,624,669,714,760,806,851.5,898.5];
const BLOCKS = [
  { xSdt:271,    xCk:451,    start:1  },
  { xSdt:727.5,  xCk:900,    start:11 },
  { xSdt:1178,   xCk:1351.5, start:21 }
];
let DATA = [];
const $ = id => document.getElementById(id);
const store = {
  get(){ try { return localStorage.getItem("sodep_list"); } catch(e){ return null; } },
  set(v){ try { localStorage.setItem("sodep_list", v); } catch(e){} }
};

/* Giu Y NGUYEN chu da go: khoang cach trong so, chu "k", dau cham... */
function parseList(text){
  const out = [];
  for (const raw of text.split(/\r?\n/)){
    const line = raw.replace(/\s+$/, "").trim();
    if (!line) continue;

    let parts;
    if (line.includes("\t"))      parts = line.split("\t");
    else if (line.includes(";"))  parts = line.split(";");
    else                          parts = splitSmart(line);
    parts = parts.map(s => s.trim()).filter(s => s !== "");
    if (!parts.length) continue;

    // bo cot STT o dau neu do la so nho (1..3 chu so)
    if (parts.length >= 3 && /^\d{1,3}$/.test(parts[0])) parts = parts.slice(1);

    const sdt = parts[0];
    const ck  = parts.length > 1 ? parts[parts.length - 1] : "";
    if (sdt.replace(/\D/g, "").length < 9) continue;   // khong phai so thue bao
    out.push([sdt, ck]);                                // luu nguyen van
  }
  return out;
}

/* Tach CK ra khoi chuoi chi co khoang trang: "0846 74 7979 800k" */
function splitSmart(line){
  const toks = line.split(/\s+/);
  if (toks.length < 2) return [line];
  const head = toks.slice(0, -1).join(" ");
  const last = toks[toks.length - 1];
  if (looksMoney(last) && head.replace(/\D/g, "").length >= 9) return [head, last];
  return [line];
}

function looksMoney(t){
  if (/^\d[\d.,]*$/.test(t)) return t.replace(/\D/g, "").length <= 8;
  return /[\d.,]+\s*(k|\u0111|tr)$/i.test(t) || /^(k|K|\u0111|\u20ab|tr)$/i.test(t);
}

function render(){
  const poster = $("poster");
  poster.querySelectorAll(".cell").forEach(e => e.remove());
  DATA.forEach((row, i) => {
    const stt = i + 1;
    if (stt > 30) return;
    const bi = stt <= 10 ? 0 : stt <= 20 ? 1 : 2;
    const b = BLOCKS[bi];
    const y = ROW_Y[stt - b.start];
    addCell(b.xSdt, y, row[0], "sdt");
    addCell(b.xCk,  y, row[1], "ck");
  });
  $("count").textContent = DATA.length + " s\u1ed1";
}

function addCell(x, y, txt, cls){
  const el = document.createElement("div");
  el.className = "cell " + cls;
  el.style.left = (x / W * 100) + "%";
  el.style.top  = (y / H * 100) + "%";
  el.textContent = txt;
  $("poster").appendChild(el);
}

function update(){
  const v = $("inp").value;
  DATA = parseList(v);
  render();
  if (v.trim() !== "") store.set(v);       // chi luu khi co du lieu
}

/* ---- options ---- */
$("cSdt").addEventListener("input", e => document.documentElement.style.setProperty("--sdt", e.target.value));
$("cCk").addEventListener("input",  e => document.documentElement.style.setProperty("--ck",  e.target.value));
$("fs").addEventListener("input",   e => $("poster").style.setProperty("--fs", e.target.value || 31));
$("inp").addEventListener("input", update);
$("clear").addEventListener("click", () => { $("inp").value = ""; update(); $("inp").focus(); });
$("file").addEventListener("change", e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => { $("inp").value = rd.result; update(); };
  rd.readAsText(f, "utf-8");
});
$("print").addEventListener("click", () => window.print());

$("png").addEventListener("click", async () => {
  const img = $("bg");
  try { await img.decode(); } catch(e) {}
  const s = 2;
  const c = document.createElement("canvas");
  c.width = W * s; c.height = H * s;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const fs = (+$("fs").value || 31) * s;
  ctx.font = "bold " + fs + "px Arial";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const cSdt = getComputedStyle(document.documentElement).getPropertyValue("--sdt").trim();
  const cCk  = getComputedStyle(document.documentElement).getPropertyValue("--ck").trim();
  DATA.forEach((row, i) => {
    const stt = i + 1; if (stt > 30) return;
    const bi = stt <= 10 ? 0 : stt <= 20 ? 1 : 2;
    const b = BLOCKS[bi];
    const y = ROW_Y[stt - b.start] * s;
    ctx.fillStyle = cSdt; ctx.fillText(row[0], b.xSdt * s, y);
    ctx.fillStyle = cCk;  ctx.fillText(row[1], b.xCk  * s, y);
  });
  const a = document.createElement("a");
  a.href = c.toDataURL("image/png");
  a.download = "so-dep-vinaphone.png";
  a.click();
});

/* ---- man hinh mat khau ---- */
$("lockForm").addEventListener("submit", e => {
  e.preventDefault();
  let ok = false;
  try { ok = btoa($("pw").value) === "__PW__"; } catch(err) { ok = false; }
  if (ok){
    document.body.classList.add("open");
    setTimeout(() => $("inp").focus(), 50);
  } else {
    $("err").textContent = "M\u1eadt kh\u1ea9u kh\u00f4ng \u0111\u00fang";
    $("pw").value = "";
    const b = document.querySelector("#lock .box");
    b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
  }
});

/* ---- init: o nhap mac dinh TRONG ---- */
$("inp").placeholder = "0846 74 7979\t800k\n0822 88 8085\t150k";
$("inp").value = "";
update();
if (store.get()) $("restore").classList.add("show");

$("restore").addEventListener("click", () => {
  const v = store.get();
  if (v){ $("inp").value = v; update(); $("restore").classList.remove("show"); }
});
</script>
</body>
</html>
"""


def main():
    import html as _html, re
    data = base64.b64encode(pathlib.Path(BG).read_bytes()).decode()
    pw   = base64.b64encode(PASSWORD.encode()).decode()
    html = (TEMPLATE
            .replace("__BG__", "data:image/png;base64," + data)
            .replace("__PW__", pw))
    # Giai ma HTML entity + \uXXXX de file de doc/chinh sua bang tieng Viet
    html = _html.unescape(html)
    html = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), html)
    pathlib.Path(OUT).write_text(html, encoding="utf-8")
    print(f"da tao {OUT}  ({len(html)/1e6:.1f} MB, 1 file duy nhat)  |  mat khau: {PASSWORD}")


if __name__ == "__main__":
    main()
