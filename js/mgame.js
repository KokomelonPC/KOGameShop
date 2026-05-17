const mGameProducts = [
  {
    name: "GGT Class 4 M-Game",
    price: 700,
    unit: "100M",
    stock: 100,
    image: "assets/game-ggt.svg",
    desc: "เงินในเกมยอดนิยมสำหรับสายฟาร์มและสายเทรด ส่งไวหลังยืนยันยอดโอน",
  },
  {
    name: "IRO Zeny",
    price: 90,
    unit: "100M",
    stock: 50,
    image: "assets/game-iro.svg",
    desc: "เหมาะกับผู้เล่นที่ต้องการทุนสำหรับอัปของ ซื้อของ และเริ่มตัวละครใหม่",
  },
  {
    name: "Albion Silver",
    price: 380,
    unit: "100M",
    stock: 30,
    image: "assets/game-albion.svg",
    desc: "เช็กราคาและสต็อกก่อนสั่งซื้อ เหมาะกับผู้เล่นที่ต้องการเงินพร้อมใช้งาน",
  },
];

function money(value) {
  return Number(value).toLocaleString("th-TH");
}

function lineUrl(itemName = "M-Game") {
  const text = encodeURIComponent(`สวัสดีครับ สนใจสั่งซื้อ ${itemName} จาก KOGame Shop`);
  return `https://line.me/R/oaMessage/@/?${text}`;
}

function renderProductCards() {
  const target = document.querySelector("[data-products]");
  if (!target) return;

  target.innerHTML = mGameProducts.map((item) => `
    <article class="product-card">
      <img src="${item.image}" alt="${item.name}">
      <div class="product-body">
        <div>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        </div>
        <div class="product-meta">
          <div>
            <strong class="price">฿${money(item.price)}</strong>
            <span class="muted"> / ${item.unit}</span>
          </div>
          <span class="pill">พร้อมขาย ${item.stock}</span>
        </div>
        <a class="button primary" href="${lineUrl(item.name)}" target="_blank" rel="noreferrer">สั่งซื้อผ่าน LINE</a>
      </div>
    </article>
  `).join("");
}

function renderStockList() {
  const target = document.querySelector("[data-stock]");
  if (!target) return;

  target.innerHTML = mGameProducts.map((item) => `
    <article class="stock-card">
      <div class="stock-left">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${item.unit} | สต็อก ${item.stock}</p>
        </div>
      </div>
      <div class="stock-price">
        <strong class="price">฿${money(item.price)}</strong>
        <a class="button secondary" href="${lineUrl(item.name)}" target="_blank" rel="noreferrer">จองรายการนี้</a>
      </div>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductCards();
  renderStockList();
});
