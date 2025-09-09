# Gluco Buddy — LINE Sugar Bot (Google Sheets backend)

[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](#)
[![LINE Messaging API](https://img.shields.io/badge/LINE%20Messaging%20API-v3-00C300?logo=line&logoColor=white)](#)
[![Google Sheets API](https://img.shields.io/badge/Google%20Sheets-API-34A853?logo=googlesheets&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)

บอท LINE สำหรับบันทึกและสรุป **ปริมาณน้ำตาลจากเครื่องดื่ม**  
คำนวณตามฐาน **600 ml**, เก็บข้อมูลลง **Google Sheets**,  
รองรับ **Quick Reply, Rich Menu, Reminder (Cron)** และการแนบรูปภาพผ่านพร็อกซี  

---

## ✨ Features
- พิมพ์ชื่อเมนู เช่น `ชาเขียว 2 แก้ว 350 ml` → คำนวณน้ำตาลอัตโนมัติ  
- Quick Reply: `สอนใช้งาน | สรุปวันนี้ | รายการเครื่องดื่ม | รีเซ็ตวันนี้ | เปิด/หยุดเตือน`  
- สรุปปริมาณน้ำตาล เทียบกับ **เป้าหมายต่อวัน**  
- แนบรูปได้ → เซิร์ฟเวอร์สร้างลิงก์ `/line-content/:messageId`  
- Google Sheets API → สร้างชีตและคอลัมน์ให้อัตโนมัติ (`Users`, `Entries`, `Photos`)  
- Reminder แจ้งเตือนเวลา **เช้า / เที่ยง / เย็น / ค่ำ** (โซนเวลา Asia/Bangkok)  
- รองรับ Rich Menu (ตั้งเป็นค่า default ได้)  

---

## 🖼️ Screenshots
> วางภาพในโฟลเดอร์ `docs/images/`  

- `cover.png` — ปกโปรเจกต์  
- `chat-demo.png` — ตัวอย่างแชต  
- `qr-add-friend.png` — QR เพิ่มเพื่อน (ถ้ามี)  

![Cover](docs/images/cover.png)  
![Chat Demo](docs/images/chat-demo.png)  

---

## 🧭 Architecture
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
🗃️ Google Sheets Schema

Users → userId | daily_limit | reminders_enabled | created_at | updated_at

Entries → userId | date | period | beverage | tsp_min | tsp_max | qty | created_at

Photos → user | date | period | mimeType | messageId | full_url | created_at

ระบบจะสร้างชีตและหัวตารางให้อัตโนมัติเมื่อรันครั้งแรก

⚙️ Installation
Requirements

Node.js 18+

LINE Developers Account (Messaging API)

Google Cloud (เปิดใช้งาน Google Sheets API)

Clone & Install
git clone <YOUR_REPO_URL>.git
cd <YOUR_REPO_DIR>
npm install

LINE Messaging API Setup

สร้าง Messaging API Channel

จดค่า:

LINE_CHANNEL_SECRET

LINE_CHANNEL_ACCESS_TOKEN (long-lived)

ตั้งค่า Webhook URL → https://YOUR_DOMAIN/bot-sugar-webhook

เปิด Use webhook + กด Verify ✅

(ถ้ามี) สร้าง Rich Menu → จด RICH_MENU_ID

ทดสอบบน local ใช้ ngrok:

npm start
npx ngrok http 3000

Google Sheets API Setup

เปิดใช้ Google Sheets API ใน Google Cloud

สร้าง Service Account + Key (JSON)

แชร์ Spreadsheet ให้ Service Account เป็น Editor

หา SPREADSHEET_ID จาก URL:

https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit#gid=0

Create .env
PORT=3000
TZ=Asia/Bangkok

LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxxx
LINE_CHANNEL_ACCESS_TOKEN=xxxxxxxxxxxxxxxx

PUBLIC_BASE_URL=https://your-domain.tld
SPREADSHEET_ID=xxxxxxxxxxxxxxxxxxxxxxx

GOOGLE_SERVICE_ACCOUNT_EMAIL=bot-sugar@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<KEY>\n-----END PRIVATE KEY-----\n"

RICH_MENU_ID=
RICH_MENU_DEFAULT=0


⚠️ ระวัง: ต้องคง \n ใน GOOGLE_PRIVATE_KEY ตามที่โค้ดจัดการไว้แล้ว

Run
npm start
# ✅ Server on :3000
#    Webhook path: /bot-sugar-webhook

💬 Example Commands

สอนใช้งาน

สรุปวันนี้

รายการเครื่องดื่ม

รีเซ็ตวันนี้ / ลบวันนี้

เปิดเตือน / หยุดเตือน

บันทึกเครื่องดื่ม:

ชาเขียว

ชาเขียว 2 แก้ว

ชาเขียว 1 แก้ว 350 ml

ลาเต้ 300 ml

🧰 Scripts
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint ."
  }
}

🔐 Security Notes

ห้าม commit .env หรือ key จริงขึ้น GitHub

แชร์ชีตให้ Service Account เท่านั้น

ใช้ HTTPS สำหรับ PUBLIC_BASE_URL เพื่อดูรูปใน LINE ได้

ถ้าใช้ ngrok → ทุกครั้ง URL จะเปลี่ยน ต้องอัปเดต webhook ใน LINE

🧯 Troubleshooting

401 Signature validation failed (LINE) → ตรวจ LINE_CHANNEL_SECRET

403 Google API → ตรวจ SPREADSHEET_ID และสิทธิ์ Service Account

เปิดรูปไม่ได้ → ตรวจ PUBLIC_BASE_URL

พอร์ต 3000 ถูกใช้ (EADDRINUSE)

netstat -ano | findstr :3000
taskkill /PID <PID> /F


Rich Menu ไม่ตั้งค่า default → ใส่ RICH_MENU_ID และ RICH_MENU_DEFAULT=1

🛣️ Roadmap

 รายงานรายสัปดาห์/รายเดือน + กราฟ

 Export CSV

 ปรับฐานเครื่องดื่มตามร้าน/แบรนด์

 ตอบกลับด้วยสติ๊กเกอร์เมื่อเกินเป้าหมาย

🙌 Recruiter Note

โปรเจกต์นี้แสดงถึง:

การพัฒนา LINE Bot end-to-end (Webhook, Quick Reply, Rich Menu, Cron)

การเชื่อมต่อ Google Sheets API และออกแบบโครงสร้างข้อมูล

การใช้ Node.js/Express, การจัดการเวลา (dayjs + timezone)

โค้ดพร้อมต่อยอด, อ่านง่าย และ deploy ได้จริง

📄 License

MIT © 2025 Thanakrit Sricharung
