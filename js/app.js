const firebaseConfig = {
  apiKey: "AIzaSyBN02k5-YhZc1uitpEfMfVpsPLAPYKQs7A",
  authDomain: "myshop-c3983.firebaseapp.com",
  projectId: "myshop-c3983",
};

const PRODUCT_API_URL = "";
const CART_KEY = "kogameCart";
const ORDER_KEY = "kogameOrders";

const products = [
  {
    id: "m-ggt",
    category: "mgame",
    name: "GGT Class 4 M-Game",
    price: 700,
    unit: "100M",
    stock: 100,
    image: "assets/game-ggt.svg",
    description: "เงินในเกมยอดนิยม ส่งไวหลังยืนยันยอดโอน",
  },
  {
    id: "m-iro",
    category: "mgame",
    name: "IRO Zeny",
    price: 90,
    unit: "100M",
    stock: 50,
    image: "assets/game-iro.svg",
    description: "เหมาะสำหรับผู้เล่นที่ต้องการเติมทุนในเซิร์ฟเวอร์ IRO",
  },
  {
    id: "m-albion",
    category: "mgame",
    name: "Albion Silver",
    price: 380,
    unit: "100M",
    stock: 30,
    image: "assets/game-albion.svg",
    description: "เช็กราคาและสต็อกก่อนสั่งซื้อได้ทันที",
  },
  {
    id: "topup-ff",
    category: "topup",
    name: "Free Fire Diamond",
    price: 150,
    unit: "แพ็กเริ่มต้น",
    stock: 999,
    image: "assets/game-ggt.svg",
    description: "เติมเพชรและแพ็กรายสัปดาห์",
  },
  {
    id: "topup-rov",
    category: "topup",
    name: "ROV Coupon",
    price: 199,
    unit: "แพ็กยอดนิยม",
    stock: 999,
    image: "assets/game-iro.svg",
    description: "คูปอง สกิน และ Battle Pass",
  },
  {
    id: "topup-vp",
    category: "topup",
    name: "Valorant Points",
    price: 300,
    unit: "แพ็กเติมเงิน",
    stock: 999,
    image: "assets/game-albion.svg",
    description: "VP สำหรับซื้อสกินและบันเดิล",
  },
  {
    id: "mid-roblox",
    category: "exchange",
    name: "Roblox Item Middleman",
    price: 50,
    unit: "ต่อรายการ",
    stock: 999,
    image: "assets/game-ggt.svg",
    description: "บริการคนกลางซื้อขายไอเทมและบัญชี",
  },
  {
    id: "mid-steam",
    category: "exchange",
    name: "Steam Item Middleman",
    price: 80,
    unit: "ต่อรายการ",
    stock: 999,
    image: "assets/game-iro.svg",
    description: "รับกลางไอเทม คีย์ และสกินในตลาด Steam",
  },
  {
    id: "service-rank",
    category: "other",
    name: "รับแรงค์ / รับเควส",
    price: 300,
    unit: "เริ่มต้น",
    stock: 999,
    image: "assets/game-albion.svg",
    description: "งานบริการเสริมสำหรับเกมยอดนิยม คุยรายละเอียดกับแอดมินก่อนเริ่มงาน",
  },
];

function money(value) {
  return Number(value || 0).toLocaleString("th-TH");
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function getOrders() {
  return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
}

function saveOrders(orders) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function updateCartCount() {
  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = total;
  });
}

function showNotice(message) {
  let notice = document.querySelector("#shop-notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "shop-notice";
    notice.className = "shop-notice";
    document.body.appendChild(notice);
  }

  notice.textContent = message;
  notice.classList.add("is-visible");
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    notice.classList.remove("is-visible");
  }, 1800);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart(cart);
  showNotice(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
}

function changeQty(productId, delta) {
  const cart = getCart()
    .map((item) => item.id === productId ? { ...item, qty: item.qty + delta } : item)
    .filter((item) => item.qty > 0);
  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
  renderCart();
}

function getCartDetails() {
  return getCart()
    .map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      return product ? { ...product, qty: item.qty, lineTotal: product.price * item.qty } : null;
    })
    .filter(Boolean);
}

function cartTotal() {
  return getCartDetails().reduce((sum, item) => sum + item.lineTotal, 0);
}

function productCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-body">
        <div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
        </div>
        <div class="product-meta">
          <div>
            <strong class="price">฿${money(product.price)}</strong>
            <span class="muted"> / ${product.unit}</span>
          </div>
          <span class="pill">${product.stock > 0 ? `พร้อมขาย ${product.stock}` : "หมด"}</span>
        </div>
        <button class="button primary" type="button" data-add-cart="${product.id}">เพิ่มลงตะกร้า</button>
      </div>
    </article>
  `;
}

function renderProducts(category, targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  target.innerHTML = products
    .filter((item) => !category || item.category === category)
    .map(productCard)
    .join("");
}

function renderMGameTable() {
  const target = document.querySelector("#m-game-table");
  if (!target) return;

  target.innerHTML = products
    .filter((item) => item.category === "mgame")
    .map((item) => `
      <tr>
        <td><img class="table-image" src="${item.image}" alt="${item.name}"></td>
        <td>${item.name}<br><span class="muted">${item.unit}</span></td>
        <td>฿${money(item.price)}</td>
        <td>${item.stock}</td>
        <td><span class="pill">${item.stock > 0 ? "พร้อมขาย" : "หมด"}</span></td>
        <td><button class="button primary" type="button" data-add-cart="${item.id}">ซื้อ</button></td>
      </tr>
    `)
    .join("");
}

function renderCart() {
  const list = document.querySelector("#cart-list");
  const totalNode = document.querySelector("#cart-total");
  const checkoutButton = document.querySelector("#checkout-button");
  if (!list || !totalNode) return;

  const details = getCartDetails();
  totalNode.textContent = `฿${money(cartTotal())}`;

  if (checkoutButton) {
    checkoutButton.classList.toggle("hidden", details.length === 0);
  }

  if (!details.length) {
    list.innerHTML = `<div class="empty-state">ตะกร้ายังว่าง เลือกรายการที่ต้องการก่อนชำระเงิน</div>`;
    return;
  }

  list.innerHTML = details.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>฿${money(item.price)} / ${item.unit}</p>
        <div class="qty-control">
          <button class="icon-button" type="button" data-qty="${item.id}" data-delta="-1" aria-label="ลดจำนวน">-</button>
          <strong>${item.qty}</strong>
          <button class="icon-button" type="button" data-qty="${item.id}" data-delta="1" aria-label="เพิ่มจำนวน">+</button>
        </div>
      </div>
      <div class="action-row">
        <strong>฿${money(item.lineTotal)}</strong>
        <button class="button danger" type="button" data-remove="${item.id}">ลบ</button>
      </div>
    </div>
  `).join("");
}

function renderPaymentSummary() {
  const target = document.querySelector("#payment-summary");
  const amount = document.querySelector("#amount");
  const note = document.querySelector("#note");
  if (!target) return;

  const details = getCartDetails();
  if (!details.length) {
    target.innerHTML = `<p class="muted">ยังไม่มีรายการในตะกร้า</p>`;
    return;
  }

  target.innerHTML = details.map((item) => `
    <p><strong>${item.name}</strong><br>${item.qty} x ฿${money(item.price)} = ฿${money(item.lineTotal)}</p>
  `).join("") + `<hr><h3>ยอดรวม ฿${money(cartTotal())}</h3>`;

  if (amount) amount.value = cartTotal();
  if (note) note.value = details.map((item) => `${item.name} x${item.qty}`).join(", ");
}

function submitPayment() {
  const details = getCartDetails();
  const name = document.querySelector("#name")?.value.trim();
  const amount = Number(document.querySelector("#amount")?.value || 0);
  const method = document.querySelector("input[name='paymentMethod']:checked")?.value || "โอนธนาคาร";
  const slip = document.querySelector("#slip")?.files[0];
  const note = document.querySelector("#note")?.value.trim();

  if (!details.length) {
    alert("กรุณาเลือกรายการก่อนแจ้งโอน");
    return;
  }

  if (!name || !amount || !slip) {
    alert("กรุณากรอกชื่อ ยอดโอน และแนบสลิป");
    return;
  }

  const order = {
    id: `KOG-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name,
    amount,
    method,
    note,
    status: "รอตรวจสอบ",
    items: details.map(({ id, name: itemName, qty, price }) => ({ id, name: itemName, qty, price })),
  };

  saveOrders([order, ...getOrders()]);
  saveCart([]);
  alert("ส่งแจ้งโอนเรียบร้อย สามารถติดตามสถานะได้ที่หน้าออเดอร์");
  window.location.href = "orders.html";
}

function renderOrders() {
  const target = document.querySelector("#orders-list");
  if (!target) return;

  const orders = getOrders();
  if (!orders.length) {
    target.innerHTML = `<div class="empty-state">ยังไม่มีคำสั่งซื้อ</div>`;
    return;
  }

  target.innerHTML = orders.map((order) => `
    <article class="order-card">
      <div class="product-meta">
        <h3>${order.id}</h3>
        <span class="pill warn">${order.status}</span>
      </div>
      <p>${order.items.map((item) => `${item.name} x${item.qty}`).join(", ")}</p>
      <p><strong>ยอดชำระ:</strong> ฿${money(order.amount)} | <strong>ช่องทาง:</strong> ${order.method}</p>
      <span class="muted">${new Date(order.createdAt).toLocaleString("th-TH")}</span>
    </article>
  `).join("");
}

function initAuthPage() {
  const loginForm = document.querySelector("#login-form");
  const registerForm = document.querySelector("#register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.querySelector("#email").value.trim();
      localStorage.setItem("kogameUser", JSON.stringify({ email, name: email.split("@")[0] || "ลูกค้า" }));
      alert("เข้าสู่ระบบสำเร็จ");
      window.location.href = "index.html";
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.querySelector("#name").value.trim();
      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value;
      const confirm = document.querySelector("#confirmPassword").value;

      if (password !== confirm) {
        alert("รหัสผ่านไม่ตรงกัน");
        return;
      }

      localStorage.setItem("kogameUser", JSON.stringify({ email, name }));
      alert("สมัครสมาชิกสำเร็จ");
      window.location.href = "index.html";
    });
  }
}

function updateAccountNav() {
  const user = JSON.parse(localStorage.getItem("kogameUser") || "null");
  const target = document.querySelector("#account-status");
  if (!target) return;

  if (user) {
    target.innerHTML = `
      <span class="muted">สวัสดี ${user.name || user.email}</span>
      <button type="button" id="logout-button">Logout</button>
    `;
    document.querySelector("#logout-button").addEventListener("click", () => {
      localStorage.removeItem("kogameUser");
      window.location.href = "index.html";
    });
  } else {
    target.innerHTML = `<a href="login.html">Login</a>`;
  }
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-cart]");
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (addButton) addToCart(addButton.dataset.addCart);
  if (qtyButton) changeQty(qtyButton.dataset.qty, Number(qtyButton.dataset.delta));
  if (removeButton) removeFromCart(removeButton.dataset.remove);
});

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  updateAccountNav();
  initAuthPage();
  renderProducts(document.body.dataset.category || "", "#product-grid");
  renderMGameTable();
  renderCart();
  renderPaymentSummary();
  renderOrders();

  const paymentForm = document.querySelector("#payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitPayment();
    });
  }
});
