# Implementation Plan - Sistema de Adicionar Créditos

- [x] 1. Remover seção "Meus Créditos" da página de perfil


  - Identificar e remover componente/seção de créditos da página de perfil
  - Limpar imports e referências não utilizadas
  - _Requirements: 1.4_

- [ ] 2. Criar estrutura do modal de adicionar créditos
  - [ ] 2.1 Criar componente AddCreditsModal base
    - Implementar estrutura modal com steps de navegação
    - Adicionar estados para controle de fluxo (valor, método, pagamento)
    - Implementar validações de valor mínimo e máximo
    - _Requirements: 1.1, 1.2, 5.3, 5.4_
  
  - [ ] 2.2 Criar componente de seleção de valores
    - Implementar botões de valores sugeridos (R$ 50, 100, 200, 500)
    - Adicionar campo de valor customizado com formatação monetária
    - Implementar validação de valores em tempo real
    - _Requirements: 5.1, 5.2, 5.5_

- [ ] 3. Implementar seleção de métodos de pagamento
  - [ ] 3.1 Criar componente PaymentMethodSelector
    - Implementar interface para escolha entre PIX e cartão de crédito
    - Adicionar ícones e descrições dos métodos
    - Implementar navegação entre steps do modal
    - _Requirements: 1.3, 2.1, 3.1_

- [ ] 4. Desenvolver interface de pagamento PIX
  - [ ] 4.1 Criar componente PixPayment
    - Implementar geração de QR Code para pagamento PIX
    - Adicionar campo de chave PIX copiável
    - Implementar timer de 15 minutos para expiração
    - Adicionar polling para verificar status do pagamento
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Desenvolver interface de pagamento por cartão
  - [ ] 5.1 Criar componente CreditCardPayment
    - Implementar formulário de dados do cartão
    - Adicionar validação de número do cartão em tempo real
    - Implementar validação de data de validade e CVV
    - Adicionar formatação automática dos campos
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Implementar feedback visual e estados de loading
  - [ ] 6.1 Criar componente PaymentStatus
    - Implementar estados de loading durante processamento
    - Adicionar animações de sucesso e erro
    - Implementar sistema de mensagens específicas por tipo de erro
    - Integrar com sistema de toast existente
    - _Requirements: 4.1, 4.2, 4.3_





- [ ] 7. Integrar modal com o header da aplicação
  - [ ] 7.1 Modificar componente Header
    - Adicionar estado para controle do modal de créditos
    - Implementar handler para abertura do modal no botão "+"
    - Adicionar atualização de saldo em tempo real após pagamento
    - _Requirements: 1.1, 4.4_

- [ ] 8. Implementar backend para pagamentos PIX
  - [ ] 8.1 Criar endpoint para geração de pagamento PIX
    - Implementar rota POST /api/payments/pix
    - Adicionar geração de QR Code e chave PIX
    - Implementar sistema de expiração de 15 minutos
    - Adicionar validações de valor e usuário autenticado
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 8.2 Implementar verificação de status PIX
    - Criar rota GET /api/payments/status/:transactionId
    - Adicionar polling para confirmação de pagamento
    - Implementar webhook para recebimento de confirmações
    - _Requirements: 2.5_

- [ ] 9. Implementar backend para pagamentos por cartão
  - [ ] 9.1 Criar endpoint para processamento de cartão
    - Implementar rota POST /api/payments/credit-card
    - Adicionar validações server-side dos dados do cartão
    - Integrar com gateway de pagamento para cartões
    - Implementar tratamento de erros específicos
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Implementar sistema de créditos no backend
  - [ ] 10.1 Criar tabelas de transações e histórico
    - Implementar migration para tabela payment_transactions
    - Criar migration para tabela credit_history
    - Adicionar índices para otimização de consultas
    - _Requirements: 4.4, 4.5_
  
  - [ ] 10.2 Implementar serviço de créditos
    - Criar rota POST /api/credits/add para adicionar créditos
    - Implementar atualização de saldo do usuário
    - Adicionar registro no histórico de transações
    - Implementar validações de segurança e integridade
    - _Requirements: 2.5, 3.5, 4.4, 4.5_

- [ ] 11. Implementar tratamento de erros e validações
  - [ ] 11.1 Adicionar validações frontend
    - Implementar validação de valores monetários
    - Adicionar validação de dados de cartão
    - Implementar tratamento de erros de rede
    - _Requirements: 5.3, 5.4, 3.2, 3.3, 3.4_
  
  - [ ] 11.2 Implementar tratamento de erros backend
    - Adicionar códigos de erro específicos para cada tipo de falha
    - Implementar logs de segurança para transações
    - Adicionar rate limiting para tentativas de pagamento
    - _Requirements: 4.3_

- [ ]* 12. Implementar testes automatizados
  - [ ]* 12.1 Criar testes unitários para componentes
    - Testar validações de formulário de pagamento
    - Testar formatação de valores monetários
    - Testar estados do modal e navegação entre steps
    - _Requirements: 1.1, 1.2, 1.3, 5.5_
  
  - [ ]* 12.2 Criar testes de integração
    - Testar fluxo completo de pagamento PIX
    - Testar fluxo completo de pagamento por cartão
    - Testar atualização de saldo e histórico
    - _Requirements: 2.5, 3.5, 4.4, 4.5_