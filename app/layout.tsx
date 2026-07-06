import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Ativa Sergipe — Inovação nos Territórios",
  description: "Acompanhamento da ativação de inovação nos municípios de Sergipe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: "#FAF7F2" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
