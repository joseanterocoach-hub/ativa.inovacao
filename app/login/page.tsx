"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Zap } from "lucide-react";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  if (status === "loading") return null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1F4D3D 0%, #2D6B55 50%, #1a3d30 100%)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 400, width: "90%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)", textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{
          width: 60, height: 60, borderRadius: 16, background: "#1F4D3D",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Zap size={28} color="#F4C95D" strokeWidth={2.4} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2A2520", margin: "0 0 6px" }}>
          Ativa Sergipe
        </h1>
        <p style={{ fontSize: 14, color: "#9C9286", margin: "0 0 32px" }}>
          Inovação nos Territórios · Sebrae/SE
        </p>

        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10,
            padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#B91C1C",
          }}>
            {error === "AccessDenied"
              ? "Seu e-mail não está autorizado. Solicite acesso ao administrador."
              : "Erro ao fazer login. Tente novamente."}
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 12,
            border: "1.5px solid #E5DDD0", background: "#fff",
            fontSize: 15, fontWeight: 600, color: "#2A2520",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            transition: "all .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#FAF7F2")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          {/* Google icon SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </button>

        <p style={{ fontSize: 12, color: "#C5BAB0", marginTop: 24 }}>
          Acesso restrito à equipe Sebrae/SE autorizada
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
