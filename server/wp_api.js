require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const WHATSAPP_API_URL =
  "https://graph.facebook.com/v22.0/559259277278898/messages";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Send WhatsApp Template Message

// API to send WhatsApp template message
app.post("/send-template", async (req, res) => {
  const { phone, name, imageUrl, buttonUrl } = req.body;

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "dental_reviews", // ✅ Your WhatsApp template name
          language: { code: "es_MX" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: { link: imageUrl }, // ✅ Image URL for header
                },
              ],
            },
            {
              type: "body",
              parameters: [
                { type: "text", text: name }, // ✅ Name variable
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                { type: "text", text: buttonUrl }, // ✅ Button URL
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error);
    res
      .status(500)
      .json({ success: false, error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
