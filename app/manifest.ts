import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ToumAnina — طُمَأْنِينَة",
    short_name: "ToumAnina",
    description:
      "Application d'accompagnement des personnes atteintes d'Alzheimer et de leurs familles. Localisation, suivi d'humeur, activités adaptées — tout en un.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4FAFC",
    theme_color: "#63C7B2",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
