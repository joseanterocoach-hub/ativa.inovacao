# 🚀 Guia de Deploy — Ativa Sergipe no Vercel

Tempo estimado: **20–30 minutos**. Sem precisar de programador.

---

## PASSO 1 — Criar conta no GitHub (se ainda não tiver)

1. Acesse https://github.com e clique em **Sign up**
2. Use seu e-mail e crie uma senha
3. Confirme o e-mail

---

## PASSO 2 — Criar o repositório e subir o código

1. No GitHub, clique em **"New repository"** (botão verde no canto superior direito)
2. Dê o nome: `ativa-sergipe`
3. Deixe como **Private** ✅
4. Clique em **"Create repository"**
5. Na próxima tela, clique em **"uploading an existing file"**
6. Arraste **toda a pasta do projeto** ou selecione todos os arquivos
7. Clique em **"Commit changes"**

---

## PASSO 3 — Criar conta no Vercel

1. Acesse https://vercel.com
2. Clique em **"Sign up"** → **"Continue with GitHub"**
3. Autorize o Vercel a acessar seu GitHub

---

## PASSO 4 — Criar o banco de dados (Upstash Redis) — GRATUITO

1. Acesse https://console.upstash.com
2. Clique em **"Create Database"**
3. Escolha o nome: `ativa-sergipe`
4. Região: **South America (São Paulo)** 🇧🇷
5. Tipo: **Regional** (gratuito)
6. Clique em **"Create"**
7. Na tela do banco, role até **"REST API"**
8. Copie e guarde:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## PASSO 5 — Configurar login Google (OAuth)

1. Acesse https://console.cloud.google.com
2. Clique em **"Selecionar projeto"** → **"Novo projeto"**
   - Nome: `Ativa Sergipe`
3. No menu lateral: **APIs e Serviços** → **Tela de consentimento OAuth**
   - Tipo de usuário: **Externo** → Salvar
   - Preencha: Nome do app = `Ativa Sergipe`, e-mail de suporte = seu e-mail
   - Salvar e continuar (próximas telas pode deixar em branco)
4. No menu lateral: **APIs e Serviços** → **Credenciais**
5. Clique em **"+ Criar credenciais"** → **"ID do cliente OAuth"**
   - Tipo: **Aplicativo da Web**
   - Nome: `Ativa Sergipe Web`
   - **Origens JavaScript autorizadas**: `https://seu-app.vercel.app`
   - **URIs de redirecionamento autorizados**: `https://seu-app.vercel.app/api/auth/callback/google`
   - Clique em **"Criar"**
6. Copie e guarde:
   - `Client ID` (algo como `123456789-abc.apps.googleusercontent.com`)
   - `Client Secret`

---

## PASSO 6 — Fazer o deploy no Vercel

1. No Vercel, clique em **"Add New Project"**
2. Selecione o repositório `ativa-sergipe` do GitHub
3. Clique em **"Deploy"** (deixe as configurações padrão)
4. Aguarde o deploy terminar (≈ 2 min)
5. Copie a URL gerada (ex: `https://ativa-sergipe-xyz.vercel.app`)

---

## PASSO 7 — Configurar as variáveis de ambiente no Vercel

1. No painel do Vercel, vá em: **Settings** → **Environment Variables**
2. Adicione **uma a uma** as variáveis abaixo:

| Nome | Valor |
|------|-------|
| `GOOGLE_CLIENT_ID` | o Client ID do passo 5 |
| `GOOGLE_CLIENT_SECRET` | o Client Secret do passo 5 |
| `NEXTAUTH_SECRET` | uma senha aleatória longa (ex: `minha-chave-super-secreta-2024-sebrae`) |
| `NEXTAUTH_URL` | a URL do seu app (ex: `https://ativa-sergipe-xyz.vercel.app`) |
| `ALLOWED_EMAILS` | e-mails separados por vírgula (ex: `joao@gmail.com,maria@sebrae.com.br`) |
| `UPSTASH_REDIS_REST_URL` | a URL do Upstash do passo 4 |
| `UPSTASH_REDIS_REST_TOKEN` | o token do Upstash do passo 4 |

3. Clique em **"Save"**

---

## PASSO 8 — Atualizar as URLs no Google Cloud e fazer redeploy

1. Volte ao Google Cloud Console → Credenciais → edite o OAuth criado
2. Atualize as URLs com a URL real do seu Vercel:
   - **Origens**: `https://ativa-sergipe-xyz.vercel.app`
   - **Redirecionamento**: `https://ativa-sergipe-xyz.vercel.app/api/auth/callback/google`
3. Salve
4. No Vercel: clique em **"Redeploy"** para aplicar as variáveis de ambiente

---

## ✅ Pronto!

Acesse a URL do seu app, clique em **"Entrar com Google"** e o sistema estará funcionando.

### Para adicionar novos usuários:
No Vercel → Settings → Environment Variables → edite `ALLOWED_EMAILS` e adicione o novo e-mail separado por vírgula → Redeploy.

---

## Dúvidas frequentes

**O login deu erro "AccessDenied"?**
→ O e-mail não está na lista `ALLOWED_EMAILS`. Adicione e faça Redeploy.

**Esqueci de gerar o NEXTAUTH_SECRET?**
→ Use qualquer texto longo e aleatório. Ex: `sebrae-inovacao-sergipe-2024-chave-secreta`

**Os dados sumiram?**
→ Os dados ficam no Upstash Redis. Verifique se as variáveis `UPSTASH_*` estão corretas.
