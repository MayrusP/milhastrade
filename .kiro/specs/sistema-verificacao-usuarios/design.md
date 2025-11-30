# Sistema de Verificação de Usuários - Design Técnico

## Visão Geral

Sistema completo de verificação de identidade que permite aos usuários enviar documentos oficiais para análise administrativa, resultando em status de "usuário verificado" que aumenta a confiança na plataforma.

## Arquitetura

### Componentes Principais

1. **Upload de Documentos** - Interface para envio de imagens
2. **Painel Administrativo** - Interface para análise de documentos
3. **Sistema de Notificações** - Comunicação de status
4. **Badge de Verificação** - Indicadores visuais
5. **API de Verificação** - Endpoints backend

### Fluxo de Dados

```
Usuário → Upload Documentos → Análise Admin → Aprovação/Rejeição → Badge Verificado
```

## Modelo de Dados

### Tabela: user_verifications

```sql
CREATE TABLE user_verifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  status ENUM('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'NOT_SUBMITTED',
  document_type ENUM('RG', 'CNH') NOT NULL,
  document_front_url VARCHAR(500),
  document_back_url VARCHAR(500),
  rejection_reason TEXT,
  reviewed_by VARCHAR(36),
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_verifications_user_id (user_id),
  INDEX idx_user_verifications_status (status)
);
```

### Atualização Tabela: users

```sql
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD INDEX idx_users_is_verified (is_verified);
```

## Componentes Frontend

### 1. VerificationSection (ProfilePage)

**Localização:** `frontend/src/components/verification/VerificationSection.tsx`

**Props:**
```typescript
interface VerificationSectionProps {
  userId: string;
  currentStatus: VerificationStatus;
  onStatusChange: (status: VerificationStatus) => void;
}
```

**Estados:**
- `NOT_SUBMITTED`: Formulário de upload
- `PENDING`: Status de aguardando análise
- `APPROVED`: Badge de verificado
- `REJECTED`: Motivo + opção de reenvio

### 2. DocumentUploadForm

**Localização:** `frontend/src/components/verification/DocumentUploadForm.tsx`

**Funcionalidades:**
- Upload de frente e verso
- Validação de formato (JPG, PNG, PDF)
- Validação de tamanho (máx 5MB)
- Preview das imagens
- Seleção de tipo de documento

### 3. AdminVerificationPanel

**Localização:** `frontend/src/components/admin/AdminVerificationPanel.tsx`

**Funcionalidades:**
- Lista de verificações pendentes
- Visualização ampliada de documentos
- Botões de aprovar/rejeitar
- Campo de motivo para rejeição
- Histórico de verificações

### 4. VerificationBadge

**Localização:** `frontend/src/components/verification/VerificationBadge.tsx`

**Variações:**
- Badge completo (perfil público)
- Ícone pequeno (listas)
- Tooltip explicativo

## Endpoints API

### POST /api/user/verification/upload

**Descrição:** Upload de documentos para verificação

**Body:**
```json
{
  "documentType": "RG" | "CNH",
  "frontImage": "base64_string",
  "backImage": "base64_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documentos enviados para análise",
  "data": {
    "verificationId": "uuid",
    "status": "PENDING"
  }
}
```

### GET /api/user/verification/status

**Descrição:** Obter status atual da verificação

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "PENDING",
    "submittedAt": "2024-01-01T10:00:00Z",
    "rejectionReason": null
  }
}
```

### GET /api/admin/verifications/pending

**Descrição:** Listar verificações pendentes (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "verifications": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "João Silva",
          "email": "joao@email.com"
        },
        "documentType": "RG",
        "frontImageUrl": "/uploads/doc_front_uuid.jpg",
        "backImageUrl": "/uploads/doc_back_uuid.jpg",
        "submittedAt": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

### PUT /api/admin/verifications/:id/review

**Descrição:** Aprovar ou rejeitar verificação (admin only)

**Body:**
```json
{
  "action": "APPROVE" | "REJECT",
  "rejectionReason": "Documento ilegível" // obrigatório se REJECT
}
```

## Armazenamento de Arquivos

### Estrutura de Diretórios

```
backend/uploads/
├── verifications/
│   ├── user_uuid/
│   │   ├── front_timestamp.jpg
│   │   └── back_timestamp.jpg
```

### Configuração Multer

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = `uploads/verifications/${req.user.userId}`;
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const side = file.fieldname; // 'front' ou 'back'
    cb(null, `${side}_${timestamp}.${file.originalname.split('.').pop()}`);
  }
});
```

## Integração com Sistema Existente

### 1. Perfil Público

**Arquivo:** `frontend/src/pages/PublicProfilePage.tsx`

**Modificações:**
- Adicionar campo `isVerified` na interface
- Exibir `VerificationBadge` na seção de confiabilidade
- Atualizar endpoint backend para incluir status

### 2. Marketplace

**Arquivo:** `frontend/src/pages/MarketplacePage.tsx`

**Modificações:**
- Adicionar filtro "Apenas usuários verificados"
- Exibir ícone de verificação nas ofertas
- Priorizar usuários verificados na ordenação

### 3. Dashboard Admin

**Arquivo:** `frontend/src/pages/AdminDashboardPage.tsx`

**Modificações:**
- Adicionar aba "Verificações Pendentes"
- Incluir estatísticas de verificação
- Integrar `AdminVerificationPanel`

## Segurança e Validações

### Frontend
- Validação de tipos de arquivo
- Compressão de imagens antes do upload
- Preview seguro sem execução de scripts
- Rate limiting para uploads

### Backend
- Validação de autenticação
- Verificação de roles para endpoints admin
- Sanitização de nomes de arquivos
- Verificação de tipos MIME reais
- Limite de tamanho por arquivo e por usuário

## Notificações

### Tipos de Notificação

1. **Verificação Aprovada**
   - Título: "✅ Verificação Aprovada!"
   - Mensagem: "Parabéns! Sua identidade foi verificada com sucesso."

2. **Verificação Rejeitada**
   - Título: "❌ Verificação Rejeitada"
   - Mensagem: "Sua verificação foi rejeitada. Motivo: {reason}"

3. **Nova Verificação Pendente** (Admin)
   - Título: "📋 Nova Verificação Pendente"
   - Mensagem: "Usuário {name} enviou documentos para análise."

## Métricas e Analytics

### Dashboard Admin
- Total de usuários verificados
- Verificações pendentes
- Taxa de aprovação/rejeição
- Tempo médio de análise
- Verificações por administrador

### Relatórios
- Usuários verificados vs não verificados
- Impacto da verificação nas transações
- Tipos de documento mais enviados
- Principais motivos de rejeição

## Considerações de UX

### Estados de Loading
- Spinner durante upload
- Barra de progresso para arquivos grandes
- Feedback visual de sucesso/erro

### Responsividade
- Upload funcional em mobile
- Visualização de documentos adaptável
- Interface admin otimizada para desktop

### Acessibilidade
- Alt text para imagens
- Navegação por teclado
- Contraste adequado para badges
- Screen reader friendly

## Fases de Implementação

### Fase 1: Estrutura Base
- Modelo de dados
- Endpoints básicos
- Upload de documentos

### Fase 2: Interface Usuário
- Componente de upload
- Seção no perfil
- Status de verificação

### Fase 3: Painel Admin
- Interface de análise
- Aprovação/rejeição
- Histórico

### Fase 4: Integração Visual
- Badges nos perfis
- Filtros no marketplace
- Notificações

### Fase 5: Melhorias
- Analytics
- Otimizações
- Testes de carga