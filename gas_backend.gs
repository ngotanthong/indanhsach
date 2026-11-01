// Google Apps Script backend cho tool "Số đẹp VinaPhone"
// Huong dan:
// 1. Mo Google Sheet: https://docs.google.com/spreadsheets/d/16X92ss43OtOJTK9IqhjnzEnesgvWuawdha63_ogNzvw
// 2. Extensions -> Apps Script, dan toan bo file nay vao, luu.
// 3. Chay ham setup() 1 lan de tao sheet "Users" va "Numbers" + user demo ngotanthong.
// 4. Deploy -> New deployment -> Web app -> Execute as: Me, Who has access: Anyone -> Deploy.
// 5. Copy URL (dang https://script.google.com/macros/s/.../exec) dan vao API_URL trong index.html.

const SHEET_ID = "16X92ss43OtOJTK9IqhjnzEnesgvWuawdha63_ogNzvw";
const USERS_SHEET = "Users";
const NUMBERS_SHEET = "Numbers";

function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let us = ss.getSheetByName(USERS_SHEET);
  if (!us) us = ss.insertSheet(USERS_SHEET);
  us.clear();
  us.appendRow(["username", "password", "ten", "limit_list", "limit_check", "checks_today", "last_check_date", "expiry_date"]);
  us.appendRow(["ngotanthong", "ngotanthong", "ngotanthong", 3, "không giới hạn", 0, "", ""]);

  let ns = ss.getSheetByName(NUMBERS_SHEET);
  if (!ns) ns = ss.insertSheet(NUMBERS_SHEET);
  ns.clear();
  ns.appendRow(["username", "sdt", "ck_goc", "ck_moi", "trang_thai"]);
  // luu sdt/ck dang text de giu so 0 dau va khoang cach ngat nhi
  ns.getRange(1, 2, ns.getMaxRows(), 4).setNumberFormat("@");
  SpreadsheetApp.flush();
}

function doPost(e) {
  let data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) {}
  const action = data.action;
  if (action === "login") return jsonOut(login(data.username, data.password));
  if (action === "list") return jsonOut(listNumbers(data.username));
  if (action === "save") return jsonOut(saveNumbers(data.username, data.rows));
  if (action === "check") return jsonOut(checkNumber(data.phone, data.ck));
  if (action === "register") return jsonOut(registerUser(data.username, data.password, data.ten));
  if (action === "beginCheck") return jsonOut(beginCheck(data.username));
  if (action === "updateLimits") return jsonOut(updateLimits(data.username, data.limit_list, data.limit_check));
  if (action === "updateExpiry") return jsonOut(updateExpiry(data.username, data.expiry));
  return jsonOut({ ok: false, error: "unknown action" });
}

function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const action = p.action;
  if (action === "login") return jsonOut(login(p.username, p.password));
  if (action === "list") return jsonOut(listNumbers(p.username));
  if (action === "save") {
    let rows = [];
    try { rows = JSON.parse(p.data || "[]"); } catch (err) {}
    return jsonOut(saveNumbers(p.username, rows));
  }
  if (action === "check") return jsonOut(checkNumber(p.phone, p.ck));
  if (action === "register") return jsonOut(registerUser(p.username, p.password, p.ten));
  if (action === "beginCheck") return jsonOut(beginCheck(p.username));
  if (action === "updateLimits") return jsonOut(updateLimits(p.username, p.limit_list, p.limit_check));
  if (action === "updateExpiry") return jsonOut(updateExpiry(p.username, p.expiry));
  return jsonOut({ ok: true, msg: "running" });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function padUser(row) {
  const r = row.slice();
  while (r.length < 8) r.push("");
  if (r[3] === "" || r[3] == null) r[3] = 3;
  if (r[4] === "" || r[4] == null) r[4] = 10;
  if (r[5] === "" || r[5] == null) r[5] = 0;
  if (r[6] == null) r[6] = "";
  if (r[7] == null) r[7] = "";
  return r;
}

function login(username, password) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const r = padUser(rows[i]);
    if (String(r[0]).trim() === String(username).trim() &&
        String(r[1]) === String(password)) {
      // kiem tra han su dung
      const exp = String(r[7] || "").trim();
      if (exp) {
        const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
        if (today > exp) return { ok: false, error: "expired", expiry: exp };
      }
      return { ok: true, ten: r[2] || username,
        limit_list: r[3], limit_check: r[4],
        checks_today: r[5], last_check_date: r[6], expiry: r[7] };
    }
  }
  return { ok: false };
}

function listNumbers(username) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(NUMBERS_SHEET);
  const rows = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(username).trim()) {
      out.push([rows[i][1], rows[i][2], rows[i][3], rows[i][4]]);
    }
  }
  return { ok: true, rows: out };
}

function saveNumbers(username, rows) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(NUMBERS_SHEET);
  const data = sh.getDataRange().getValues();
  // giu lai cac hang khong thuoc user nay
  const keep = [data[0]];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() !== String(username).trim()) keep.push(data[i]);
  }
  sh.clear();
  if (keep.length) sh.getRange(1, 1, keep.length, keep[0].length).setValues(keep);
  if (rows && rows.length) {
    const toAppend = rows.map(r => [username, r[0], r[1] || "", r[2] || "", r[3] || ""]);
    const start = sh.getLastRow() + 1;
    const rng = sh.getRange(start, 1, toAppend.length, 5);
    rng.setNumberFormat("@");
    rng.setValues(toAppend);
  }
  return { ok: true };
}

// Chuyen CK (text) thanh bucket commit (VND/thang) gan nhat
function commitBucket(ck) {
  const BUCKETS = [0, 100000, 150000, 200000, 400000, 600000, 800000];
  // parse so tien tu chuoi: "800k" -> 800000, "1tr" -> 1000000, "150000" -> 150000
  let n = 0;
  const s = String(ck || "").toLowerCase().replace(/\s/g, "");
  const m = s.match(/([\d.,]+)/);
  if (m) {
    let val = parseFloat(m[1].replace(/\./g, "").replace(/,/g, "."));
    if (/tr/.test(s)) val *= 1000000;
    else if (/k/.test(s)) val *= 1000;
    n = Math.round(val);
  }
  // chon bucket gan nhat (khong vuot qua)
  let best = 0;
  for (let i = 0; i < BUCKETS.length; i++) {
    if (n >= BUCKETS[i]) best = BUCKETS[i];
    else break;
  }
  return best;
}

function checkNumber(phone, ck) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 9) return { ok: false, error: "invalid phone" };

  // prefix = 84 + 2 so sau so 0
  let prefix = "";
  if (digits.startsWith("0")) prefix = "84" + digits.substring(1, 3);
  else if (digits.startsWith("84")) prefix = digits.substring(0, 4);
  else prefix = "84" + digits.substring(0, 2);

  const search = digits.slice(-7);
  const bucket = commitBucket(ck);
  const bucketsToTry = [0];
  if (bucket !== 0 && bucketsToTry.indexOf(bucket) === -1) bucketsToTry.push(bucket);

  const target = digits.startsWith("0") ? ("84" + digits.substring(1)) : digits;

  for (let b = 0; b < bucketsToTry.length; b++) {
    const commit = bucketsToTry[b];
    const url = "https://digishop.vnpt.vn/apiprod/v2/simso/num_search?search=" +
      encodeURIComponent(search) + "&prefix=" + encodeURIComponent(prefix) + "&commit=" + commit;
    try {
      const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      const json = JSON.parse(resp.getContentText());
      const data = (json && json.data) ? json.data : [];
      const found = data.some(function (d) {
        return String(d.so_tb) === target;
      });
      if (found) return { ok: true, available: true, bucket: commit };
    } catch (e) {}
  }
  return { ok: true, available: false, bucket: bucket };
}

function registerUser(username, password, ten) {
  username = String(username || "").trim();
  password = String(password || "");
  if (!username || !password) return { ok: false, error: "missing" };
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === username) return { ok: false, error: "exists" };
  }
  const exp = Utilities.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Session.getScriptTimeZone(), "yyyy-MM-dd");
  sh.appendRow([username, password, ten || username, 3, 10, 0, "", exp]);
  return { ok: true, ten: ten || username, limit_list: 3, limit_check: 10, expiry: exp };
}

function beginCheck(username) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  for (let i = 1; i < rows.length; i++) {
    const r = padUser(rows[i]);
    if (String(r[0]).trim() === String(username).trim()) {
      const limit = r[4];
      const unlimited = String(limit).toLowerCase().indexOf("không") !== -1 || String(limit).toLowerCase() === "unlimited" || String(limit).toLowerCase() === "inf";
      let checks = r[5] || 0;
      let lastDate = r[6] || "";
      if (lastDate !== today) { checks = 0; lastDate = today; }
      if (!unlimited) {
        const lim = parseInt(limit, 10);
        if (!isNaN(lim) && checks >= lim) {
          // save reset date
          sh.getRange(i + 1, 6, 1, 2).setValues([[checks, lastDate]]);
          return { ok: true, allowed: false, remaining: 0, limit: limit, checks_today: checks };
        }
        checks = checks + 1;
      }
      sh.getRange(i + 1, 6, 1, 2).setValues([[checks, lastDate]]);
      return { ok: true, allowed: true, remaining: unlimited ? "không giới hạn" : (parseInt(limit,10) - checks), limit: limit, checks_today: checks };
    }
  }
  return { ok: false, error: "user not found" };
}

function updateLimits(username, limit_list, limit_check) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(username).trim()) {
      // limit_list
      let ll = limit_list;
      if (ll === "" || ll == null) ll = 3;
      const llNum = parseInt(ll, 10);
      if (!isNaN(llNum)) ll = llNum;
      let lc = limit_check;
      if (lc === "" || lc == null) lc = 10;
      sh.getRange(i + 1, 4, 1, 2).setValues([[ll, lc]]);
      return { ok: true, limit_list: ll, limit_check: lc };
    }
  }
  return { ok: false, error: "user not found" };
}

function updateExpiry(username, expiry) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(username).trim()) {
      sh.getRange(i + 1, 8).setValue(expiry || "");
      return { ok: true, expiry: expiry || "" };
    }
  }
  return { ok: false, error: "user not found" };
}
```<|end|><|start|>write to=assistant<|channel|>analysis<|message|>Now update README to reflect new features and setup. Let me update README.<|end|><|start|><|start|>assistant to=write<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
/Users/ngotanthong/Dự án VibeCode/PrintList/README.md