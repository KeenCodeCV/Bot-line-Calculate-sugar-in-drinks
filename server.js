// server.js — LINE Sugar Bot (Google Sheets backend, TEMP URL proxy + full URL + displayName + 600ml baseline per menu)
import "dotenv/config";
import express from "express";
import * as line from "@line/bot-sdk";
import cron from "node-cron";
import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc.js";
import tz from "dayjs/plugin/timezone.js";
import { google } from "googleapis";

const dayjs = dayjsBase;
dayjs.extend(utc);
dayjs.extend(tz);

// ---------- Config ----------
const TZ = "Asia/Bangkok";
const PORT = process.env.PORT || 3000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");

// >>> Rich Menu
const RICH_MENU_ID = process.env.RICH_MENU_ID || "";
const RICH_MENU_DEFAULT = process.env.RICH_MENU_DEFAULT === "1";

// LINE
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new line.Client(config);

// Google Auth
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// ---------- App ----------
const app = express();

// ---------- Quick Reply ----------
const QUICK_REPLY = {
  items: [
    { type: "action", action: { type: "message", label: "📖 สอนใช้งาน", text: "สอนใช้งาน" } },
    { type: "action", action: { type: "message", label: "📊 สรุปวันนี้", text: "สรุปวันนี้" } },
    { type: "action", action: { type: "message", label: "🥤 รายการเครื่องดื่ม", text: "รายการเครื่องดื่ม" } },
    { type: "action", action: { type: "message", label: "🚫 ไม่ได้รับประทาน", text: "ไม่ได้รับประทานในมื้อนี้" } },
    { type: "action", action: { type: "message", label: "🔄 รีเซ็ตวันนี้", text: "รีเซ็ตวันนี้" } },
    { type: "action", action: { type: "message", label: "🔕 หยุดเตือน", text: "หยุดเตือน" } },
    { type: "action", action: { type: "message", label: "🔔 เปิดเตือน", text: "เปิดเตือน" } },
  ],
};
const withQR = (message) => ({ ...message, quickReply: QUICK_REPLY });

/**
 * ---------- Drink Table ----------
 * ค่าช้อนชา "ต่อ 600 ml" ของแต่ละเมนู (min=max)
 */
const DRINKS = {
  "ชาเขียว": [11, 11],
  "มัชฉะ": [0, 0], "มัทฉะ": [0, 0], "มัจฉะ": [0, 0],
  "น้ำผลไม้ปั่น": [15, 15],
  "ลาเต้": [3, 3],
  "เอสเปซโซ่": [0, 0], "เอสเปรสโซ่": [0, 0],
  "กาแฟดำ": [0, 0], "อเมริกาโน่": [0, 0],
  "มอคค่า": [6, 6],
  "น้ำเลม่อน": [4, 4],
  "แดงมะนาวโซดา": [5, 5],
  "แดงโซดา": [5, 5],
  "นมเปรี้ยวปีโป้ปั่น": [10, 10],
  "โอริโอ้นมสดปั่น": [11, 11],
  "ชาเขียวมะนาว": [6, 6],
  "น้ำบ๊วย": [6, 6],
  "ชานมไข่มุก": [10, 10],
  "นมเปรี้ยว": [4, 4],
  "นมโอวัลติน": [6, 6],
  "นมไมโล": [6, 6],
  "น้ำเฉาก๊วย": [5, 5],
  "นมชมพู": [9, 9],
  "นมถั่วเหลือง": [3, 3],
  "ช็อกมิ้นต์": [9, 9],
  "ชาเงาะ": [5, 5],
  "นมสดกล้วยหอม": [8, 8],
  "มะพร้าวนมสด": [6, 6],
  "เครื่องดื่มชูกำลัง": [6, 6],
  "เครื่องดื่มผสมเกลือแร่": [6, 6],
  "ช็อกโกแลต": [8, 8],
  "น้ำผลไม้โซดา": [6, 6],
  "โกโก้": [8, 8],
  "น้ำมะพร้าว": [2, 2],
  "ชามะนาว": [6, 6],
  "ชาเขียวใส": [0, 0],
  "นมโปรตีน": [1, 1],
  "ชาเขียวโออิชิ": [8, 8],
  "นมสดสตอเบอร์รี่": [5, 5],
  "เบียร์": [2.5, 2.5],
  "ไวน์": [1, 1],
  "เหล้า": [0, 0],
  "วิสกี้": [0, 0],
  "น้ำผสมวิตามิน": [7, 7],
  "น้ำกระเจี๊ยบ": [5, 5],
  "น้ำเก๊กฮวย": [5, 5],
  "โอเลี้ยง": [5, 5],
  "น้ำสมุนไพร": [4, 4],
  "นมข้าวโพด": [4, 4],
  "น้ำใบเตย": [4, 4],
  "น้ำลำไย": [5.5, 5.5],
  "นํ้าอัดลม": [11, 11], "น้ำอัดลม": [11, 11],
  "ชาเย็น": [3, 3],
  "แตงโมปั่น": [8, 8],
  "น้ำเปล่า": [0, 0],

};
const DRINK_KEYS = Object.keys(DRINKS).sort((a, b) => b.length - a.length);

// ---------- Helpers ----------
const now = () => dayjs().tz(TZ);
const today = () => now().format("YYYY-MM-DD");
function periodByHour(h) {
  if (h >= 6 && h < 12) return "เช้า";
  if (h >= 12 && h < 15) return "เที่ยง";
  if (h >= 15 && h <= 19) return "เย็น";
  if (h >= 19 && h <= 24) return "ค่ำ";
  return "อื่นๆ";
}

// จำนวนแก้ว: นับเฉพาะ "…แก้ว" หรือ "x2/x1.5" เท่านั้น
// เลขที่ตามด้วยหน่วยปริมาตรจะไม่ถูกนับเป็นจำนวนแก้ว
function parseQty(text) {
  const m1 = text.match(/(\d+(?:\.\d+)?)\s*แก้ว/);
  if (m1) return Math.max(0.1, parseFloat(m1[1]));

  const m2 = text.match(/x\s*(\d+(?:\.\d+)?)/i);
  if (m2) return Math.max(0.1, parseFloat(m2[1]));

  // ❗ ตัดแผนสำรองที่เคยจับ "เลขลอย ๆ" ออกเพื่อไม่ให้ 300ml กลายเป็น 300 แก้ว
  return 1;
}

// ปริมาตรเป็น ml (รองรับ ml/มล/ลิตร/L)
function parseMl(text) {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(ml|มล|มิลลิ|มิลลิลิตร|ลิตร|liter|litre|l)\b/i);
  if (!m) return null;
  const val = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (["ลิตร","liter","litre","l"].includes(unit)) return val * 1000;
  return val; // ml
}

function findDrink(text) {
  const t = text.replace(/\s+/g, "").toLowerCase();
  for (const key of DRINK_KEYS) {
    const k = key.replace(/\s+/g, "").toLowerCase();
    if (t.includes(k)) return key;
  }
  return null;
}
function fmtRange(min, max) {
  return min === max ? `${trim0(min)} ช้อนชา` : `${trim0(min)}–${trim0(max)} ช้อนชา`;
}
function trim0(n) {
  return Number.isInteger(n) ? `${n}` : `${parseFloat(n.toFixed(1))}`;
}

// ---------- Sheets ----------
const SHEET_USERS = "Users";
const SHEET_ENTRIES = "Entries";
const SHEET_PHOTOS = "Photos"; // user | date | period | mimeType | messageId | full_url | created_at

async function initSheets() {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const titles = meta.data.sheets.map(s => s.properties.title);

  const requests = [];
  if (!titles.includes(SHEET_USERS)) requests.push({ addSheet: { properties: { title: SHEET_USERS } } });
  if (!titles.includes(SHEET_ENTRIES)) requests.push({ addSheet: { properties: { title: SHEET_ENTRIES } } });
  if (!titles.includes(SHEET_PHOTOS)) requests.push({ addSheet: { properties: { title: SHEET_PHOTOS } } });
  if (requests.length) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: SPREADSHEET_ID, requestBody: { requests } });
  }

  const [usersVals, entriesVals, photosVals] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_USERS}!A1:E1` }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_ENTRIES}!A1:H1` }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_PHOTOS}!A1:G1` }),
  ]);

  if (!usersVals.data.values || usersVals.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID, range: `${SHEET_USERS}!A1:E1`, valueInputOption: "RAW",
      requestBody: { values: [["userId", "daily_limit", "reminders_enabled", "created_at", "updated_at"]] }
    });
  }
  if (!entriesVals.data.values || entriesVals.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID, range: `${SHEET_ENTRIES}!A1:H1`, valueInputOption: "RAW",
      requestBody: { values: [["userId","date","period","beverage","tsp_min","tsp_max","qty","created_at"]] }
    });
  }
  if (!photosVals.data.values || photosVals.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID, range: `${SHEET_PHOTOS}!A1:G1`, valueInputOption: "RAW",
      requestBody: { values: [[ "user","date","period","mimeType","messageId","full_url","created_at" ]] }
    });
  }
}

// ---------- Sheets helpers ----------
async function readRange(rangeA1) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: rangeA1 });
  return res.data.values || [];
}
async function appendRange(rangeA1, rows) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID, range: rangeA1,
    valueInputOption: "RAW", insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows }
  });
}
async function updateRange(rangeA1, rows) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID, range: rangeA1,
    valueInputOption: "RAW", requestBody: { values: rows }
  });
}
async function deleteRowsByIndices(sheetTitle, rowIndicesAsc) {
  if (!rowIndicesAsc.length) return;
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets.find(s => s.properties.title === sheetTitle);
  const sheetId = sheet.properties.sheetId;
  const requests = rowIndicesAsc.sort((a, b) => b - a).map(r => ({
    deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: r - 1, endIndex: r } }
  }));
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: SPREADSHEET_ID, requestBody: { requests } });
}

// ---------- Domain logic on Sheets ----------
async function ensureUser(userId) {
  const rows = await readRange(`${SHEET_USERS}!A2:E`);
  const idx = rows.findIndex(r => r[0] === userId);
  const ts = now().toISOString();
  if (idx === -1) await appendRange(`${SHEET_USERS}!A:E`, [[userId, 6, 1, ts, ts]]);
}
async function getUser(userId) {
  const rows = await readRange(`${SHEET_USERS}!A2:E`);
  const row = rows.find(r => r[0] === userId);
  if (!row) return null;
  return {
    userId: row[0],
    daily_limit: Number(row[1] ?? 6),
    reminders_enabled: Number(row[2] ?? 1),
    created_at: row[3],
    updated_at: row[4],
    _rowIndex1: (rows.indexOf(row) + 2)
  };
}
async function updateUser(userId, fields) {
  const user = await getUser(userId);
  if (!user) { await ensureUser(userId); return updateUser(userId, fields); }
  const ts = now().toISOString();
  const daily_limit = fields.daily_limit !== undefined ? fields.daily_limit : user.daily_limit;
  const reminders_enabled = fields.reminders_enabled !== undefined ? fields.reminders_enabled : user.reminders_enabled;
  const rowIdx = user._rowIndex1;
  const values = [[userId, daily_limit, reminders_enabled, user.created_at, ts]];
  await updateRange(`${SHEET_USERS}!A${rowIdx}:E${rowIdx}`, values);
}
async function addEntry({ userId, beverage, tspMin, tspMax, qty, period }) {
  const ts = now().toISOString();
  await appendRange(`${SHEET_ENTRIES}!A:H`, [[ userId, today(), period, beverage, tspMin, tspMax, qty || 1, ts ]]);
}
async function sumToday(userId) {
  const rows = await readRange(`${SHEET_ENTRIES}!A2:H`);
  let smin = 0, smax = 0;
  const d = today();
  for (const r of rows) {
    const [uid, date, , , tspMin, tspMax, qty] = r;
    if (uid === userId && date === d) {
      const q = Number(qty || 1);
      smin += Number(tspMin || 0) * q;
      smax += Number(tspMax || 0) * q;
    }
  }
  return { smin, smax };
}
async function listTodayDetail(userId) {
  const rows = await readRange(`${SHEET_ENTRIES}!A2:H`);
  const d = today();
  const items = [];
  for (const r of rows) {
    const [uid, date, , beverage, tspMin, tspMax, qty] = r;
    if (uid === userId && date === d && beverage && beverage !== "ไม่ได้รับประทาน") {
      const q = Number(qty || 1);
      const minT = Number(tspMin || 0), maxT = Number(tspMax || 0);
      items.push(`• ${beverage} × ${trim0(q)} = ${fmtRange(minT * q, maxT * q)}`);
    }
  }
  return items;
}
async function deleteToday(userId) {
  const rows = await readRange(`${SHEET_ENTRIES}!A2:H`);
  const indices = [];
  let i = 0;
  for (const r of rows) {
    i++;
    const [uid, date] = r;
    if (uid === userId && date === today()) indices.push(i + 1);
  }
  await deleteRowsByIndices(SHEET_ENTRIES, indices);
}

// ---------- Utils ----------
async function getDisplayName(userId) {
  try {
    const p = await client.getProfile(userId);
    return p?.displayName || "";
  } catch {
    return "";
  }
}

// ---------- Proxy endpoint ----------
app.get("/line-content/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const stream = await client.getMessageContent(messageId);

    let contentTypeSet = false;
    stream.on("response", (lineRes) => {
      const ct = lineRes.headers["content-type"] || "application/octet-stream";
      res.setHeader("Content-Type", ct);
      res.setHeader("Cache-Control", "no-store, max-age=0");
      contentTypeSet = true;
    });

    stream.on("data", chunk => res.write(chunk));
    stream.on("end", () => res.end());
    stream.on("error", () => {
      if (!contentTypeSet) res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.status(404).send("Content not found or expired.");
    });
  } catch {
    res.status(404).send("Content not found or expired.");
  }
});

// ---------- Webhook ----------
app.post("/bot-sugar-webhook", line.middleware(config), async (req, res) => {
  try {
    await initSheets();
    await Promise.all(req.body.events.map(handleEvent));
    res.status(200).json({ ok: true });
  } catch (e) {
    const data = e?.originalError?.response?.data;
    if (data) console.error("webhook error body:", JSON.stringify(data, null, 2));
    console.error("webhook error:", e);
    res.status(200).end();
  }
});

async function handleEvent(event) {
  // 1) ต้อนรับ
  if (event.type === "follow") {
    const userId = event.source.userId;
    await ensureUser(userId);
    if (RICH_MENU_ID) {
      try { await client.linkRichMenuToUser(userId, RICH_MENU_ID); }
      catch (e) { console.error("linkRichMenuToUser error:", e?.message || e); }
    }
    return client.replyMessage(event.replyToken, withQR({
      type: "text",
      text:
        "สวัสดีค่ะ 👋 ขอบคุณที่เพิ่มเพื่อนกับ Gluco Buddy\n\n" +
        "ที่นี่คุณสามารถ:\n" +
        "🥤 เช็กปริมาณน้ำตาลในเครื่องดื่ม \n" +
        "📊 บันทึกการดื่มเพื่อดูผลรวมในแต่ละวัน\n" +
        "🔔 รับการเตือนเช้า–กลางวัน–เย็น–ค่ำ ให้อัปเดตข้อมูล\n\n" +
        "เริ่มเลย! 👉 พิมพ์ชื่อเครื่องดื่ม เช่น “ชาเขียว” หรือ “ชาเขียว 3 แก้ว”",
    }));
  }

  // 2) รูปภาพ (เอาปุ่ม template ออก)
  if (event.type === "message" && event.message.type === "image") {
    const userId = event.source.userId;
    await ensureUser(userId);
    try {
      const messageId = event.message.id;
      const displayName = await getDisplayName(userId);
      const userLabel = displayName ? `(${displayName}) ${userId}` : userId;

      let fullUrl = "";
      if (event.message.contentProvider?.type === "external" &&
          event.message.contentProvider?.originalContentUrl) {
        fullUrl = event.message.contentProvider.originalContentUrl;
      } else {
        fullUrl = PUBLIC_BASE_URL
          ? `${PUBLIC_BASE_URL}/line-content/${messageId}`
          : `/line-content/${messageId}`;
      }

      await appendRange(`${SHEET_PHOTOS}!A:G`, [[
        userLabel, today(), periodByHour(now().hour()), "image/jpeg",
        messageId, fullUrl, now().toISOString()
      ]]);

      return client.replyMessage(event.replyToken, withQR({
        type: "text",
        text:
          `📸 รับรูปแล้วค่ะ\nเปิดรูปของคุณได้ที่:\n${fullUrl}\n\n` +
          `หมายเหตุ: เนื้อหาต้นทางบน LINE มีอายุจำกัด หากเปิดไม่ได้ภายหลัง โปรดส่งใหม่อีกครั้งนะคะ 🙏`,
      }));
    } catch (e) {
      const data = e?.originalError?.response?.data;
      if (data) console.error("image handler error body:", JSON.stringify(data, null, 2));
      console.error("image (temp URL) error:", e?.message || e);
      return client.replyMessage(event.replyToken, withQR({
        type: "text",
        text: "ขออภัยค่ะ ระบบดึงลิงก์ชั่วคราวขัดข้อง ลองใหม่อีกครั้งได้ไหมคะ 🙏",
      }));
    }
  }

  // 3) ข้ามหากไม่ใช่ข้อความ
  if (event.type !== "message" || event.message.type !== "text") return null;

  const userId = event.source.userId;
  const text = (event.message.text || "").trim();
  await ensureUser(userId);
  const hour = now().hour();
  const period = periodByHour(hour);

  // 4) สอนใช้งาน
  if (/^สอนใช้งาน$/.test(text)) {
    return client.replyMessage(event.replyToken, withQR({
      type: "text",
      text:
        "📖 วิธีการใช้งาน Gluco Buddy\n\n" +
        "🥤 พิมพ์ชื่อเครื่องดื่ม เช่น: “ชาเขียว” หรือ “ชาเขียว 2 แก้ว” \n\n" +
        "🥤 ค่าเริ่มต้นระบบคิดน้ำตาลจากค่ามาตรฐานของเมนู “ต่อ 600 ml” \n\n" +
        "🥤 สามารถกำหนดใส่ปริมาณเป็น ml ได้ เช่น: “ชาเขียว 350 ml”, “ชาเขียว 2 แก้ว 350 ml \n\n" +
        "📊 ดูผลรวมวันนี้ → พิมพ์: “สรุปวันนี้”\n\n" +
        "🚫 ถ้าไม่ได้ดื่มในมื้อนี้ → พิมพ์: “ไม่ได้รับประทานในมื้อนี้”\n\n" +
        "🔄 เริ่มใหม่ → พิมพ์: “รีเซ็ตวันนี้”\n\n" +
        "🔔 เปิด/ปิดการแจ้งเตือน → พิมพ์: “เปิดเตือน” หรือ “หยุดเตือน",
    }));
  }

  // 5) สรุปวันนี้
  if (/^สรุปวันนี้$/.test(text)) {
    const { smin = 0, smax = 0 } = await sumToday(userId);
    const items = await listTodayDetail(userId);
    const user = await getUser(userId);
    const limit = user?.daily_limit ?? 6;
    const avg = (smin + smax) / 2;
    const over = avg > limit;

    let msg =
      `สรุปวันนี้: ${fmtRange(smin, smax)} (เป้าหมาย ${trim0(limit)} ช้อนชา)\n` +
      (over ? "⚠️ วันนี้เกินเป้าหมายแล้ว" : "✅ ยังไม่เกินเป้าหมายวันนี้");

    if (items.length) msg += `\n\nรายการที่ดื่มวันนี้:\n` + items.join("\n");

    if (over) {
      msg += `

🩺 คำแนะนำ
🔹 ลดปริมาณการดื่มน้ำหวานลง และสั่ง ”หวานน้อย“ หรือ ”ไม่ใส่น้ำตาล/ไซรัป“
🔹 อ่านฉลากโภชนาการเพื่อเทียบปริมาณน้ำตาล
🔹 ดื่มน้ำเปล่าเยอะ ๆ และเลี่ยงของหวานทั้งวัน
🔹 ออกกำลังกายเบา ๆ เช่น เดิน 30 นาที

👵🏻 สำหรับผู้มีโรคเบาหวาน/ภาวะเสี่ยง
❌ ควรหลีกเลี่ยงทันที
✅ เลือกสูตรน้ำตาล 0%`;
    }
    return client.replyMessage(event.replyToken, withQR({ type: "text", text: msg }));
  }

  // 6) ตั้งเป้าหมาย
  const mGoal = text.match(/ตั้ง(ค่า)?เป้าหมาย\s*(\d+(?:\.\d+)?)\s*ช้อนชา?/);
  if (mGoal) {
    const val = Math.max(1, parseFloat(mGoal[2]));
    await updateUser(userId, { daily_limit: val });
    return client.replyMessage(event.replyToken, withQR({
      type: "text", text: `ตั้งเป้าหมายต่อวันเป็น ${trim0(val)} ช้อนชาแล้ว ✅`,
    }));
  }

  // 7) เปิด/หยุดเตือน
  if (/^หยุดเตือน$/.test(text)) {
    await updateUser(userId, { reminders_enabled: 0 });
    return client.replyMessage(event.replyToken, withQR({
      type: "text", text: "ปิดการแจ้งเตือนแล้ว ✅ (พิมพ์ “เปิดเตือน” เพื่อเปิดใหม่)",
    }));
  }
  if (/^เปิดเตือน$/.test(text)) {
    await updateUser(userId, { reminders_enabled: 1 });
    return client.replyMessage(event.replyToken, withQR({
      type: "text", text: "เปิดการแจ้งเตือนแล้ว ✅",
    }));
  }

  // 8) รีเซ็ตวันนี้
  if (/^(ลบวันนี้|รีเซ็ตวันนี้)$/.test(text)) {
    await deleteToday(userId);
    return client.replyMessage(event.replyToken, withQR({
      type: "text", text: "ลบข้อมูลของวันนี้แล้ว ✅",
    }));
  }

  // 9) ไม่ได้รับประทาน
  if (/^ไม่ได้รับประทานในมื้อนี้$/.test(text)) {
    await addEntry({ userId, beverage: "ไม่ได้รับประทาน", tspMin: 0, tspMax: 0, qty: 1, period });
    const { smin = 0, smax = 0 } = await sumToday(userId);
    return client.replyMessage(event.replyToken, withQR({
      type: "text", text: `รับทราบ — บันทึกว่า “ไม่ได้รับประทาน” ในช่วง${period}\nรวมวันนี้: ${fmtRange(smin, smax)}`,
    }));
  }

  // 10) รายการเครื่องดื่ม
  if (/^(รายการเครื่องดื่ม|เมนู|ช่วยเหลือ|help)$/i.test(text)) {
    return client.replyMessage(event.replyToken, withQR({
      type: "text",
      text: "พิมพ์ชื่อเครื่องดื่มเพื่อบันทึก เช่น “ชาเขียว 1 แก้ว” หรือ “ชาเขียว 300 ml”\n\nรายการที่รองรับ:\n" + DRINK_KEYS.join(" • "),
    }));
  }

  // 11) บันทึกเครื่องดื่ม (สเกลจากฐาน 600 ml)
  const key = findDrink(text);
  if (!key) {
    return client.replyMessage(event.replyToken, withQR({
      type: "text", text: "ยังไม่รู้จักเครื่องดื่มนี้นะคะ 🥺\nพิมพ์ “รายการเครื่องดื่ม” เพื่อดูชื่อที่รองรับ",
    }));
  }

  const qty = parseQty(text);         // จำนวนแก้ว (ไม่มี "แก้ว" → 1)
  const ml = parseMl(text);           // ปริมาตรต่อแก้ว (ถ้ามี)
  const unitFactor = ml ? (ml / 600) : 1;  // เทียบฐาน 600 ml
  const factor = qty * unitFactor;

  const [minT, maxT] = DRINKS[key];   // ช้อนชาต่อ 600 ml
  const addMin = minT * factor;
  const addMax = maxT * factor;

  const beverageLabel = ml ? `${key} (${trim0(ml)} ml/แก้ว)` : `${key} (ฐาน 600 ml)`;

  const before = await sumToday(userId);
  await addEntry({ userId, beverage: beverageLabel, tspMin: minT, tspMax: maxT, qty: factor, period });
  const after = await sumToday(userId);

  const user = await getUser(userId);
  const limit = user?.daily_limit ?? 6;
  const beforeAvg = ((before.smin || 0) + (before.smax || 0)) / 2;
  const afterAvg = ((after.smin || 0) + (after.smax || 0)) / 2;
  const crossed = beforeAvg <= limit && afterAvg > limit;

  // แสดงผล: ถ้าใส่ ml และจำนวน = 1 ให้แสดงสั้น ๆ
  const qtyLabel = ml
    ? (qty === 1 ? `${trim0(ml)}ml` : `${trim0(qty)} × ${trim0(ml)}ml`)
    : `${trim0(qty)} แก้ว`;

  const lines = [
    `${key} ${ml ? `(${trim0(ml)}ml ต่อแก้ว)` : `(ฐาน 600ml)`} × ${qtyLabel} = ${fmtRange(addMin, addMax)}`,
    `รวมวันนี้: ${fmtRange(after.smin || 0, after.smax || 0)} (เป้าหมาย ${trim0(limit)} ช้อนชา)`,
  ];
  if (crossed) lines.push(
    "⚠️ วันนี้รับน้ำตาลเกินเป้าหมายแล้ว—ลองลดเมนูหวานลงหน่อยนะคะ",
    "",
    "🩺 คำแนะนำ",
    "🔹 ลดปริมาณการดื่มน้ำหวานลง และสั่ง ”หวานน้อย“ หรือ ”ไม่ใส่น้ำตาล/ไซรัป“",
    "🔹 อ่านฉลากโภชนาการเพื่อเทียบปริมาณน้ำตาล",
    "🔹 ดื่มน้ำเปล่าเยอะ ๆ เลี่ยงของหวานทั้งวัน และออกกำลังกายเบา ๆ",
    "",
    "👵🏻 สำหรับผู้มีโรคเบาหวาน/ภาวะเสี่ยง",
    "❌ ควรหลีกเลี่ยงทันที",
    "✅ เลือกสูตรน้ำตาล 0% ไปด้วย"
  );

  return client.replyMessage(event.replyToken, withQR({ type: "text", text: lines.join("\n") }));
}

// ใช้ JSON หลัง webhook เท่านั้น
app.use(express.json());
app.get("/health", (_, res) => res.json({ ok: true, time: dayjs().tz(TZ).toISOString() }));

// ---------- Reminders ----------
async function recipientsEnabled() {
  const rows = await readRange(`${SHEET_USERS}!A2:E`);
  return rows.filter(r => Number(r[2] || 0) === 1).map(r => r[0]);
}
async function sendReminders(period) {
  const uids = await recipientsEnabled();
  for (const userId of uids) {
    try {
      await client.pushMessage(userId, {
        type: "text",
        text:
          `ถึงเวลา${period}แล้ว 📣\n` +
          `บันทึกเครื่องดื่มของคุณวันนี้กันหน่อย?\n` +
          `ถ้าไม่ได้ดื่ม ให้พิมพ์: "ไม่ได้รับประทานในมื้อนี้"`,
        quickReply: QUICK_REPLY,
      });
    } catch (e) {
      console.error("push error:", e?.message || e);
    }
  }
}
cron.schedule("0 8 * * *", () => sendReminders("เช้า"),   { timezone: TZ });
cron.schedule("0 12 * * *", () => sendReminders("เที่ยง"), { timezone: TZ });
cron.schedule("0 18 * * *", () => sendReminders("เย็น"),   { timezone: TZ });
cron.schedule("0 23 * * *", () => sendReminders("ค่ำ"),    { timezone: TZ });

// ---------- Start ----------
app.listen(PORT, async () => {
  console.log(`✅ Server on :${PORT}`);
  console.log(`   Webhook path: /bot-sugar-webhook`);
  await initSheets();

  if (RICH_MENU_DEFAULT && RICH_MENU_ID) {
    try {
      await client.setDefaultRichMenu(RICH_MENU_ID);
      console.log("✅ setDefaultRichMenu OK");
    } catch (e) {
      console.error("setDefaultRichMenu error:", e?.message || e);
    }
  }
});
