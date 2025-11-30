# Requirements Document

## Introduction

Sistema para adicionar créditos às contas dos usuários através de meios de pagamento (PIX e cartão de crédito), com interface modal acessível através do header da aplicação.

## Glossary

- **Sistema_Creditos**: Sistema responsável por gerenciar adição de créditos às contas dos usuários
- **Modal_Adicionar**: Interface modal para seleção de valor e método de pagamento
- **PIX**: Sistema de pagamento instantâneo brasileiro
- **Cartao_Credito**: Método de pagamento por cartão de crédito
- **Header**: Barra superior de navegação da aplicação
- **Perfil_Usuario**: Página de perfil do usuário logado

## Requirements

### Requirement 1

**User Story:** Como usuário logado, eu quero acessar facilmente a funcionalidade de adicionar créditos, para que eu possa recarregar minha conta de forma rápida

#### Acceptance Criteria

1. WHEN o usuário clica no botão "+" no Header, THE Sistema_Creditos SHALL abrir o Modal_Adicionar
2. THE Modal_Adicionar SHALL exibir opções de valor para adicionar créditos
3. THE Modal_Adicionar SHALL apresentar PIX e Cartao_Credito como métodos de pagamento disponíveis
4. THE Sistema_Creditos SHALL remover a seção "Meus Créditos" do Perfil_Usuario
5. THE Modal_Adicionar SHALL permitir ao usuário selecionar o valor desejado antes de escolher o método de pagamento

### Requirement 2

**User Story:** Como usuário, eu quero adicionar créditos via PIX, para que eu possa usar o método de pagamento instantâneo brasileiro

#### Acceptance Criteria

1. WHEN o usuário seleciona PIX como método de pagamento, THE Sistema_Creditos SHALL gerar um código PIX válido
2. THE Sistema_Creditos SHALL exibir o QR Code para pagamento PIX
3. THE Sistema_Creditos SHALL mostrar a chave PIX copiável
4. THE Sistema_Creditos SHALL definir um tempo limite de 15 minutos para o pagamento PIX
5. WHEN o pagamento PIX é confirmado, THE Sistema_Creditos SHALL adicionar os créditos à conta do usuário

### Requirement 3

**User Story:** Como usuário, eu quero adicionar créditos via cartão de crédito, para que eu possa usar meu cartão para recarregar a conta

#### Acceptance Criteria

1. WHEN o usuário seleciona Cartao_Credito como método de pagamento, THE Sistema_Creditos SHALL exibir formulário de dados do cartão
2. THE Sistema_Creditos SHALL validar o número do cartão em tempo real
3. THE Sistema_Creditos SHALL validar a data de validade do cartão
4. THE Sistema_Creditos SHALL validar o código CVV do cartão
5. WHEN os dados do cartão são válidos e o pagamento é processado, THE Sistema_Creditos SHALL adicionar os créditos à conta do usuário

### Requirement 4

**User Story:** Como usuário, eu quero ter feedback visual do processo de pagamento, para que eu saiba o status da minha transação

#### Acceptance Criteria

1. THE Sistema_Creditos SHALL exibir loading durante o processamento do pagamento
2. WHEN o pagamento é bem-sucedido, THE Sistema_Creditos SHALL mostrar mensagem de sucesso
3. IF o pagamento falha, THEN THE Sistema_Creditos SHALL exibir mensagem de erro específica
4. THE Sistema_Creditos SHALL atualizar o saldo de créditos do usuário em tempo real após pagamento bem-sucedido
5. THE Sistema_Creditos SHALL registrar a transação no histórico do usuário

### Requirement 5

**User Story:** Como usuário, eu quero ter opções de valores pré-definidos, para que eu possa escolher rapidamente quanto adicionar

#### Acceptance Criteria

1. THE Modal_Adicionar SHALL apresentar valores sugeridos (R$ 50, R$ 100, R$ 200, R$ 500)
2. THE Modal_Adicionar SHALL permitir inserção de valor customizado
3. THE Sistema_Creditos SHALL validar que o valor mínimo é R$ 10
4. THE Sistema_Creditos SHALL validar que o valor máximo é R$ 5000
5. THE Sistema_Creditos SHALL formatar os valores monetários corretamente (R$ 0,00)