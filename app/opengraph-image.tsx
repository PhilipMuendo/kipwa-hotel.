import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}: ${site.tagline}, Mombasa`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: the arch at sunrise on a lime-washed wall. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: site.brand.bone, color: site.brand.ink, fontFamily: "serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: 720 }}>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: site.brand.clay }}>{site.tagline} · Mombasa</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 104, lineHeight: 0.95, letterSpacing: -3 }}>
            <span>The tide</span>
            <span>keeps the time.</span>
          </div>
          <div style={{ display: "flex", fontSize: 44 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", width: 480, paddingBottom: 0 }}>
          <div
            style={{
              display: "flex",
              width: 320,
              height: 520,
              borderTopLeftRadius: 160,
              borderTopRightRadius: 160,
              background: "linear-gradient(180deg, #9aa6b8 0%, #f2c39f 55%, #f8d7a8 62%, #24323e 63%, #0e1a22 100%)",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
