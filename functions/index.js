const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

admin.initializeApp();
const db = admin.firestore();

// Config Mercado Pago
mercadopago.configure({
  access_token: "APP_USR-3928136166022826-090909-0888df7f4d56128a97071eee81703b4d-2668676373" // ⚠️ NÃO usar a Public Key, só Access Token privada
});

// Webhook Mercado Pago → atualiza Firestore
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const payment = await mercadopago.payment.findById(data.id);

      if (payment.body.status === "approved") {
        const emailCliente = payment.body.payer.email;

        // Procura usuário pelo email no Firestore
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
