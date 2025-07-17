require("dotenv").config();
const express = require("express");
const { create, ev } = require("@open-wa/wa-automate");
const app = express();

let qrCodeBase64 = "";

create({
  sessionId: "defjoias",
  multiDevice: true,
  qrTimeout: 0,
  authTimeout: 0,
  headless: true,
  useChrome: false,
  disableSpins: true,
  logConsole: false,
  popup: false
}).then(client => {
  console.log("✅ WhatsApp conectado!");
}).catch(err => console.error("Erro ao iniciar o WhatsApp:", err));

ev.on("qr.**", async qrcode => {
  qrCodeBase64 = `data:image/png;base64,${qrcode}`;
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  if (!qrCodeBase64) {
    res.render("qr", { imageUrl: null });
  } else {
    res.render("qr", { imageUrl: qrCodeBase64 });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
