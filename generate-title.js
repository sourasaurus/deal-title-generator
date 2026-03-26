export default async function handler(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    // 🔹 STEP 1: Extract ASIN from Amazon URL
    const asinMatch = url.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
    if (!asinMatch) {
      return res.status(400).json({ error: "Invalid Amazon URL" });
    }
    const asin = asinMatch[1];

    // 🔹 STEP 2: Fetch product data (Rainforest API)
    const rainforestRes = await fetch(
      `https://api.rainforestapi.com/request?api_key=${process.env.RAINFOREST_API_KEY}&type=product&amazon_domain=amazon.com&asin=${asin}`
    );

    const rainforestData = await rainforestRes.json();

    const product = rainforestData.product;

    const productData = {
      title: product.title,
      brand: product.brand,
      features: product.feature_bullets,
      price: product.buybox_winner?.price?.value || product.price?.value
    };

    // 🔹 STEP 3: Send to OpenAI
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You generate short, clean deal titles."
          },
          {
            role: "user",
            content: `
Generate a deal title from this product data:

${JSON.stringify(productData)}

Format:
[Brand] [Model/Series] [Key Specs] [Size/Capacity if relevant] [Product Type] $[Price]

Rules:
- 60–120 characters
- No fluff words
- Keep only 1–3 key specs
- Clean and readable
- Price at end

Output only final title.
            `
          }
        ]
      })
    });

    const aiData = await aiRes.json();
    const title = aiData.choices[0].message.content.trim();

    return res.status(200).json({ title });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}