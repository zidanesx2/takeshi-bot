const fs = require("fs");
const path = "./db/levels.json";


if (!fs.existsSync("./db")) fs.mkdirSync("./db");
if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");


function addXP(userId, amount = 10) {
  const db = JSON.parse(fs.readFileSync(path));

  if (!db[userId]) {
    db[userId] = { xp: 0, level: 1 };
  }

  db[userId].xp += amount;

  const xpToNext = db[userId].level * 100;
  let levelUp = false;

  if (db[userId].xp >= xpToNext) {
    db[userId].xp -= xpToNext;
    db[userId].level++;
    levelUp = true;
  }

  fs.writeFileSync(path, JSON.stringify(db, null, 2));
  return { levelUp, level: db[userId].level };
}


function getUserLevel(userId) {
  const db = JSON.parse(fs.readFileSync(path));
  if (!db[userId]) return { xp: 0, level: 1 };
  return db[userId];
}

module.exports = { addXP, getUserLevel };
