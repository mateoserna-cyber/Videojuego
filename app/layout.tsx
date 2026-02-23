import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GCP Quest — RPG de Aprendizaje",
  description: "12 meses de misiones reales para dominar GCP y Data Engineering",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
