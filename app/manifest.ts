import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VirungaPay",
    short_name: "VirungaPay",
    description: "Wallets for tour operators, guides, and drivers across East Africa.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F8FF",
    theme_color: "#2A2AFF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
