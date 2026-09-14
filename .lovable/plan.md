# Plano de implementação — Repertório

## Etapa 1 — Fundação segura
- Ativar acesso por e-mail/senha e Google para equipe, com perfis separados de administrador, professor e aluno.
- Criar a estrutura acadêmica normalizada: pessoas, alunos, professores, cursos, módulos, turmas, matrículas e autorizações docentes.
- Aplicar regras de acesso no banco para isolar alunos, turmas, respostas, notas e gabaritos.
- Registrar alterações importantes e preservar histórico com arquivamento em vez de exclusão.

## Etapa 2 — Importação de alunos
- Implementar envio privado de XLSX/CSV, mapeamento flexível de colunas, validação de CPF, prévia e confirmação.
- Tratar duplicidades pelo CPF normalizado sem usá-lo como identificador interno.
- Registrar cada importação como lote, com criados, atualizados, ignorados, erros e reversão segura.

## Etapa 3 — Avaliações completas
- Criar banco de questões, provas, versões, vínculo com turmas e regras de publicação.
- Implementar tentativa única ativa, tempo controlado no servidor, embaralhamento persistente e retomada.
- Salvar respostas automaticamente com fila local temporária, sincronização, confirmação e tentativas controladas.
- Corrigir respostas objetivas no servidor, manter discursivas pendentes e bloquear alterações após entrega.

## Etapa 4 — Correção, notas e resultados
- Criar fila de correções manuais, comentários, cálculo final, critérios de aprovação e liberação configurável.
- Guardar histórico de notas, anulações e alterações de gabarito com autoria e motivo.
- Exibir ao aluno somente resultados liberados e nunca enviar gabaritos durante a prova.

## Etapa 5 — Gestão e análise
- Construir os painéis Warm Ledger para aluno, professor e administrador, com navegação adequada a cada perfil.
- Implementar métricas por aluno, turma, prova, questão e conteúdo, além de relatórios exportáveis.
- Adicionar importação DOCX sempre como rascunho revisável e preparar recuperação e recursos futuros.

## Validação
- Testar o cenário completo de importação até resultado, incluindo retomada, queda de conexão, tempo esgotado e dupla sessão.
- Executar verificações de acesso cruzado, exposição de gabarito, isolamento por turma, arquivos privados e regras do banco.
- Validar desktop, notebook, tablet e celular, com foco visível, contraste e mensagens simples.

## Detalhes técnicos
- Aplicação TanStack Start com operações sensíveis em funções do servidor.
- Banco relacional com UUIDs, chaves estrangeiras, índices, paginação e políticas por linha.
- Arquivos em armazenamento privado com validação de tipo, tamanho e acesso.
- Entrega incremental, mantendo cada etapa funcional antes de avançar.
