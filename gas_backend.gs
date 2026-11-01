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
  us.appendRow(["username", "password", "ten", "limit_list", "limit_check", "checks_today", "last_check_date", "expiry_date", "checked_today"]);
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
  if (action === "register") return jsonOut(registerUser(data.username, data.password, data.ten, data.ref));
  if (action === "referrers") return jsonOut(listReferrers());
  if (action === "beginCheck") return jsonOut(beginCheck(data.username, data.nums));
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
  if (action === "register") return jsonOut(registerUser(p.username, p.password, p.ten, p.ref));
  if (action === "referrers") return jsonOut(listReferrers());
  if (action === "beginCheck") return jsonOut(beginCheck(p.username, p.nums));
  return jsonOut({ ok: true, msg: "running" });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

const MONTHS = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
};

// Kiem tra ngay co ton tai that (vd: 31/02 la sai)
function validYMD(y, mo, d) {
  y = parseInt(y, 10); mo = parseInt(mo, 10); d = parseInt(d, 10);
  if (!y || !mo || !d) return "";
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== (mo - 1) || dt.getDate() !== d) return "";
  return y + "-" + ("0" + mo).slice(-2) + "-" + ("0" + d).slice(-2);
}

// Chuan hoa moi dinh dang ngay ve yyyy-MM-dd (ho tro ca Date object)
function normDate(v) {
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return "";
    return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  let s = String(v == null ? "" : v).trim();
  if (!s) return "";

  // "Sat Oct 31 2026 00:00:00 GMT+0700 (Gio Dong Duong)" (Date.toString cua JS)
  let m = s.match(/^[A-Za-z]{3}\s+([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})/);
  if (m) {
    const mon = MONTHS[String(m[1]).toLowerCase()];
    if (mon) return validYMD(m[3], mon, m[2]);
  }
  // "Sat, 31 Oct 2026 ..." (kieu RFC)
  m = s.match(/^[A-Za-z]{3},?\s+(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (m) {
    const mon = MONTHS[String(m[2]).toLowerCase()];
    if (mon) return validYMD(m[3], mon, m[1]);
  }
  // yyyy-MM-dd / yyyy/MM/dd / yyyy.MM.dd
  m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if (m) return validYMD(m[1], m[2], m[3]);
  // dd-MM-yyyy / dd/MM/yyyy / dd.MM.yyyy
  m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
  if (m) return validYMD(m[3], m[2], m[1]);

  // Fallback: de JS tu parse (vd chuoi ISO 2026-10-31T00:00:00.000Z)
  const d = new Date(s);
  if (!isNaN(d.getTime())) return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return "";
}

function toDMY(iso) {
  const s = String(iso || "");
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s;
  return m[3] + "/" + m[2] + "/" + m[1];
}

function padUser(row) {
  const r = row.slice();
  while (r.length < 9) r.push("");
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
      // kiem tra han su dung (Date object, dd/MM/yyyy, Sat Oct 31 2026..., ...)
      const exp = normDate(r[7]);
      if (exp) {
        const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
        if (today > exp) return { ok: false, error: "expired", expiry: toDMY(exp), expiry_iso: exp };
      }
      return { ok: true, ten: r[2] || username,
        limit_list: r[3], limit_check: r[4],
        checks_today: r[5], last_check_date: r[6],
        expiry: toDMY(exp), expiry_iso: exp };
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

function pad2(n) { return ("0" + n).slice(-2); }

// Cong n ngay vao ngay yyyy-MM-dd (tinh theo UTC de khong lech mui gio)
function addDaysISO(iso, n) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const d = new Date(Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
  d.setUTCDate(d.getUTCDate() + n);
  return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate());
}

function todayISO() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

// Tim dong user theo username hoac ten (khong phan biet hoa thuong)
function findUserIndex(rows, key) {
  key = String(key || "").trim().toLowerCase();
  if (!key) return -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toLowerCase() === key) return i;
  }
  for (let i = 1; i < rows.length; i++) {
    if (String(padUser(rows[i])[2]).trim().toLowerCase() === key) return i;
  }
  return -1;
}

// Danh sach nguoi gioi thieu (lay tu cot ten) de do vao o chon
function listReferrers() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = padUser(rows[i]);
    const un = String(r[0]).trim();
    if (!un) continue;
    const ten = String(r[2]).trim() || un;
    out.push({ username: un, ten: ten });
  }
  out.sort(function (a, b) { return a.ten.localeCompare(b.ten, "vi"); });
  return { ok: true, version: 2, users: out };
}

function registerUser(username, password, ten, ref) {
  username = String(username || "").trim();
  password = String(password || "");
  ref = String(ref || "").trim();
  if (!username || !password) return { ok: false, error: "missing" };
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === username) return { ok: false, error: "exists" };
  }

  const today = todayISO();
  const refIdx = findUserIndex(rows, ref);
  const hasRef = refIdx !== -1;
  const days = hasRef ? 30 : 3;
  const limitList = hasRef ? 10 : 3;
  const limitCheck = 10;
  const exp = addDaysISO(today, days);

  sh.appendRow([username, password, ten || username, limitList, limitCheck, 0, "", exp]);

  // Cong 30 ngay cho nguoi gioi thieu
  let refInfo = { ok: false };
  if (hasRef) {
    const rr = padUser(rows[refIdx]);
    const refTen = String(rr[2]).trim() || String(rr[0]).trim();
    const refExp = normDate(rr[7]);
    if (!refExp) {
      // nguoi gioi thieu khong gioi han ngay -> giu nguyen
      refInfo = { ok: true, ten: refTen, unlimited: true, expiry: "" };
    } else {
      const base = refExp > today ? refExp : today;
      const newExp = addDaysISO(base, 30);
      sh.getRange(refIdx + 1, 8).setValue(newExp);
      refInfo = { ok: true, ten: refTen, unlimited: false, expiry: toDMY(newExp), expiry_iso: newExp, added_days: 30 };
    }
  }

  return { ok: true, version: 2, ten: ten || username, limit_list: limitList, limit_check: limitCheck,
    expiry: toDMY(exp), expiry_iso: exp, days: days,
    referrer: refInfo };
}

// Chuan hoa o ngay (co the la Date object hoac chuoi) ve yyyy-MM-dd
function dayString(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const s = String(v == null ? "" : v).trim();
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[1] + "-" + m[2] + "-" + m[3] : s;
}

function beginCheck(username, numsRaw) {
  // numsRaw: JSON array cac so can check (giu nguyen chuoi goc)
  let nums = [];
  try { nums = JSON.parse(numsRaw || "[]"); } catch (e) { nums = []; }
  if (!Array.isArray(nums)) nums = [];
  nums = nums.map(function (x) { return String(x == null ? "" : x); });

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  for (let i = 1; i < rows.length; i++) {
    const r = padUser(rows[i]);
    if (String(r[0]).trim() !== String(username).trim()) continue;

    const exp = normDate(r[7]);
    if (exp && today > exp) return { ok: false, error: "expired", expiry: toDMY(exp), expiry_iso: exp };

    // Khoa so dien thoai de so sanh (9 so cuoi, bo 84/0 dau)
    const key = function (s) {
      const d = String(s || "").replace(/\D/g, "");
      return d.length > 9 ? d.slice(-9) : d;
    };

    // Doc danh sach so da check trong ngay tu cot I, vd: "2026-11-01|0901234567,0902345678"
    let stored = String(r[8] == null ? "" : r[8]);
    if (stored === "[object Object]") stored = "";
    const bar = stored.indexOf("|");
    let checkedDate = bar >= 0 ? stored.slice(0, bar) : "";
    let checkedList = bar >= 0 ? stored.slice(bar + 1).split(",").filter(Boolean) : [];
    if (checkedDate !== today) { checkedDate = today; checkedList = []; }

    const seen = {};
    checkedList.forEach(function (x) { seen[key(x)] = true; });

    const already = [];   // so da check hom nay -> check lai mien phi
    const fresh = [];     // so moi trong ngay
    const freshKeys = {};
    nums.forEach(function (n) {
      const k = key(n);
      if (!k) return;
      if (seen[k]) { already.push(n); return; }
      if (freshKeys[k]) return;
      freshKeys[k] = true;
      fresh.push(n);
    });

    const limit = r[4];
    const unlimited = String(limit).toLowerCase().indexOf("không") !== -1 ||
      String(limit).toLowerCase() === "unlimited" || String(limit).toLowerCase() === "inf";
    const lim = parseInt(limit, 10);

    let allowedFresh;
    let remaining;
    if (unlimited || isNaN(lim)) {
      allowedFresh = fresh;
      remaining = "không giới hạn";
    } else {
      const left = Math.max(0, lim - checkedList.length);
      allowedFresh = fresh.slice(0, left);
      remaining = Math.max(0, left - allowedFresh.length);
    }

    // Ghi lai danh sach so da check
    const newKeys = {};
    checkedList.forEach(function (x) { newKeys[key(x)] = true; });
    allowedFresh.forEach(function (n) {
      const k = key(n);
      if (!newKeys[k]) { newKeys[k] = true; checkedList.push(k); }
    });

    // Dam bao cot I co header
    if (!sh.getRange(1, 9).getValue()) {
      try { sh.getRange(1, 9).setValue("checked_today"); } catch (e) {}
    }
    sh.getRange(i + 1, 6, 1, 2).setValues([[checkedList.length, today]]);
    sh.getRange(i + 1, 9).setValue(today + "|" + checkedList.join(","));

    const allowedNumbers = already.concat(allowedFresh);
    const denied = fresh.slice(allowedFresh.length);
    return {
      ok: true,
      allowed: allowedNumbers.length > 0,
      allowed_count: allowedFresh.length,
      allowed_numbers: allowedNumbers,
      denied_numbers: denied,
      free_count: already.length,
      remaining: remaining,
      limit: limit,
      checks_today: checkedList.length
    };
  }
  return { ok: false, error: "user not found" };
}
