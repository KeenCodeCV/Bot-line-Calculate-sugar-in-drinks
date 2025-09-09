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
