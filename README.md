# KOGame Shop

เว็บขายเงินในเกมแบบ static สำหรับเปิดใช้งานจากไฟล์ `index.html` ได้ทันที

## สิ่งที่เพิ่มในเวอร์ชันนี้

- ดีไซน์หน้าร้านใหม่ให้เป็นเว็บขายของมากขึ้น
- ระบบ Login/Register แบบเดโมด้วย `localStorage`
- ระบบสินค้า ตะกร้า ชำระเงิน และติดตามออเดอร์
- หน้าชำระเงินพร้อมบัญชีธนาคาร QR พร้อมเพย์ และ TrueMoney
- ข้อความไทยถูกเขียนใหม่เป็น UTF-8 อ่านได้ปกติ

## ไฟล์สำคัญ

- `index.html` หน้าร้าน
- `m-game.html`, `topup.html`, `exchange.html`, `other.html` หน้าหมวดสินค้า
- `cart.html` ตะกร้าสินค้า
- `payment.html` แจ้งโอนเงิน
- `orders.html` ติดตามคำสั่งซื้อ
- `login.html`, `register.html` ระบบบัญชี
- `js/app.js` ข้อมูลสินค้าและระบบร้านฝั่ง browser
- `css/styles.css` ธีมและ layout

> ระบบนี้เป็นเดโมฝั่ง browser ถ้าต้องการใช้งานจริงให้เชื่อม Firebase Auth, Google Apps Script หรือฐานข้อมูลสำหรับเก็บออเดอร์และสลิปถาวร
