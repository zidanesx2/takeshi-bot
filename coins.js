const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "db", "coins.json");

// 🧠 Carrega ou inicializa o arquivo
function loadCoinsDB() {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

// 💾 Salva o banco de moedas
function saveCoinsDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ➕ Adiciona moedas
function addCoins(userId, amount) {
  const db = loadCoinsDB();
  if (!db[userId]) {
    db[userId] = 0;
  }
  db[userId] += amount;
  saveCoinsDB(db);
}

// 📊 Recupera saldo
function getCoins(userId) {
  const db = loadCoinsDB();
  return db[userId] || 0;
}

// ➖ Remove moedas
function removeCoins(userId, amount) {
  const db = loadCoinsDB();
  if (!db[userId]) return false;
  if (db[userId] < amount) return false;
  db[userId] -= amount;
  saveCoinsDB(db);
  return true;
}

// ✅ Define valor fixo de moedas
function setCoins(userId, amount) {
  const db = loadCoinsDB();
  db[userId] = amount;
  saveCoinsDB(db);
}

module.exports = {
  addCoins,
  getCoins,
  removeCoins,
  setCoins, 
};
