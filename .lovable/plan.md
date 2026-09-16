# Correção da fundação do Repertório

## Objetivo
Interromper temporariamente provas e recursos avançados para entregar um fluxo completo e verificável de configuração inicial, autenticação, papéis, administração e acesso de professores.

## Diagnóstico confirmado
- O backend atual é **Lovable Cloud** e está saudável; banco e autenticação respondem.
- As tabelas acadêmicas já existem, com RLS ativa, mas não há usuários, perfis, administradores nem professores.
- O login atual tenta autenticar e envia todos para um painel genérico; não carrega perfil/papel, não diferencia áreas e transforma falhas técnicas em “dados incorretos”.
- Não existem `/setup`, `/login`, `/admin` ou `/professor`, nem fluxo para criar o primeiro administrador ou acesso de professor.
- `profiles`, `user_roles`, `teachers` e `students` já existem; serão corrigidas, não duplicadas.
- O modelo atual usa `profiles.id` como o próprio UUID do Auth; isso será preservado como vínculo único para evitar uma segunda identidade.

## Implementação

### 1. Corrigir banco e autorização
- Adicionar o e-mail ausente em `teachers` e reforçar unicidade/vínculos dos registros de identidade existentes.
- Criar operações transacionais no banco para registrar profile + role + teacher sem estados parciais.
- Criar a operação exclusiva de bootstrap com bloqueio concorrente: só aceita o primeiro admin quando a contagem de admins é zero.
- Revisar RLS para permitir leitura do próprio profile/papel e limitar professor ao próprio registro; manter gestão administrativa restrita a admin.
- Preservar as tabelas e dados acadêmicos atuais.

### 2. Criar serviços seguros no servidor
- Consultar o estado da configuração inicial sem expor segredos.
- Criar o primeiro usuário Auth no servidor, registrar profile e role `admin`, e remover o usuário Auth se a etapa de banco falhar.
- Permitir que somente um admin autenticado crie professor, com usuário Auth, profile, role `teacher` e registro em `teachers`.
- Gerar uma senha temporária forte e exclusiva para o professor, exibida uma única vez ao administrador; nenhuma senha fixa ou chave privilegiada irá ao navegador.
- Fornecer dados básicos dos painéis e um diagnóstico seguro de saúde do sistema.

### 3. Centralizar autenticação e acesso
- Implementar AuthContext com `user`, `session`, `profile`, `role`, `loading`, `isAuthenticated`, `signIn`, `signOut` e `refreshProfile`.
- Restaurar sessão após atualização, manter um único observador de autenticação e limpar dados protegidos no logout.
- Redirecionar por papel: admin → `/admin`, professor → `/professor`, aluno → `/aluno`.
- Criar proteções por papel que aguardam o carregamento antes de decidir e nunca renderizam conteúdo não autorizado.

### 4. Entregar os fluxos e painéis
- `/setup`: configuração inicial com nome, e-mail, senha e confirmação; bloqueada permanentemente após o primeiro admin.
- `/login`: login da equipe, “Esqueci minha senha” e mensagens separando credenciais inválidas de falhas técnicas.
- `/reset-password`: conclusão segura da recuperação de senha.
- `/admin`: layout com menu, dashboard, estados vazios e navegação; página de professores com cadastro e criação de acesso; configurações com Status do Sistema.
- `/professor`: layout, menu e dashboard real com os estados vazios solicitados.
- `/aluno`: destino protegido mínimo para preservar o roteamento por papel, sem avançar funcionalidades de provas.
- Manter `/auth` como redirecionamento compatível para `/login`.

### 5. Validar de ponta a ponta
- Executar build, lint do banco e revisão das políticas.
- Criar o primeiro administrador por `/setup`, confirmar profile e role, atualizar `/admin`, navegar e sair.
- Entrar como admin, criar professor e confirmar Auth + profile + role + teacher.
- Entrar como professor, atualizar `/professor`, navegar e tentar `/admin`, confirmando o bloqueio.
- Confirmar que páginas protegidas ficam inacessíveis após logout e que nenhum segredo aparece no código entregue.

## Limite desta etapa
Não implementar provas, métricas, DOCX, IA ou relatórios complexos. O foco exclusivo será banco, autenticação, usuários, papéis, rotas e dashboards básicos funcionais.
