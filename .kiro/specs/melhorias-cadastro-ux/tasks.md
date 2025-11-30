# Plano de Implementação - Melhorias UX no Cadastro

- [x] 1. Atualizar componente RegisterForm com novos campos e validações


  - Adicionar campo confirmPassword ao estado do formulário
  - Importar PhoneInput e funções de validação necessárias
  - Implementar validações frontend para senhas e telefone
  - Atualizar handleSubmit com validações antes do envio
  - _Requisitos: 1.1, 2.3, 3.1, 3.3, 4.4_




- [ ] 1.1 Modificar estado do formulário para incluir confirmação de senha
  - Atualizar interface FormData com campo confirmPassword
  - Inicializar confirmPassword como string vazia no useState
  - _Requisitos: 3.1_


- [ ] 1.2 Implementar validações de senha no frontend
  - Criar função para validar se senhas coincidem
  - Adicionar validação de tamanho mínimo da senha (6 caracteres)
  - Implementar validação em tempo real para confirmação de senha
  - _Requisitos: 3.2, 3.3, 4.3_



- [ ] 1.3 Substituir input de telefone pelo componente PhoneInput
  - Remover input comum de telefone
  - Integrar PhoneInput com formatação automática
  - Tornar campo telefone obrigatório (remover "opcional")
  - Adicionar validação de telefone com isValidPhone


  - _Requisitos: 1.1, 1.2, 2.1, 2.4_

- [ ] 1.4 Adicionar campo de confirmação de senha ao formulário
  - Criar novo campo input para confirmPassword
  - Implementar feedback visual (borda vermelha quando senhas diferentes)


  - Adicionar mensagem de erro "As senhas não coincidem"
  - Aplicar validação em tempo real durante digitação
  - _Requisitos: 3.2, 3.4, 4.3_




- [ ] 1.5 Atualizar função handleSubmit com validações completas
  - Validar se senhas coincidem antes de enviar
  - Validar tamanho mínimo da senha
  - Validar formato do telefone


  - Remover confirmPassword dos dados enviados ao backend
  - Exibir mensagens de erro específicas para cada validação
  - _Requisitos: 3.5, 4.4, 5.5_



- [ ] 2. Atualizar validações do backend para telefone obrigatório
  - Modificar validação de campos obrigatórios para incluir telefone
  - Implementar validação de formato do telefone (10/11 dígitos)
  - Atualizar mensagens de erro para serem mais específicas
  - _Requisitos: 2.3, 5.1, 5.2, 5.4_

- [ ] 2.1 Modificar validação de campos obrigatórios no endpoint de registro
  - Atualizar condição if para incluir verificação de telefone
  - Alterar mensagem de erro para incluir telefone como obrigatório
  - _Requisitos: 5.1_

- [ ] 2.2 Implementar validação de formato do telefone no backend
  - Criar validação para telefone com 10 ou 11 dígitos
  - Limpar formatação do telefone antes da validação
  - Retornar erro 400 com mensagem específica para telefone inválido
  - _Requisitos: 5.2, 5.4_

- [ ]* 3. Criar testes para as novas funcionalidades
  - Escrever testes unitários para PhoneInput
  - Criar testes de integração para RegisterForm
  - Implementar testes de API para validações do backend
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ]* 3.1 Testes unitários do PhoneInput
  - Testar formatação automática para 10 e 11 dígitos
  - Verificar validação de números inválidos
  - Testar limite máximo de caracteres
  - _Requisitos: 1.2, 1.3, 1.4_

- [ ]* 3.2 Testes de integração do RegisterForm
  - Testar validação de confirmação de senha em tempo real
  - Verificar prevenção de submissão com dados inválidos
  - Testar exibição de mensagens de erro específicas
  - _Requisitos: 3.2, 3.3, 3.5, 4.4_

- [ ]* 3.3 Testes de API para validações do backend
  - Testar rejeição de cadastro sem telefone
  - Verificar validação de formato de telefone inválido
  - Testar mensagens de erro específicas do backend
  - _Requisitos: 5.1, 5.2, 5.4_