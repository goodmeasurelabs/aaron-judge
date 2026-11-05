import { ImageResponse } from "next/og";

// Original geometric artwork: no team marks, athlete likeness, or licensed photography.
export function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#101e31", color: "#fff", padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", width: 760 }}>
        <div style={{ fontSize: 24, color: "#93c5fd", letterSpacing: 5 }}>FOR THE LOVE OF BASEBALL</div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 28 }}>AaronJudge.net</div>
        <div style={{ fontSize: 30, marginTop: 24 }}>Stats · Schedule · News</div>
        <div style={{ fontSize: 24, color: "#cbd5e1", marginTop: 70 }}>UNOFFICIAL FAN SITE</div>
      </div>
      <div style={{ display: "flex", width: 230, height: 230, borderRadius: "50%", background: "#f8fafc", border: "12px solid #93c5fd", alignItems: "center", justifyContent: "center", transform: "rotate(-25deg)" }}>
        <div style={{ display: "flex", width: 95, height: 205, borderLeft: "7px dashed #dc4c5e", borderRight: "7px dashed #dc4c5e", borderRadius: "50%" }} />
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
