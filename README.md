# 🥤 Gluco Buddy - LINE Bot for Sugar Intake Tracking

<div align="center">
  <img src="https://via.placeholder.com/400x200/4CAF50/white?text=Gluco+Buddy" alt="Gluco Buddy Logo" width="400">
  
  [![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
  [![LINE Bot SDK](https://img.shields.io/badge/LINE_Bot_SDK-7+-blue.svg)](https://github.com/line/line-bot-sdk-nodejs)
  [![Google Sheets API](https://img.shields.io/badge/Google_Sheets_API-v4-red.svg)](https://developers.google.com/sheets/api)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📋 Table of Contents
- [About The Project](#about-the-project)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🎯 About The Project

**Gluco Buddy** เป็น LINE Bot ที่ช่วยติดตามปริมาณน้ำตาลในเครื่องดื่มที่คุณบริโภคประจำวัน รองรับเครื่องดื่มกว่า 50 ชนิด พร้อมระบบแจ้งเตือนอัตโนมัติและการจัดเก็บข้อมูลผ่าน Google Sheets

### 🌟 Why Gluco Buddy?
- 🎯 **ควบคุมน้ำตาล**: ติดตามปริมาณน้ำตาลได้แม่นยำ
- 📊 **ข้อมูลครบถ้วน**: รองรับเครื่องดื่มยอดนิยมกว่า 50 ชนิด
- 🔔 **แจ้งเตือนอัตโนมัติ**: เตือนบันทึกข้อมูล 4 ช่วงเวลาต่อวัน
- 📱 **ใช้งานง่าย**: ผ่าน LINE App ที่คุณใช้อยู่แล้ว
- ☁️ **เก็บข้อมูลปลอดภัย**: ใช้ Google Sheets เป็น Database

## ✨ Features

### 🥤 Drink Tracking
- รองรับเครื่องดื่มกว่า **50 ชนิด**
- คำนวณน้ำตาลจากปริมาตรจริง (ml)
- บันทึกจำนวนแก้วได้หลายแก้ว
- แสดงผลเป็นช้อนชาที่เข้าใจง่าย

### 📊 Analytics & Reports
- สรุปปริมาณน้ำตาลรายวัน
- เปรียบเทียบกับเป้าหมายที่ตั้งไว้
- รายละเอียดเครื่องดื่มที่บริโภค
- แจ้งเตือนเมื่อเกินขีดจำกัด

### 🔔 Smart Notifications
- แจ้งเตือนเช้า (08:00)
- แจ้งเตือนเที่ยง (12:00)
- แจ้งเตือนเย็น (18:00)
- แจ้งเตือนค่ำ (23:00)

### 📸 Image Support
- รับรูปภาพเครื่องดื่ม
- สร้าง URL แสดงรูปภาพ
- เก็บประวัติรูปภาพใน Google Sheets

### ⚙️ Customization
- ตั้งเป้าหมายน้ำตาลต่อวันได้
- เปิด/ปิดการแจ้งเตือน
- รีเซ็ตข้อมูลรายวัน

## 📱 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/300x500/2196F3/white?text=Welcome+Screen" alt="Welcome Screen" width="250">
  <img src="https://via.placeholder.com/300x500/FF9800/white?text=Drink+Tracking" alt="Drink Tracking" width="250">
  <img src="https://via.placeholder.com/300x500/9C27B0/white?text=Daily+Summary" alt="Daily Summary" width="250">
</div>

*หน้าจอต้อนรับ, การติดตามเครื่องดื่ม, และสรุปรายวัน*

## 🚀 Getting Started

### 📋 Prerequisites

ก่อนเริ่มติดตั้ง ตรวจสอบให้แน่ใจว่าคุณมี:

- **Node.js 16+** - [Download](https://nodejs.org/)
- **LINE Developer Account** - [Register](https://developers.line.biz/)
- **Google Cloud Account** - [Setup](https://console.cloud.google.com/)
- **Git** - [Install](https://git-scm.com/)

### 🔧 Installation

#### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/gluco-buddy.git
cd gluco-buddy
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Setup Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ root:
```env
# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# Google Sheets Configuration
SPREADSHEET_ID=your_google_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"

# Rich Menu (Optional)
RICH_MENU_ID=your_rich_menu_id
RICH_MENU_DEFAULT=1

# Public URL for image proxy
PUBLIC_BASE_URL=https://your-domain.com

# Server Configuration
PORT=3000
```

### ⚙️ Configuration

#### 🤖 LINE Bot Setup

1. **สร้าง LINE Bot Channel**
   - เข้า [LINE Developers Console](https://developers.line.biz/)
   - คลิก "Create a new channel" → "Messaging API"
   - กรอกข้อมูล Bot และสร้าง Channel

2. **ตั้งค่า Webhook**
   ```
   Webhook URL: https://your-domain.com/bot-sugar-webhook
   ```

3. **เก็บ Channel Access Token และ Channel Secret**
   - Channel Access Token → ใช้ในการส่งข้อความ
   - Channel Secret → ใช้ในการยืนยันตัวตน

#### 📊 Google Sheets Setup

1. **เปิดใช้งาน Google Sheets API**
   ```bash
   # เข้า Google Cloud Console
   https://console.cloud.google.com/
   
   # เปิดใช้งาน APIs
   - Google Sheets API
   - Google Drive API
   ```

2. **สร้าง Service Account**
   ```bash
   # ไป IAM & Admin → Service Accounts
   # สร้าง Service Account ใหม่
   # Download JSON Key File
   ```

3. **สร้าง Google Spreadsheet**
   ```bash
   # สร้าง Google Sheets ใหม่
   # แชร์ให้ Service Account Email (Editor permission)
   # คัดลอก Spreadsheet ID จาก URL
   ```

4. **แปลง JSON Key เป็น Environment Variables**
   ```javascript
   // ตัวอย่างการแปลง JSON key
   const jsonKey = require('./service-account-key.json');
   
   console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL=' + jsonKey.client_email);
   console.log('GOOGLE_PRIVATE_KEY="' + jsonKey.private_key + '"');
   ```

#### 🍽️ Rich Menu Setup (Optional)

1. **สร้าง Rich Menu Image**
   - ขนาด: 2500x1686 pixels หรือ 2500x843 pixels
   - รองรับ: JPEG, PNG

2. **Upload Rich Menu**
   ```bash
   curl -X POST https://api.line.me/v2/bot/richmenu \
   -H 'Authorization: Bearer YOUR_CHANNEL_ACCESS_TOKEN' \
   -H 'Content-Type: application/json' \
   -d '{
     "size": {"width": 2500, "height": 1686},
     "selected": false,
     "name": "Gluco Buddy Menu",
     "chatBarText": "เมนู",
     "areas": [
       {
         "bounds": {"x": 0, "y": 0, "width": 833, "height": 843},
         "action": {"type": "message", "text": "สอนใช้งาน"}
       }
     ]
   }'
   ```

### 🚦 Running the Application

#### Development Mode
```bash
npm run dev
# หรือ
node server.js
```

#### Production Mode
```bash
npm start
```

#### Deploy to Cloud Platform

**Heroku Deployment:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set LINE_CHANNEL_ACCESS_TOKEN=your_token
heroku config:set LINE_CHANNEL_SECRET=your_secret
# ... set other variables

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

**Railway Deployment:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### 🧪 Testing

#### Local Testing with ngrok
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Update LINE Bot Webhook URL
# https://your-ngrok-url.ngrok.io/bot-sugar-webhook
```

#### Health Check
```bash
curl http://localhost:3000/health
# Response: {"ok": true, "time": "2024-01-15T10:30:00.000Z"}
```

## 💬 Usage

### พื้นฐานการใช้งาน

1. **เพิ่มเพื่อน LINE Bot**
   - สแกน QR Code หรือเพิ่มผ่าน LINE ID
   - Bot จะส่งข้อความต้อนรับ

2. **บันทึกเครื่องดื่ม**
   ```
   ชาเขียว                    → บันทึก 1 แก้ว (600ml)
   ชาเขียว 2 แก้ว             → บันทึก 2 แก้ว
   ชาเขียว 350ml              → บันทึกตามปริมาตรจริง
   ชาเขียว 2 แก้ว 350ml       → บันทึก 2 แก้ว ๆ ละ 350ml
   ```

3. **คำสั่งพิเศษ**
   ```
   สอนใช้งาน                   → คู่มือการใช้งาน
   สรุปวันนี้                  → สรุปปริมาณน้ำตาลวันนี้
   รายการเครื่องดื่ม            → ดูเครื่องดื่มที่รองรับ
   ไม่ได้รับประทานในมื้อนี้       → บันทึกว่าไม่ได้ดื่ม
   รีเซ็ตวันนี้                → ลบข้อมูลวันนี้ทั้งหมด
   ตั้งเป้าหมาย 5 ช้อนชา        → ตั้งเป้าหมายใหม่
   เปิดเตือน / หยุดเตือน        → เปิด/ปิดการแจ้งเตือน
   ```

### รายการเครื่องดื่มที่รองรับ

<details>
<summary>🍃 ชาและกาแฟ (คลิกเพื่อดู)</summary>

| เครื่องดื่ม | น้ำตาล (ช้อนชา/600ml) |
|------------|----------------------|
| ชาเขียว | 11 |
| มัชฉะ/มัทฉะ | 0 |
| กาแฟดำ | 0 |
| ลาเต้ | 3 |
| มอคค่า | 6 |
| ชาเย็น | 3 |

</details>

<details>
<summary>🥤 น้ำผลไม้และโซดา (คลิกเพื่อดู)</summary>

| เครื่องดื่ม | น้ำตาล (ช้อนชา/600ml) |
|------------|----------------------|
| น้ำผลไม้ปั่น | 15 |
| น้ำเลมอน | 4 |
| น้ำอัดลม | 11 |
| แดงโซดา | 5 |

</details>

<details>
<summary>🥛 นมและเครื่องดื่มจากนม (คลิกเพื่อดู)</summary>

| เครื่องดื่ม | น้ำตาล (ช้อนชา/600ml) |
|------------|----------------------|
| ชานมไข่มุก | 10 |
| นมเปรี้ยว | 4 |
| นมโอวัลติน | 6 |
| นมไมโล | 6 |
| นมชมพู | 9 |

</details>

### การตั้งค่าขั้นสูง

**ตั้งค่าเป้าหมายน้ำตาล:**
```
ตั้งเป้าหมาย 8 ช้อนชา
→ เปลี่ยนเป้าหมายจาก 6 เป็น 8 ช้อนชาต่อวัน
```

**การจัดการการแจ้งเตือน:**
```
หยุดเตือน → ปิดการแจ้งเตือนทั้งหมด
เปิดเตือน → เปิดการแจ้งเตือนกลับมา
```

## 🔌 API Reference

### Webhook Endpoints

#### POST /bot-sugar-webhook
รับ Webhook จาก LINE Platform
```javascript
// Request body ตัวอย่าง
{
  "events": [
    {
      "type": "message",
      "message": {
        "type": "text",
        "text": "ชาเขียว 2 แก้ว"
      },
      "source": {
        "userId": "USER_ID"
      },
      "replyToken": "REPLY_TOKEN"
    }
  ]
}
```

#### GET /line-content/:messageId
Proxy สำหรับเข้าถึงรูปภาพจาก LINE
```bash
curl https://your-domain.com/line-content/MESSAGE_ID
```

#### GET /health
Health check endpoint
```javascript
// Response
{
  "ok": true,
  "time": "2024-01-15T10:30:00.000Z"
}
```

### Google Sheets Structure

#### Users Sheet
| Column | Type | Description |
|--------|------|-------------|
| userId | String | LINE User ID |
| daily_limit | Number | เป้าหมายน้ำตาลต่อวัน |
| reminders_enabled | Number | เปิด/ปิดการแจ้งเตือน (0/1) |
| created_at | DateTime | วันที่สร้าง |
| updated_at | DateTime | วันที่อัปเดตล่าสุด |

#### Entries Sheet
| Column | Type | Description |
|--------|------|-------------|
| userId | String | LINE User ID |
| date | String | วันที่ (YYYY-MM-DD) |
| period | String | ช่วงเวลา (เช้า/เที่ยง/เย็น/ค่ำ) |
| beverage | String | ชื่อเครื่องดื่ม |
| tsp_min | Number | น้ำตาลต่ำสุด (ช้อนชา) |
| tsp_max | Number | น้ำตาลสูงสุด (ช้อนชา) |
| qty | Number | จำนวน (แก้ว/หน่วย) |
| created_at | DateTime | วันที่บันทึก |

#### Photos Sheet
| Column | Type | Description |
|--------|------|-------------|
| user | String | ข้อมูลผู้ใช้ |
| date | String | วันที่ |
| period | String | ช่วงเวลา |
| mimeType | String | ประเภทไฟล์ |
| messageId | String | LINE Message ID |
| full_url | String | URL รูปภาพ |
| created_at | DateTime | วันที่อัปโหลด |

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **LINE SDK**: @line/bot-sdk
- **Database**: Google Sheets API v4
- **Authentication**: Google Service Account
- **Scheduling**: node-cron
- **Date/Time**: Day.js
- **Environment**: dotenv

## 🤝 Contributing

เรายินดีรับ Contribution จากทุกคน!

1. Fork Project
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

### Code Style
- ใช้ ES6+ syntax
- ใส่ comment ในภาษาไทยสำหรับ business logic
- ตั้งชื่อตัวแปรให้สื่อความหมาย
- ใช้ async/await แทน Promises chains

### Adding New Drinks
เพิ่มเครื่องดื่มใหม่ใน `DRINKS` object:
```javascript
const DRINKS = {
  // เครื่องดื่มใหม่ [น้ำตาลต่ำสุด, น้ำตาลสูงสุด] ต่อ 600ml
  "ชาเขียวมะลิ": [8, 8],
  // ...
};
```

## 📄 License

โครงการนี้ใช้ MIT License - ดู [LICENSE](LICENSE) ไฟล์สำหรับรายละเอียด

## 📞 Contact

**Project Maintainer**: Your Name
- 📧 Email: your.email@example.com
- 🐦 Twitter: [@yourusername](https://twitter.com/yourusername)
- 💼 LinkedIn: [Your Name](https://linkedin.com/in/yourname)

**Project Link**: [https://github.com/yourusername/gluco-buddy](https://github.com/yourusername/gluco-buddy)

---

<div align="center">
  <p>สร้างด้วย ❤️ เพื่อสุขภาพที่ดีของทุกคน</p>
  <p>Made with ❤️ for better health</p>
</div>

## 🙏 Acknowledgments

- [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Node.js Community](https://nodejs.org/)
- แรงบันดาลใจจากการดูแลสุขภาพในยุคดิจิทัล

---

<div align="center">
  <sub>🌟 ถ้าโปรเจกต์นี้มีประโยชน์ อย่าลืมกด Star ด้วยนะคะ! 🌟</sub>
</div>
