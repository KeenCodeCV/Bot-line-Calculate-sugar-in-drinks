# Gluco Buddy — LINE Sugar Bot (Google Sheets backend)

[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](#)
[![LINE Messaging API](https://img.shields.io/badge/LINE%20Messaging%20API-v3-00C300?logo=line&logoColor=white)](#)
[![Google Sheets API](https://img.shields.io/badge/Google%20Sheets-API-34A853?logo=googlesheets&logoColor=white)](#)


บอท LINE สำหรับบันทึก/สรุป "ปริมาณน้ำตาลจากเครื่องดื่ม" พิมพ์ชื่อเมนู + จำนวนแก้ว/ปริมาตร แล้วบอทจะคำนวณน้ำตาลจากฐาน **600 ml** เก็บข้อมูลลง **Google Sheets** พร้อม **Quick Reply**, **Rich Menu**, และ **แจ้งเตือนเป็นช่วงเวลา** ด้วย `node-cron`.

> โค้ดหลัก: `server.js`

---

## ✨ ไฮไลต์
- พิมพ์เมนู เช่น `ชาเขียว 2 แก้ว 350 ml` แล้วคำนวณน้ำตาลให้อัตโนมัติ
- Quick Reply: `สอนใช้งาน | สรุปวันนี้ | รายการเครื่องดื่ม | รีเซ็ตวันนี้ | เปิด/หยุดเตือน`
- สรุปปริมาณน้ำตาลเทียบ **เป้าหมายส่วนตัว** ต่อวัน
- รองรับรูปภาพ: พร็อกซี `/line-content/:messageId` ให้เปิดจากภายนอกได้
- เชื่อม **Google Sheets** อัตโนมัติ (สร้างชีตและส่วนหัวให้เองรันครั้งแรก)
- Cron แจ้งเตือนช่วง **เช้า/เที่ยง/เย็น/ค่ำ** (TZ: Asia/Bangkok)
- รองรับ Rich Menu และกำหนดเป็นค่าเริ่มต้นได้

---

## 🖼️ ภาพตัวอย่าง
> วางไฟล์ภาพลงใน `docs/images/` ตามชื่อด้านล่าง

- `docs/images/cover.png` — ปกโปรเจกต์  
- `docs/images/chat-demo.png` — แชตตัวอย่าง  
- `docs/images/qr-add-friend.png` — QR เพิ่มเพื่อน (ถ้ามี)

```text
.
├─ server.js
├─ README.md
└─ docs/
   └─ images/
      ├─ cover.png
      ├─ chat-demo.png
      └─ qr-add-friend.png
```

---

## 🧭 สถาปัตยกรรม

```mermaid
flowchart LR
  User[ผู้ใช้ LINE] <--->|ข้อความ/รูป| LINE[LINE Platform]
  LINE -->|Webhook /bot-sugar-webhook| App(Express.js App)
  App -->|อ่าน/เขียน| Sheets[(Google Sheets)]
  App -->|GET /line-content/:messageId| LINE
  subgraph Server
    App
    Cron[node-cron Schedules]
  end
```

---

## 🗃️ โครงสร้างชีต (Google Sheets)

### Users
```
userId | daily_limit | reminders_enabled | created_at | updated_at
```

### Entries
```
userId | date | period | beverage | tsp_min | tsp_max | qty | created_at
```

### Photos
```
user | date | period | mimeType | messageId | full_url | created_at
```

ระบบจะสร้างชีตและส่วนหัวให้อัตโนมัติเมื่อรันครั้งแรก

---

## ⚙️ ติดตั้ง & รันใช้งาน

### 1) เตรียมเครื่องมือ
- Node.js 18+
- บัญชี LINE Developers (Messaging API)
- บัญชี Google Cloud เปิดใช้ Google Sheets API

### 2) โคลนและติดตั้งแพ็กเกจ
```bash
git clone <YOUR_REPO_URL>.git
cd <YOUR_REPO_DIR>
npm i
```

ใช้แพ็กเกจ: `express`, `@line/bot-sdk`, `node-cron`, `dayjs`, `googleapis`, `dotenv`

### 3) ตั้งค่า LINE Messaging API

สร้าง Messaging API channel แล้วจด
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN` (Long-lived)

ตั้ง Webhook URL → `https://YOUR_DOMAIN/bot-sugar-webhook` แล้วกด Verify & เปิด Use webhook

(ทางเลือก) สร้าง Rich Menu และจด `RICH_MENU_ID`

**ทดสอบบนเครื่องให้ใช้ ngrok เปิดพอร์ต:**
```bash
npm start
# แท็บใหม่
npx ngrok http 3000
# นำ URL จาก ngrok ไปตั้งเป็น Webhook
```

### 4) ตั้งค่า Google Sheets API

- เปิดใช้ Google Sheets API ใน Google Cloud
- สร้าง Service Account + สร้าง Key (JSON)
- นำ email ของ Service Account ไปแชร์สิทธิ์ Editor บน Spreadsheet ของคุณ
- คัดลอก `SPREADSHEET_ID` จาก URL ของชีต
  ```
  https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit#gid=0
  ```

### 5) สร้างไฟล์ .env
```env
# Server
PORT=3000
TZ=Asia/Bangkok

# LINE
LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINE_CHANNEL_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Public base URL (เช่น โดเมนของคุณ หรือ URL จาก ngrok)
PUBLIC_BASE_URL=https://your-domain.tld

# Google Sheets
SPREADSHEET_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=bot-sugar@your-gcp-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<YOUR KEY LINES>\n-----END PRIVATE KEY-----\n"

# Rich Menu (ถ้ามี)
RICH_MENU_ID=
RICH_MENU_DEFAULT=0
```

**สำคัญ:** คีย์ใน .env ต้องคง `\n` ตามที่โค้ด server.js จัดการแล้ว (`replace(/\\n/g, "\n")`)

### 6) รัน
```bash
npm start
# ✅ Server on :3000
#    Webhook path: /bot-sugar-webhook
```

- Health check: `GET /health`
- รูปจาก LINE: `GET /line-content/:messageId`

### 7) Deploy (แนะนำ)

- ใช้ Railway / Render / Fly.io / VPS (มี HTTPS และเปิดพอร์ตถาวร)
- ตั้ง env ตาม .env
- Serverless (เช่น Vercel) ไม่เหมาะกับ cron ในตัว—แยก scheduler ออกต่างหากถ้าจำเป็น

---

## 💬 คำสั่งตัวอย่าง

- `สอนใช้งาน`
- `สรุปวันนี้`
- `รายการเครื่องดื่ม`
- `รีเซ็ตวันนี้` / `ลบวันนี้`
- `เปิดเตือน` / `หยุดเตือน`

**บันทึกเมนู:**
- `ชาเขียว`
- `ชาเขียว 2 แก้ว`
- `ชาเขียว 1 แก้ว 350 ml`
- `ลาเต้ 300 ml`

ระบบคำนวณจากฐาน 600 ml และสเกลตาม `จำนวนแก้ว × ml/แก้ว` ที่ระบุ

---

## 🧰 สคริปต์ที่แนะนำใน package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint ."
  }
}
```

---

## 🔐 ความปลอดภัย & เคล็ดลับ

- ห้าม commit `.env` หรือคีย์จริงขึ้น GitHub (ใช้ `.env.example` แทน)
- แชร์ Spreadsheet ให้ Service Account เท่านั้น (สิทธิ์ Editor)
- `PUBLIC_BASE_URL` ควรเป็น HTTPS เพื่อให้แสดงรูปในไลน์ได้เสถียร
- ใช้ ngrok ทดสอบ: URL เปลี่ยนทุกครั้ง อย่าลืมอัปเดต Webhook

---

## 🧯 การแก้ปัญหาที่พบบ่อย

### 1) 401 Signature validation failed (LINE)
→ ตรวจ `LINE_CHANNEL_SECRET` และพาธ webhook `/bot-sugar-webhook`

### 2) 403 Google API / อ่าน-เขียนชีตไม่ได้
→ ตรวจ `SPREADSHEET_ID` และแชร์ชีตให้ Service Account เป็น Editor

### 3) เปิดรูปไม่ได้ / ลิงก์หมดอายุ
→ ใช้พร็อกซี `/line-content/:messageId` และตรวจ `PUBLIC_BASE_URL`

### 4) พอร์ต 3000 ถูกใช้ (EADDRINUSE)
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 5) Rich Menu ไม่ตั้งเป็นค่าเริ่มต้น
→ ใส่ `RICH_MENU_ID` และตั้ง `RICH_MENU_DEFAULT=1` ก่อน start

---

## 🛣️ Roadmap

- [ ] สรุปรายสัปดาห์/รายเดือน + กราฟ
- [ ] Export CSV อัตโนมัติ
- [ ] ปรับฐานเครื่องดื่มตามแบรนด์/ร้าน
- [ ] ตอบกลับด้วยสติ๊กเกอร์เมื่อเกินเป้าหมาย

---

## 🙌 สำหรับ Recruiter

โปรเจกต์นี้แสดงการทำงาน end-to-end ของ LINE Bot (Webhook, Quick Reply, Rich Menu, Cron) เชื่อม Google Sheets API, จัดการเวลา Asia/Bangkok ด้วย dayjs, โค้ดมีโครงสร้างที่อ่านง่ายและต่อยอดได้จริงในโปรดักชัน

---

## 📄 License

WU © 2025 Thanakrit Sricharung
