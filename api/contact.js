const nodemailer = require("nodemailer");
const { Configuration, OpenAIApi } = require("openai");


module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
    return;
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ success: false, message: "Chýbajú povinné údaje" });
      return;
    }

    // Konfigurácia OpenAI API
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY, // alebo priamo tvoj API kľúč
    });
    const openai = new OpenAIApi(configuration);

    // Volanie GPT-4 API
    const aiResponse = await openai.createChatCompletion({
      model: "gpt-4", // Model GPT-4
      messages: [
        { role: "system", content: "Si asistent autosalónu. Odpovedaj profesionálne a jasne." },
        { role: "user", content: message },
      ],
      max_tokens: 200,
    });

    const aiMessage = aiResponse.data.choices[0].message.content.trim();

    // Konfigurácia Nodemailer pre odoslanie e-mailu
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Gmail účet
        pass: process.env.GMAIL_PASS, // App Password
      },
    });

    


    // Odoslanie odpovede e-mailom
    await transporter.sendMail({
      from: "martinsulak18@gmail.com",
      to: email,
      subject: `Odpoveď pre ${name}`,
      text: `Dobrý deň ${name},\n\nĎakujeme za vašu správu:\n\n"${message}"\n\nAutomatická odpoveď:\n"${aiMessage}"\n\nS pozdravom,\nTím autosalónu`,
    });

    


    res.status(200).json({ success: true, message: "E-mail úspešne odoslaný!" });
  } catch (error) {
    console.error("Chyba pri spracovaní požiadavky:", error);
    res.status(500).json({ success: false, message: "Nepodarilo sa spracovať požiadavku." });
  }
};
