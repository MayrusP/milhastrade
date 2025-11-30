# Plano de Implementação - Sistema de Verificação de Usuários

## 1. Configuração da Base de Dados

- [ ] 1.1 Criar migração para tabela user_verifications
  - Criar arquivo de migração Prisma com campos: id, user_id, status, document_type, document_front_url, document_back_url, rejection_reason, reviewed_by, reviewed_at, created_at, updated_at
  - Definir enums para status (NOT_SUBMITTED, PENDING, APPROVED, REJECTED) e document_type (RG, CNH)
  - Configurar foreign keys e índices para performance
  - _Requisitos: 1.1, 2.1, 6.4_

- [ ] 1.2 Adicionar campo is_verified na tabela users
  - Alterar schema Prisma para incluir campo booleano is_verified com default false
  - Criar índice para otimizar consultas por usuários verificados
  - _Requisitos: 4.1, 7.2_

- [ ] 1.3 Executar migrações e validar estrutura
  - Rodar npx prisma migrate dev para aplicar mudanças
  - Verificar se tabelas foram criadas corretamente
  - Testar relacionamentos entre tabelas
  - _Requisitos: 1.1, 4.1_

## 2. Configuração de Upload de Arquivos

- [ ] 2.1 Instalar e configurar Multer
  - Instalar dependências: multer, @types/multer, sharp (para compressão)
  - Criar estrutura de diretórios uploads/verifications/
  - Configurar middleware básico de upload
  - _Requisitos: 1.3, 1.4_

- [ ] 2.2 Implementar middleware de upload seguro
  - Criar middleware para upload com validação de tipos (JPG, PNG, PDF)
  - Configurar limite de tamanho (5MB por arquivo)
  - Validar tipos MIME reais dos arquivos
  - Sanitizar nomes de arquivos e implementar rate limiting
  - _Requisitos: 1.3, 6.1_

## 3. Serviços Backend de Verificação

- [ ] 3.1 Criar serviço de verificação (verificationService)
  - Implementar funções para criar, buscar e atualizar verificações
  - Criar função para processar upload de documentos
  - Implementar lógica de validação de status
  - _Requisitos: 1.4, 1.5, 2.4_

- [ ] 3.2 Criar controlador de verificação (verificationController)
  - Implementar método para upload de documentos
  - Criar método para buscar status de verificação
  - Implementar métodos admin para listar e revisar verificações
  - _Requisitos: 1.4, 2.2, 2.4, 3.1_

## 4. Endpoints da API de Verificação

- [ ] 4.1 Criar endpoint POST /api/user/verification/upload
  - Integrar middleware de autenticação e upload
  - Processar upload de frente e verso do documento
  - Salvar URLs dos arquivos na base de dados
  - Alterar status para PENDING após upload bem-sucedido
  - _Requisitos: 1.4, 1.5_

- [ ] 4.2 Criar endpoint GET /api/user/verification/status
  - Buscar status atual da verificação do usuário logado
  - Retornar informações de status, data de envio e motivo de rejeição
  - Incluir URLs dos documentos se necessário
  - _Requisitos: 3.1, 5.4_

- [ ] 4.3 Criar endpoint GET /api/admin/verifications/pending
  - Implementar middleware de verificação de role ADMIN
  - Listar todas as verificações com status PENDING
  - Incluir dados do usuário e URLs dos documentos
  - _Requisitos: 2.2, 6.1_

- [ ] 4.4 Criar endpoint PUT /api/admin/verifications/:id/review
  - Validar se usuário é ADMIN
  - Processar ação de APPROVE ou REJECT
  - Exigir motivo obrigatório para rejeições
  - Atualizar status da verificação e campo is_verified do usuário
  - _Requisitos: 2.4, 2.5, 6.1, 6.2_

- [ ] 4.5 Configurar rotas de verificação
  - Criar arquivo verificationRoutes.ts
  - Integrar rotas no app principal
  - Configurar middleware de autenticação e autorização
  - _Requisitos: 1.4, 2.2_

## 5. Componentes Frontend - Upload de Documentos

- [ ] 5.1 Criar estrutura de componentes de verificação
  - Criar diretório frontend/src/components/verification/
  - Definir interfaces TypeScript para tipos de verificação
  - Criar tipos para status, documentos e respostas da API
  - _Requisitos: 1.1, 3.1_

- [ ] 5.2 Criar componente DocumentUploadForm
  - Implementar interface para seleção de tipo de documento (RG/CNH)
  - Criar campos de upload para frente e verso
  - Adicionar preview das imagens selecionadas
  - Implementar validação de formato e tamanho no frontend
  - Mostrar barra de progresso durante upload
  - _Requisitos: 1.1, 1.2, 1.3_

- [ ] 5.3 Criar componente VerificationSection
  - Implementar diferentes estados: NOT_SUBMITTED, PENDING, APPROVED, REJECTED
  - Integrar DocumentUploadForm para estado NOT_SUBMITTED
  - Mostrar status de "aguardando análise" para PENDING
  - Exibir badge de verificado para APPROVED
  - Mostrar motivo e opção de reenvio para REJECTED
  - _Requisitos: 1.1, 3.1, 3.2, 3.3_

- [ ] 5.4 Integrar VerificationSection no ProfilePage
  - Adicionar seção de verificação na página de perfil do usuário
  - Carregar status atual da verificação ao montar componente
  - Implementar refresh automático após upload ou mudança de status
  - _Requisitos: 1.1, 3.2_

## 6. Componentes Frontend - Painel Administrativo

- [ ] 6.1 Criar estrutura de componentes admin
  - Criar diretório frontend/src/components/admin/verification/
  - Definir interfaces para dados de verificação admin
  - Criar tipos para ações de aprovação/rejeição
  - _Requisitos: 2.1, 2.2_

- [ ] 6.2 Criar componente DocumentViewer
  - Implementar visualização em tela cheia de documentos
  - Adicionar zoom e navegação entre frente e verso
  - Incluir informações do documento (tipo, data de envio)
  - Implementar navegação por teclado para acessibilidade
  - _Requisitos: 2.3_

- [ ] 6.3 Criar componente AdminVerificationPanel
  - Implementar lista de verificações pendentes
  - Integrar DocumentViewer para visualização de documentos
  - Adicionar botões de aprovar e rejeitar
  - Implementar campo obrigatório de motivo para rejeições
  - Mostrar informações do usuário (nome, email, data de cadastro)
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6.4 Integrar painel no AdminDashboardPage
  - Adicionar aba "Verificações Pendentes" no dashboard admin
  - Mostrar contador de verificações pendentes
  - Implementar refresh automático da lista
  - Adicionar estatísticas básicas (total pendente, aprovadas hoje, etc.)
  - _Requisitos: 2.1, 6.6_

## 7. Sistema de Badges e Indicadores Visuais

- [ ] 7.1 Criar componente VerificationBadge
  - Implementar badge completo para perfis públicos
  - Criar versão compacta (ícone) para listas
  - Adicionar tooltip explicativo sobre verificação
  - Implementar diferentes tamanhos e estilos
  - _Requisitos: 4.2, 4.3, 7.1_

- [ ] 7.2 Atualizar endpoints para incluir status de verificação
  - Modificar endpoint de perfil público para incluir is_verified
  - Atualizar endpoint de ofertas para incluir dados de verificação do usuário
  - Modificar queries para otimizar busca por usuários verificados
  - _Requisitos: 4.1, 4.2, 7.2_

- [ ] 7.3 Integrar badges no perfil público
  - Atualizar PublicProfilePage para mostrar status de verificação
  - Exibir badge na seção de confiabilidade
  - Adicionar texto explicativo sobre usuários verificados
  - _Requisitos: 4.1, 4.2, 4.4_

- [ ] 7.4 Adicionar indicadores no marketplace
  - Mostrar ícone de verificação nas ofertas de usuários verificados
  - Implementar filtro "Apenas usuários verificados"
  - Destacar visualmente ofertas de usuários verificados
  - Priorizar usuários verificados na ordenação por confiabilidade
  - _Requisitos: 7.2, 7.3, 7.5_

## 8. Sistema de Notificações

- [ ] 8.1 Implementar notificações de status
  - Criar notificação para verificação aprovada
  - Criar notificação para verificação rejeitada (incluindo motivo)
  - Integrar com sistema de notificações existente do dashboard
  - Implementar persistência de notificações de verificação
  - _Requisitos: 5.1, 5.2, 5.3_

- [ ] 8.2 Criar notificações para administradores
  - Notificar admins quando nova verificação for enviada
  - Implementar sistema de atribuição de verificações
  - Criar resumo diário de verificações pendentes
  - _Requisitos: 2.1, 6.6_

## 9. Melhorias de UX e Integração

- [ ] 9.1 Implementar estados de loading e feedback
  - Adicionar spinners durante uploads
  - Mostrar mensagens de sucesso/erro claras
  - Implementar retry automático para falhas de upload
  - Adicionar confirmações para ações críticas (aprovar/rejeitar)
  - _Requisitos: 1.5, 2.4, 2.5_

- [ ] 9.2 Otimizar para dispositivos móveis
  - Garantir que upload funcione corretamente em mobile
  - Adaptar visualização de documentos para telas pequenas
  - Otimizar interface do painel admin para tablets
  - Implementar compressão automática de imagens em mobile
  - _Requisitos: 1.1, 2.3_

- [ ] 9.3 Adicionar analytics e métricas
  - Implementar contadores de usuários verificados vs não verificados
  - Criar métricas de tempo médio de análise
  - Adicionar estatísticas de aprovação/rejeição por admin
  - Implementar relatório de impacto da verificação nas transações
  - _Requisitos: 6.6, 7.4_

## 10. Testes e Validação

- [ ] 10.1 Criar testes unitários para componentes
  - Testar DocumentUploadForm com diferentes tipos de arquivo
  - Testar VerificationSection em todos os estados
  - Testar AdminVerificationPanel com dados mock
  - Validar comportamento de VerificationBadge
  - _Requisitos: 1.1, 2.1, 4.1_

- [ ] 10.2 Criar testes de integração para API
  - Testar fluxo completo de upload de documentos
  - Validar processo de aprovação/rejeição
  - Testar permissões de acesso aos endpoints admin
  - Verificar integridade dos dados após operações
  - _Requisitos: 1.4, 2.4, 6.1_

- [ ] 10.3 Realizar testes de usabilidade
  - Testar fluxo de verificação com usuários reais
  - Validar clareza das mensagens de erro e sucesso
  - Verificar facilidade de uso do painel administrativo
  - Testar responsividade em diferentes dispositivos
  - _Requisitos: 1.1, 2.1, 4.1_

## 11. Documentação e Treinamento

- [ ] 11.1 Criar documentação para usuários
  - Escrever guia de como enviar documentos para verificação
  - Documentar benefícios de ser um usuário verificado
  - Criar FAQ sobre o processo de verificação
  - _Requisitos: 1.1, 4.3, 7.1_

- [ ] 11.2 Criar documentação para administradores
  - Documentar processo de análise de documentos
  - Criar guidelines para aprovação/rejeição
  - Documentar uso do painel administrativo
  - _Requisitos: 2.1, 6.2, 6.3_