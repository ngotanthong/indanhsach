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
  us.appendRow(["username", "password", "ten"]);
  us.appendRow(["ngotanthong", "ngotanthong", "ngotanthong"]);

  let ns = ss.getSheetByName(NUMBERS_SHEET);
  if (!ns) ns = ss.insertSheet(NUMBERS_SHEET);
  ns.clear();
  ns.appendRow(["username", "sdt", "ck_goc", "ck_moi", "trang_thai"]);
  SpreadsheetApp.flush();
}

function doPost(e) {
  let data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) {}
  const action = data.action;
  if (action === "login") return jsonOut(login(data.username, data.password));
  if (action === "list") return jsonOut(listNumbers(data.username));
  if (action === "save") return jsonOut(saveNumbers(data.username, data.rows));
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
  return jsonOut({ ok: true, msg: "running" });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function login(username, password) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(USERS_SHEET);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(username).trim() &&
        String(rows[i][1]) === String(password)) {
      return { ok: true, ten: rows[i][2] || username };
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
    sh.getRange(start, 1, toAppend.length, 5).setValues(toAppend);
  }
  return { ok: true };
}
```<|end|><|start|>write to=assistant<|channel|>analysis<|message|>Now update README to reflect new features and setup. Let me update README.<|end|><|start|><|start|>assistant to=write<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
/Users/ngotanthong/Dự án VibeCode/PrintList/README.md