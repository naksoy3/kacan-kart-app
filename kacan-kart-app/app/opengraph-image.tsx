import { ImageResponse } from "next/og";

export const alt = "Kaçan Kart | Soru kartı, istediğin cevabı al.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080d1d",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1711c9",
              fontSize: 82,
              fontWeight: 700,
              letterSpacing: -5,
            }}
          >
            ca
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 82, fontWeight: 700 }}>Kaçan Kart</div>
            <div style={{ marginTop: 14, fontSize: 32, color: "#c4c9de" }}>
              Soru kartı, istediğin cevabı al.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
