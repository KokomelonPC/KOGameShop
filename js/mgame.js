const CART_KEY = "kogameMGameCart";
const ORDER_KEY = "kogameMGameOrders";
const USER_KEY = "kogameMGameUser";

const mGameProducts = [
  {
    id: "m-ggt",
    name: "GGT Class 4 M-Game",
    price: 700,
    unit: "100M",
    stock: 100,
    image: "assets/game-ggt.svg",
    desc: "เงินในเกมยอดนิยมสำหรับสายฟาร์มและสายเทรด ส่งไวหลังยืนยันยอดโอน",
  },
  {
    id: "m-iro",
    name: "IRO Zeny",
    price: 90,
    unit: "100M",
    stock: 50,
    image: "assets/game-iro.svg",
    desc: "เหมาะกับผู้เล่นที่ต้องการทุนสำหรับอัปของ ซื้อของ และเริ่มตัวละครใหม่",
  },
  {
    id: "m-albion",
    name: "Albion Silver",
    price: 380,
    unit: "100M",
    stock: 30,
    image: "assets/game-albion.svg",
    desc: "เช็กราคาและสต็อกก่อนสั่งซื้อ เหมาะกับผู้เล่นที่ต้องการเงินพร้อมใช้งาน",
  },
];

function money(value) {
  return Number(value || 0).toLocaleString("th-TH");
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUser() {
  return readJson(USER_KEY, null);
}

function getCart() {
  return readJson(CART_KEY, []);
}

function saveCart(cart) {
  writeJson(CART_KEY, cart);
  updateCartCount();
}

function getOrders() {
  return readJson(ORDER_KEY, []);
}

function saveOrders(orders) {
  writeJson(ORDER_KEY, orders);
}

function getCartDetails() {
  return getCart()
    .map((item) => {
      const product = mGameProducts.find((entry) => entry.id === item.id);
      return product ? { ...product, qty: item.qty, lineTotal: product.price * item.qty } : null;
    })
    .filter(Boolean);
}

function cartTotal() {
  return getCartDetails().reduce((sum, item) => sum + item.lineTotal, 0);
}

function showNotice(message) {
  let notice = document.querySelector("#notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "notice";
    notice.className = "notice";
    document.body.appendChild(notice);
  }
  notice.textContent = message;
  notice.classList.add("is-visible");
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => notice.classList.remove("is-visible"), 1800);
}

function updateCartCount() {
  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = total;
  });
}

function updateAccountNav() {
  const target = document.querySelector("[data-account]");
  if (!target) return;
  const user = getUser();
  if (!user) {
    target.innerHTML = `<a href="login.html">Login</a>`;
    return;
  }
  target.innerHTML = `<span class="muted">${user.name || user.email}</span><button type="button" data-logout>Logout</button>`;
}

function requireLogin(nextUrl = "cart.html") {
  if (getUser()) return true;
  localStorage.setItem("kogameNextUrl", nextUrl);
  window.location.href = "login.html";
  return false;
}

function addToCart(productId) {
  const product = mGameProducts.find((item) => item.id === productId);
  if (!product) return;
  if (!requireLogin("cart.html")) return;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
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
          <div><strong class="price">฿${money(item.price)}</strong><span class="muted"> / ${item.unit}</span></div>
          <span class="pill">พร้อมขาย ${item.stock}</span>
        </div>
        <button class="button primary" type="button" data-add-cart="${item.id}">เพิ่มลงตะกร้า</button>
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
        <div><h3>${item.name}</h3><p>${item.unit} | สต็อก ${item.stock}</p></div>
      </div>
      <div class="stock-price">
        <strong class="price">฿${money(item.price)}</strong>
        <button class="button secondary" type="button" data-add-cart="${item.id}">จองรายการนี้</button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const target = document.querySelector("[data-cart-list]");
  const totalNode = document.querySelector("[data-cart-total]");
  const checkoutButton = document.querySelector("[data-checkout]");
  if (!target || !totalNode) return;
  const details = getCartDetails();
  totalNode.textContent = `฿${money(cartTotal())}`;
  if (checkoutButton) checkoutButton.classList.toggle("hidden", details.length === 0);
  if (!details.length) {
    target.innerHTML = `<div class="empty-state">ตะกร้ายังว่าง เลือก M-Game ที่ต้องการก่อนชำระเงิน</div>`;
    return;
  }
  target.innerHTML = details.map((item) => `
    <div class="cart-item">
      <div class="cart-info">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>฿${money(item.price)} / ${item.unit}</p>
          <div class="qty-control">
            <button class="icon-button" type="button" data-qty="${item.id}" data-delta="-1">-</button>
            <strong>${item.qty}</strong>
            <button class="icon-button" type="button" data-qty="${item.id}" data-delta="1">+</button>
          </div>
        </div>
      </div>
      <div class="row-actions">
        <strong>฿${money(item.lineTotal)}</strong>
        <button class="button danger" type="button" data-remove="${item.id}">ลบ</button>
      </div>
    </div>
  `).join("");
}

function renderPaymentSummary() {
  const target = document.querySelector("[data-payment-summary]");
  const amount = document.querySelector("#amount");
  const name = document.querySelector("#name");
  const note = document.querySelector("#note");
  if (!target) return;
  const user = getUser();
  const details = getCartDetails();
  if (name && user) name.value = user.name || user.email;
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
  if (!requireLogin("payment.html")) return;
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
  const target = document.querySelector("[data-orders]");
  if (!target) return;
  const orders = getOrders();
  if (!orders.length) {
    target.innerHTML = `<div class="empty-state">ยังไม่มีออเดอร์</div>`;
    return;
  }
  target.innerHTML = orders.map((order) => `
    <article class="order-card">
      <div class="order-head"><h3>${order.id}</h3><span class="pill">${order.status}</span></div>
      <p>${order.items.map((item) => `${item.name} x${item.qty}`).join(", ")}</p>
      <p><strong>ยอดชำระ:</strong> ฿${money(order.amount)} | <strong>ช่องทาง:</strong> ${order.method}</p>
      <span class="muted">${new Date(order.createdAt).toLocaleString("th-TH")}</span>
    </article>
  `).join("");
}

function initLogin() {
  const loginForm = document.querySelector("[data-login-form]");
  const registerForm = document.querySelector("[data-register-form]");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value;
      if (!email || !password) return;
      writeJson(USER_KEY, { email, name: email.split("@")[0] || "ลูกค้า" });
      window.location.href = localStorage.getItem("kogameNextUrl") || "index.html";
      localStorage.removeItem("kogameNextUrl");
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
      writeJson(USER_KEY, { email, name });
      window.location.href = localStorage.getItem("kogameNextUrl") || "index.html";
      localStorage.removeItem("kogameNextUrl");
    });
  }
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-cart]");
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  const logoutButton = event.target.closest("[data-logout]");
  if (addButton) addToCart(addButton.dataset.addCart);
  if (qtyButton) changeQty(qtyButton.dataset.qty, Number(qtyButton.dataset.delta));
  if (removeButton) removeFromCart(removeButton.dataset.remove);
  if (logoutButton) {
    localStorage.removeItem(USER_KEY);
    window.location.href = "index.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  updateAccountNav();
  updateCartCount();
  renderProductCards();
  renderStockList();
  renderCart();
  renderPaymentSummary();
  renderOrders();
  initLogin();
  const paymentForm = document.querySelector("[data-payment-form]");
  if (paymentForm) {
    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitPayment();
    });
  }
});
