# 📁 Estrutura Correta no S3

## ✅ Como Deve Estar no Bucket

Quando você abrir o bucket no console S3, deve ver exatamente isso na raiz:

```
milhastrade-frontend-mayrus/
├── index.html
├── favicon-16x16.svg
├── favicon-32x32.svg
├── favicon.svg
├── logo-milhastrade.svg
└── assets/
    ├── index-b4558bdd.css
    └── index-eb007d6a.js
```

## ❌ Como NÃO Deve Estar

```
milhastrade-frontend-mayrus/
└── dist/
    ├── index.html
    └── assets/
```

Se você vê uma pasta `dist/` no bucket, está errado!

---

## 🔧 Como Corrigir

### Opção 1: Deletar e Refazer Upload

1. **Deletar tudo do bucket:**
   - Acesse: https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus?tab=objects
   - Selecione TUDO (checkbox no topo)
   - Clique em **Delete**
   - Digite `permanently delete` e confirme

2. **Fazer upload correto:**
   - Clique em **Upload**
   - No Windows Explorer, navegue até:
     ```
     C:\Users\mayru\Documents\Projeto - Site de milhas\frontend\dist
     ```
   - **ENTRE na pasta dist**
   - Selecione TUDO que está dentro (Ctrl+A)
   - Arraste para a janela do S3
   - Clique em **Upload**

### Opção 2: Upload Manual Arquivo por Arquivo

1. **Upload do index.html:**
   - Clique em **Upload**
   - Clique em **Add files**
   - Selecione: `frontend/dist/index.html`
   - Upload

2. **Upload dos SVGs:**
   - Clique em **Upload**
   - Clique em **Add files**
   - Selecione todos os arquivos `.svg` de `frontend/dist/`
   - Upload

3. **Upload da pasta assets:**
   - Clique em **Upload**
   - Clique em **Add folder**
   - Selecione a pasta: `frontend/dist/assets`
   - Upload

---

## 🧪 Verificar se Está Correto

1. Acesse: https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus?tab=objects

2. Você deve ver na lista:
   - ✅ `index.html` (Type: html)
   - ✅ `favicon-16x16.svg` (Type: svg)
   - ✅ `favicon-32x32.svg` (Type: svg)
   - ✅ `favicon.svg` (Type: svg)
   - ✅ `logo-milhastrade.svg` (Type: svg)
   - ✅ `assets/` (Type: Folder)

3. Clique na pasta `assets/` e veja:
   - ✅ `index-b4558bdd.css`
   - ✅ `index-eb007d6a.js`

---

## 🌐 Acessar o Site

Depois de corrigir a estrutura:

1. Vá em **Properties** → **Static website hosting**
2. Copie a URL do **Bucket website endpoint**
3. Abra em modo anônimo (Ctrl+Shift+N)

A URL deve ser:
```
http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```

---

## 📸 Tire uma Screenshot

Se ainda não funcionar, tire uma screenshot de:
1. A lista de arquivos no bucket (aba Objects)
2. A configuração do Static website hosting (aba Properties)
3. O erro que aparece no navegador

Isso vai me ajudar a identificar o problema!
