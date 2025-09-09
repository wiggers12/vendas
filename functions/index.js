// ----------------- IMPORTS -----------------
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const admin = require("firebase-admin");

// ----------------- INICIALIZAÇÃO -----------------
admin.initializeApp();
const db = admin.firestore();
const app = express();

// ----------------- MIDDLEWARE -----------------
app.use(cors({ origin: true }));
app.use(express.json());

// ----------------- CONFIGURAÇÃO MERCADO PAGO -----------------
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN // ⚠️ Configure no Firebase com: firebase functions:secrets:set MP_ACCESS_TOKEN
});

// ----------------- ROTA PARA CRIAR PREFERÊNCIA -----------------
app.post("/create_preference", async (req, res) => {
  try {
    const preferenceData = {
      items: [
        {
          id: "assinatura-dashcontrol",
          title: "Assinatura DashControl Business",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 29.90
        }
      ],
      payer: {
        email: req.body.email || "teste@dashcontrol.com"
      },
      back_urls: {
        success: "https://dashcontrol-vendas.web.app/",
        failure: "https://dashcontrol-vendas.web.app/",
        pending: "https://dashcontrol-vendas.web.app/"
      },
      auto_return: "approved"
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    console.log("Preferência criada com ID:", result.id);
    res.json({ id: result.id });

  } catch (error) {
    console.error("❌ Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// ----------------- ROTA DE WEBHOOK -----------------
app.post("/webhook-mercadopago", async (req, res) => {
  console.log("---------- Webhook Recebido ----------");
  const notification = req.body;

  try {
    if (notification.type === "payment") {
      const paymentId = notification.data.id;
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: paymentId });

      if (paymentDetails.status === "approved") {
        console.log(`✅ Pagamento ${paymentId} aprovado`);

        const payerEmail = paymentDetails.payer.email;

        // Atualiza Firestore → libera plano
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", payerEmail).get();

        if (!snapshot.empty) {
          snapshot.forEach(async (doc) => {
            await db.collection("users").doc(doc.id).update({
              planoAtivo: true,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          });
        } else {
          console.log(`⚠️ Usuário ${payerEmail} não encontrado no Firestore`);
        }
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    res.status(500).send("Erro no servidor ao processar webhook");
  }
});

// ----------------- EXPORTA API -----------------
exports.api = functions.https.onRequest(app);
