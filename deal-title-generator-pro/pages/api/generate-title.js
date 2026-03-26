
    export default async function handler(req, res) {
      try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "Missing URL" });

        const asinMatch = url.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
        if (!asinMatch) return res.status(400).json({ error: "Invalid URL" });

        const asin = asinMatch[1];

        const rainforestRes = await fetch(
          `https://api.rainforestapi.com/request?api_key=${process.env.RAINFOREST_API_KEY}&type=product&amazon_domain=amazon.com&asin=${asin}`
        );

        const data = await rainforestRes.json();
        const product = data.product;

        const productData = {
          title: product.title,
          brand: product.brand,
          features: product.feature_bullets,
          price: product.buybox_winner?.price?.value || product.price?.value
        };

        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-5",
            messages: [{
              role: "user",
              content: `Generate a 60-120 char deal title:

${JSON.stringify(productData)}

Format:
[Brand] [Model] [Key Specs] [Product Type] $[Price]

Rules:
- No fluff
- 1-3 specs only
- Clean output
- Price at end

Output only title.`
            }]
          })
        });

        const aiData = await aiRes.json();
        let title = aiData.choices[0].message.content.trim().replace(/"/g, "");

        if (title.length < 60 || title.length > 120) {
          title = title.slice(0, 120);
        }

        res.status(200).json({ title });

      } catch (e) {
        res.status(500).json({ error: "Server error" });
      }
    }
