const gameRows = document.querySelectorAll(".game-row");
const refreshButton = document.querySelector("#refresh-sheet");
const tableBody = document.querySelector("#m-game-table");
const sheetStatusTitle = document.querySelector("#sheet-status-title");
const sheetStatusText = document.querySelector("#sheet-status-text");

const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1iK61-jLOr6OERjQYiSRju3kzX5cVrGzSLmT2TSR-4SA/edit?gid=0#gid=0";

const fallbackRows = [
  { game: "GGT Class 4", sell: "7", stockSell: "100", image: "assets/game-ggt.svg" },
  { game: "IRO", sell: "0.9", stockSell: "50", image: "assets/game-iro.svg" },
  { game: "Albion", sell: "3.8", stockSell: "30", image: "assets/game-albion.svg" },
];

gameRows.forEach((row) => {
  row.addEventListener("click", () => {
    gameRows.forEach((item) => item.classList.remove("is-selected"));
    row.classList.add("is-selected");
  });
});

if (refreshButton && tableBody && sheetStatusTitle && sheetStatusText) {
  refreshButton.addEventListener("click", loadSheetData);
  loadSheetData();
}

async function loadSheetData() {
  setStatus("กำลังโหลดราคา", "กำลังตรวจสอบราคาและสต็อกล่าสุด");

  if (!GOOGLE_SHEET_URL) {
    renderRows(fallbackRows);
    setStatus("แสดงข้อมูลสำรอง", "กรุณาทักแอดมินเพื่อเช็กราคาล่าสุด");
    return;
  }

  try {
    const rows = await loadGoogleSheetRows(GOOGLE_SHEET_URL);

    renderRows(rows);
    setStatus("อัปเดตราคาล่าสุดแล้ว", `พบข้อมูล ${rows.length} เกม`);
  } catch (error) {
    renderRows(fallbackRows);
    setStatus("แสดงข้อมูลสำรองชั่วคราว", "กรุณาทักแอดมินเพื่อเช็กราคาล่าสุด");
  }
}

function renderRows(rows) {
  tableBody.innerHTML = rows.map((row) => {
    const stockSell = Number(row.stockSell);
    const isReady = stockSell > 0;
    const image = row.image || getFallbackImage(row.game);

    return `
      <tr>
        <td><img class="table-game-image" src="${escapeHtml(image)}" alt="${escapeHtml(row.game)}"></td>
        <td>${escapeHtml(row.game)}</td>
        <td>${escapeHtml(row.sell)}</td>
        <td>${escapeHtml(row.stockSell)}</td>
        <td><span class="status-pill ${isReady ? "ready" : "empty"}">${isReady ? "พร้อมขาย" : "หมด"}</span></td>
        <td><a class="buy-m-button" href="#contact">ซื้อเอ็ม</a></td>
      </tr>
    `;
  }).join("");
}

function setStatus(title, text) {
  sheetStatusTitle.textContent = title;
  sheetStatusText.textContent = text;
}

function loadGoogleSheetRows(sheetUrl) {
  return new Promise((resolve, reject) => {
    const callbackName = `handleMGameSheet_${Date.now()}`;
    const script = document.createElement("script");
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheet ใช้เวลาตอบกลับนานเกินไป"));
    }, 12000);

    window[callbackName] = (response) => {
      cleanup();

      if (response.status === "error") {
        reject(new Error(response.errors?.[0]?.detailed_message || "Google Sheet ส่งข้อผิดพลาดกลับมา"));
        return;
      }

      resolve(sheetResponseToRows(response));
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("โหลด Google Sheet ไม่สำเร็จ"));
    };

    script.src = withCacheBust(toJsonpUrl(sheetUrl, callbackName));
    document.body.appendChild(script);

    function cleanup() {
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
    }
  });
}

function sheetResponseToRows(response) {
  const tableRows = response.table?.rows || [];

  return tableRows.map((row) => {
    const columns = row.c || [];
    const game = getCellValue(columns[0]);

    return {
      game: game || "-",
      sell: getCellValue(columns[1]) || "-",
      stockSell: getCellValue(columns[3]) || "-",
      image: normalizeImageUrl(getCellValue(columns[7])) || getFallbackImage(game),
    };
  }).filter((row) => row.game !== "-");
}

function getCellValue(cell) {
  return cell?.f ?? cell?.v ?? "";
}

function toJsonpUrl(sheetUrl, callbackName) {
  const idMatch = sheetUrl.match(/\/spreadsheets\/d\/([^/]+)/);
  const gidMatch = sheetUrl.match(/[?&#]gid=(\d+)/);
  const sheetId = idMatch ? idMatch[1] : sheetUrl;
  const gid = gidMatch ? gidMatch[1] : "0";

  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json;responseHandler:${callbackName}&gid=${gid}`;
}

function withCacheBust(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}cacheBust=${Date.now()}`;
}

function getFallbackImage(gameName) {
  const normalizedName = String(gameName).toLowerCase();

  if (normalizedName.includes("iro")) {
    return "assets/game-iro.svg";
  }

  if (normalizedName.includes("albion")) {
    return "assets/game-albion.svg";
  }

  return "assets/game-ggt.svg";
}

function normalizeImageUrl(url) {
  if (!url) {
    return "";
  }

  const value = String(url).trim();
  const driveMatch = value.match(/drive\.google\.com\/file\/d\/([^/]+)/);

  if (driveMatch) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w240`;
  }

  return value;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (value || row.length) {
        row.push(value.trim());
        rows.push(row);
        row = [];
        value = "";
      }
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value.trim());
    rows.push(row);
  }

  return rows;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
