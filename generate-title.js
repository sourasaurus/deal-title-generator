const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Generate a clean deal title from:

${JSON.stringify(productData)}

Format:
[Brand] [Model] [Key Specs] [Product Type] $[Price]

Rules:
- 60–120 characters
- No fluff
- 1–3 specs only
- Price at end

Output only title.`
      }
    ]
  })
});

const aiData = await aiRes.json();

// 🔴 ADD THIS DEBUG LINE
console.log("OPENAI RESPONSE:", JSON.stringify(aiData));

// 🔴 SAFE CHECK
if (!aiData.choices || !aiData.choices[0]) {
  return res.status(500).json({ error: "OpenAI failed", details: aiData });
}

const title = aiData.choices[0].message.content
  .replace(/"/g, "")
  .trim();
