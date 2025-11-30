# Design Document - Sistema de Adicionar Créditos

## Overview

Sistema integrado para adicionar créditos às contas dos usuários através de PIX e cartão de crédito, com interface modal moderna e intuitiva. O sistema remove a funcionalidade "Meus Créditos" da página de perfil e centraliza a adição de créditos através do header.

## Architecture

### Frontend Components
- **AddCreditsModal**: Modal principal para seleção de valor e método de pagamento
- **PaymentMethodSelector**: Componente para escolha entre PIX e cartão
- **PixPayment**: Interface específica para pagamento PIX com QR Code
- **CreditCardPayment**: Formulário para dados do cartão de crédito
- **PaymentStatus**: Componente para feedback visual do processo

### Backend Services
- **PaymentService**: Gerenciamento de pagamentos e integração com gateways
- **CreditService**: Controle de saldo e histórico de créditos
- **TransactionService**: Registro e rastreamento de transações

## Components and Interfaces

### AddCreditsModal Component
```typescript
interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

interface PaymentData {
  amount: number;
  method: 'pix' | 'credit_card';
  pixData?: PixPaymentData;
  cardData?: CreditCardData;
}
```

### Payment Interfaces
```typescript
interface PixPaymentData {
  qrCode: string;
  pixKey: string;
  expiresAt: Date;
  transactionId: string;
}

interface CreditCardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
}
```

### API Endpoints
- `POST /api/payments/pix` - Gerar pagamento PIX
- `POST /api/payments/credit-card` - Processar cartão de crédito
- `GET /api/payments/status/:transactionId` - Verificar status do pagamento
- `POST /api/credits/add` - Adicionar créditos à conta

## Data Models

### Payment Transaction
```sql
CREATE TABLE payment_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('pix', 'credit_card') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'expired') NOT NULL,
  pix_data JSON,
  card_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Credit History
```sql
CREATE TABLE credit_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('add', 'spend', 'refund') NOT NULL,
  description TEXT,
  transaction_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id)
);
```

## Error Handling

### Frontend Error States
- **Network Errors**: Retry automático com feedback visual
- **Validation Errors**: Mensagens específicas por campo
- **Payment Errors**: Códigos de erro específicos do gateway
- **Timeout Errors**: Para pagamentos PIX expirados

### Backend Error Responses
```typescript
interface PaymentError {
  code: string;
  message: string;
  details?: any;
}

// Códigos de erro
enum PaymentErrorCodes {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PIX_EXPIRED = 'PIX_EXPIRED',
  CARD_DECLINED = 'CARD_DECLINED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'
}
```

## Testing Strategy

### Unit Tests
- Validação de formulários de pagamento
- Formatação de valores monetários
- Geração de códigos PIX
- Validação de dados de cartão

### Integration Tests
- Fluxo completo de pagamento PIX
- Fluxo completo de pagamento por cartão
- Atualização de saldo após pagamento
- Registro de transações no histórico

### E2E Tests
- Abertura do modal através do header
- Seleção de valor e método de pagamento
- Processamento de pagamento bem-sucedido
- Tratamento de erros de pagamento

## UI/UX Design

### Modal Layout
1. **Step 1**: Seleção de valor (valores sugeridos + campo customizado)
2. **Step 2**: Escolha do método de pagamento (PIX ou Cartão)
3. **Step 3**: Interface específica do método escolhido
4. **Step 4**: Confirmação e status do pagamento

### Visual Elements
- **Loading States**: Spinners durante processamento
- **Success Animation**: Feedback visual de sucesso
- **Error Messages**: Toast notifications para erros
- **Progress Indicator**: Steps do processo de pagamento

### Responsive Design
- Modal adaptável para mobile e desktop
- QR Code responsivo para pagamento PIX
- Formulário de cartão otimizado para mobile

## Security Considerations

### Data Protection
- Dados de cartão nunca armazenados no frontend
- Comunicação HTTPS obrigatória
- Tokenização de dados sensíveis
- Logs de segurança para transações

### Validation
- Validação client-side e server-side
- Rate limiting para tentativas de pagamento
- Verificação de autenticidade do usuário
- Timeout automático para sessões PIX

## Integration Points

### Payment Gateways
- **PIX**: Integração com banco ou gateway PIX
- **Credit Card**: Integração com processador de cartões
- **Webhooks**: Para confirmação de pagamentos

### Internal Systems
- **User Service**: Atualização de saldo
- **Notification Service**: Confirmações por email/SMS
- **Analytics Service**: Métricas de conversão