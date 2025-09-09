const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

admin.initializeApp();
const db = admin.firestore();

// Config Mercado Pago com Access Token (backend)
mercadopago.configure({
  access_token: "APP_USR-3928136166022826-090909-0888df7f4d56128a97071eee81703b4d-2668676373" // ⚠️ mantenha privado
});

// ==============================
// 1) Webhook → confirma pagamento
// ==============================
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const payment = await mercadopago.payment.findById(data.id);

      if (payment.body.status === "approved") {
        const emailCliente = payment.body.payer.email;

        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", emailCliente).get();

        if (!snapshot.empty) {
          snapshot.forEach(async (doc) => {
            await db.collection("users").doc(doc.id).update({ planoAtivo: true });
          });
        }

        console.log(`Pagamento aprovado para ${emailCliente}`);
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.sendStatus(500);
  }
});

// ========================================
// 2) Criar preferência → gerar ID pro front
// ========================================
exports.criarPreferencia = functions.https.onRequest(async (req, res) => {
  try {
    const { email } = req.body;

    let preference = {
      items: [
        {
          title: "Assinatura DashControl Business",
          unit_price: 29.90,
          quantity: 1,
          currency_id: "BRL"
        }
      ],
      payer: { email: email },
      back_urls: {
        success: "https://dashcontrol-vendas.web.app/",
        failure: "https://dashcontrol-vendas.web.app/",
        pending: "https://dashcontrol-vendas.web.app/"
      },
      auto_return: "approved"
    };

    const resposta = await mercadopago.preferences.create(preference);
    return res.status(200).json({ id: resposta.body.id });
  } catch (err) {
    console.error("Erro ao criar preferência:", err);
    return res.sendStatus(500);
  }
});
