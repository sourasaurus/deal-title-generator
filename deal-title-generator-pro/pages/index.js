
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generateTitle = async () => {
    if (!url) return alert("Paste Amazon URL");

    setLoading(true);
    setOutput("");

    const res = await fetch("/api/generate-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    setOutput(data.title || "Error generating title");
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "auto" }}>
      <h2>Deal Title Generator (Pro)</h2>

      <input
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
        placeholder="Paste Amazon URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={generateTitle} style={{ padding: 10, width: "100%" }}>
        {loading ? "Generating..." : "Generate Title"}
      </button>

      {output && (
        <div style={{ marginTop: 20 }}>
          <div style={{ background: "#eee", padding: 10 }}>{output}</div>
          <button onClick={() => navigator.clipboard.writeText(output)}>
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
