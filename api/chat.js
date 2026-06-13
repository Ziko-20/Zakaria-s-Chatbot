const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "llama-3.3-70b-versatile",
    });

    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Groq API error", details: err.message });
  }
};