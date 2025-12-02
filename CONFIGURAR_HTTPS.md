# 🔒 Configurar HTTPS no Frontend

## ⚠️ Problema Atual

O S3 Website Hosting **NÃO suporta HTTPS**. Você só pode acessar via HTTP:
```
❌ https://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
✅ http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```

## 🎯 Solução: CloudFront + HTTPS

Para ter HTTPS, você precisa usar o **CloudFront** (CDN da AWS).

---

## 📋 Opções Disponíveis

### Opção 1: CloudFront com Domínio Próprio (Recomendado)
- ✅ HTTPS gratuito com certificado SSL da AWS
- ✅ Domínio personalizado (ex: milhastrade.com)
- ✅ CDN global (mais rápido)
- ⚠️ Requer domínio próprio

### Opção 2: CloudFront com Domínio CloudFront
- ✅ HTTPS gratuito
- ✅ Não precisa de domínio próprio
- ✅ CDN global
- ⚠️ URL será algo como: d1234abcd.cloudfront.net

### Opção 3: Manter HTTP (Temporário)
- ✅ Funciona agora
- ✅ Sem custo adicional
- ❌ Sem HTTPS
- ❌ Navegadores mostram "Não seguro"

---

## 🚀 Passo a Passo: CloudFront (Opção 2 - Mais Simples)

### 1. Criar Distribuição CloudFront

1. Acesse: https://console.aws.amazon.com/cloudfront/
2. Clique em **Create Distribution**

### 2. Configurar Origin (Origem)

**Origin Domain:**
```
milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```

⚠️ **IMPORTANTE:** Use o endpoint de **website**, não o endpoint de bucket!

**Origin Path:** (deixe vazio)

**Name:** `milhastrade-frontend-s3`

**Origin Access:** `Public`

### 3. Configurar Default Cache Behavior

**Viewer Protocol Policy:** `Redirect HTTP to HTTPS`

**Allowed HTTP Methods:** `GET, HEAD, OPTIONS`

**Cache Policy:** `CachingOptimized`

**Origin Request Policy:** (None)

### 4. Configurar Settings

**Price Class:** `Use only North America and Europe` (mais barato)

**Alternate Domain Names (CNAMEs):** (deixe vazio por enquanto)

**Custom SSL Certificate:** `Default CloudFront Certificate (*.cloudfront.net)`

**Default Root Object:** `index.html`

### 5. Configurar Error Pages (Importante para React Router)

Depois de criar a distribuição, adicione:

1. Vá para a aba **Error Pages**
2. Clique em **Create Custom Error Response**

**Configuração 1:**
- HTTP Error Code: `403`
- Customize Error Response: `Yes`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`

**Configuração 2:**
- HTTP Error Code: `404`
- Customize Error Response: `Yes`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`

### 6. Criar Distribuição

Clique em **Create Distribution**

⏳ **Aguarde 10-15 minutos** para a distribuição ser criada e propagada.

---

## 🔧 Atualizar Frontend para Usar CloudFront

### 1. Copiar URL do CloudFront

Após a distribuição ser criada, você verá algo como:
```
https://d1234abcd5678.cloudfront.net
```

### 2. Atualizar Configurações (Opcional)

Se quiser, pode atualizar o CORS do backend para aceitar o domínio CloudFront:

**backend/.env:**
```env
CORS_ORIGINS=http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com,https://d1234abcd5678.cloudfront.net,http://44.221.82.103:5000
```

### 3. Testar

Acesse: `https://d1234abcd5678.cloudfront.net`

✅ Agora você tem HTTPS!

---

## 🔄 Invalidar Cache do CloudFront

Sempre que fizer deploy de uma nova versão:

### Via Console:
1. Acesse sua distribuição no CloudFront
2. Vá para a aba **Invalidations**
3. Clique em **Create Invalidation**
4. Digite: `/*`
5. Clique em **Create**

### Via CLI:
```powershell
aws cloudfront create-invalidation --distribution-id SEU_DISTRIBUTION_ID --paths "/*"
```

---

## 💰 Custos

### CloudFront (Nível Gratuito)
- ✅ **1 TB** de transferência de dados por mês (GRÁTIS)
- ✅ **10 milhões** de requisições HTTP/HTTPS por mês (GRÁTIS)
- ✅ **2 milhões** de invalidações por mês (GRÁTIS)

Para um site pequeno/médio, você provavelmente ficará no nível gratuito!

---

## 🎯 Opção 1: CloudFront com Domínio Próprio

Se você tiver um domínio (ex: milhastrade.com):

### 1. Registrar Domínio

Você pode registrar em:
- **Route 53** (AWS) - ~$12/ano
- **Registro.br** - R$ 40/ano
- **GoDaddy, Namecheap, etc.**

### 2. Solicitar Certificado SSL (GRÁTIS)

1. Acesse: https://console.aws.amazon.com/acm/
2. Clique em **Request Certificate**
3. **Certificate Type:** `Request a public certificate`
4. **Domain Names:** 
   - `milhastrade.com`
   - `www.milhastrade.com`
5. **Validation Method:** `DNS validation`
6. Clique em **Request**

### 3. Validar Domínio

Siga as instruções para adicionar os registros DNS no seu provedor de domínio.

### 4. Configurar CloudFront

Ao criar a distribuição CloudFront:
- **Alternate Domain Names:** `milhastrade.com, www.milhastrade.com`
- **Custom SSL Certificate:** Selecione o certificado que você criou

### 5. Configurar DNS

No Route 53 ou seu provedor de DNS:
- Crie um registro **A** (Alias) apontando para a distribuição CloudFront
- Crie um registro **CNAME** para `www` apontando para o CloudFront

---

## 🆘 Solução Temporária: Usar HTTP

Se você não quiser configurar CloudFront agora:

### 1. Use HTTP (sem S)
```
http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```

### 2. Atualizar Backend CORS

Certifique-se de que o backend aceita requisições HTTP:

**backend/.env:**
```env
CORS_ORIGINS=http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com,http://44.221.82.103:5000
```

### 3. Avisar Usuários

Adicione um aviso no site:
```
⚠️ Site em desenvolvimento - Conexão HTTP temporária
```

---

## 📊 Comparação

| Recurso | S3 HTTP | CloudFront HTTPS | CloudFront + Domínio |
|---------|---------|------------------|----------------------|
| HTTPS | ❌ | ✅ | ✅ |
| Custo | Grátis | Grátis* | Grátis* + Domínio |
| Velocidade | Normal | Rápido (CDN) | Rápido (CDN) |
| URL Personalizada | ❌ | ❌ | ✅ |
| Profissional | ❌ | ⚠️ | ✅ |

*Dentro do nível gratuito

---

## 🎯 Recomendação

### Para Desenvolvimento/Teste:
✅ Use **HTTP** (S3 direto) - Mais simples

### Para Produção:
✅ Use **CloudFront com Domínio Próprio** - Mais profissional

### Para MVP/Demo:
✅ Use **CloudFront sem Domínio** - Bom equilíbrio

---

## 📝 Checklist CloudFront

- [ ] Criar distribuição CloudFront
- [ ] Configurar origin (S3 website endpoint)
- [ ] Configurar error pages (403 e 404)
- [ ] Aguardar propagação (10-15 min)
- [ ] Testar URL CloudFront
- [ ] Atualizar CORS no backend (se necessário)
- [ ] Criar invalidação após cada deploy

---

## 🔗 Links Úteis

- **CloudFront Console:** https://console.aws.amazon.com/cloudfront/
- **ACM (Certificados):** https://console.aws.amazon.com/acm/
- **Route 53 (DNS):** https://console.aws.amazon.com/route53/

---

## 💡 Dica

Se você está apenas testando, pode usar HTTP por enquanto. Quando for lançar oficialmente, configure o CloudFront com domínio próprio para ter uma URL profissional com HTTPS.

**Exemplo:**
- 🧪 Desenvolvimento: `http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com`
- 🚀 Produção: `https://milhastrade.com`
