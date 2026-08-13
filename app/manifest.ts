import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Green Mile",
    short_name: "Green Mile",
    description: "US green-card presence & travel-compliance tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e15",
    theme_color: "#0a0e15",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
