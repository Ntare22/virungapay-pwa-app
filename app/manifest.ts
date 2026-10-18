import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VirungaPay",
    short_name: "VirungaPay",
    description: "Wallets for tour operators, guides, and drivers across East Africa.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#1F4D3A",
    theme_color: "#1F4D3A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
