# Academic Compass

# PROJETO: SISTEMA DE AVALIAÇÕES E DESEMPENHO ACADÊMICO

Desenvolva uma aplicação web completa, responsiva, segura e intuitiva para aplicação de provas e atividades acadêmicas, correção automática e manual, registro de notas, acompanhamento de desempenho e geração de métricas.

O sistema será utilizado principalmente por uma escola de cursos profissionalizantes, com alunos de diferentes idades e diferentes níveis de familiaridade com computadores.

A prioridade do projeto deve ser:

**simplicidade para o aluno + confiabilidade das avaliações + segurança dos dados + facilidade de gestão para professores e administradores.**

Não desenvolver apenas uma interface demonstrativa.

Criar uma aplicação funcional, com banco de dados estruturado, autenticação e autorização, regras de negócio, validações, tratamento de erros, histórico e segurança server-side.

---

# 1. OBJETIVO PRINCIPAL

O sistema deve permitir:

Professor cria ou importa uma prova.

↓

Professor vincula a prova a determinada turma, curso ou módulo.

↓

Aluno se identifica e acessa somente as avaliações destinadas a ele.

↓

Aluno responde a avaliação.

↓

Todas as respostas são salvas automaticamente.

↓

Aluno finaliza a avaliação.

↓

Questões objetivas são corrigidas automaticamente.

↓

Questões discursivas ficam aguardando correção manual.

↓

Sistema calcula nota e aproveitamento.

↓

Professor analisa os resultados.

↓

Sistema gera métricas por:

* aluno;

* prova;

* turma;

* curso;

* módulo;

* conteúdo;

* questão.

O sistema deverá substituir progressivamente provas e atividades impressas.

---

# 2. PRINCÍPIO FUNDAMENTAL DE UX

A complexidade deve ficar no sistema e não para o aluno.

O aluno não deve precisar entender a estrutura administrativa da escola.

A interface do aluno deve ser extremamente simples, limpa e objetiva.

Evitar:

* excesso de menus;

* muitos botões;

* telas poluídas;

* opções administrativas;

* textos técnicos;

* configurações desnecessárias.

Usar:

* botões grandes;

* tipografia legível;

* contraste adequado;

* barras de progresso;

* mensagens claras;

* confirmação visual de salvamento;

* design responsivo.

Considerar que alguns alunos podem ter pouca experiência utilizando computadores.

---

# 3. PERFIS DE ACESSO

Criar três níveis principais:

## ADMINISTRADOR

Pode:

* importar alunos;

* cadastrar e editar alunos;

* cadastrar professores;

* cadastrar cursos;

* cadastrar módulos;

* cadastrar turmas;

* definir horários;

* gerenciar matrículas;

* criar provas;

* editar provas;

* importar provas;

* visualizar todas as avaliações;

* visualizar resultados;

* visualizar métricas;

* corrigir provas;

* acessar relatórios;

* consultar logs;

* arquivar registros;

* configurar o sistema.

## PROFESSOR

Pode:

* visualizar somente turmas autorizadas;

* visualizar alunos das suas turmas;

* criar provas;

* criar questões;

* acessar banco de questões;

* importar DOCX;

* publicar avaliações;

* corrigir questões discursivas;

* visualizar resultados;

* visualizar métricas das turmas permitidas;

* gerar relatórios.

Não permitir acesso irrestrito às configurações administrativas.

## ALUNO

Pode visualizar somente:

* seus próprios dados básicos;

* suas matrículas;

* suas provas;

* suas tentativas;

* seus resultados liberados.

Nunca permitir que um aluno visualize:

* prova de outro aluno;

* respostas de outro aluno;

* notas de outro aluno;

* turmas de outros alunos;

* gabaritos não liberados;

* informações administrativas.

---

# 4. BASE DE ALUNOS

A escola já possui uma base contendo informações como:

* nome;

* CPF;

* curso;

* módulo;

* turma;

* dia;

* horário;

* outros dados acadêmicos.

Criar no painel administrativo:

**Importar base de alunos**

Aceitar inicialmente:

* XLSX;

* CSV.

O sistema não deve exigir um formato rígido de nomes das colunas.

Depois do upload, mostrar uma tela de mapeamento.

Exemplo:

Nome do Aluno → Nome

CPF Aluno → CPF

Curso Atual → Curso

Módulo Atual → Módulo

Dia Aula → Dia

Horário Aula → Horário

Permitir que o administrador confirme ou altere esse mapeamento.

---

# 5. PRÉVIA DA IMPORTAÇÃO

Nunca importar diretamente.

Fluxo obrigatório:

Upload

↓

Leitura do arquivo

↓

Mapeamento

↓

Validação

↓

Prévia

↓

Confirmação

↓

Importação

Mostrar:

**412 registros encontrados**

386 registros válidos

18 registros precisam de revisão

8 registros possuem erro

Possíveis alertas:

* CPF inválido;

* CPF duplicado;

* nome ausente;

* turma inexistente;

* curso inexistente;

* módulo não identificado;

* horário inválido;

* registros duplicados.

Permitir:

**Importar registros válidos**

**Corrigir dados**

**Ignorar registro**

**Cancelar importação**

---

# 6. NÃO DUPLICAR ALUNOS

CPF deve ser utilizado como um dos principais identificadores para localizar registros existentes durante a importação.

Entretanto:

**NÃO usar CPF como primary key interna.**

Cada aluno deve possuir um UUID interno.

Exemplo:

student_id = UUID

cpf = dado cadastral

Ao importar CPF existente:

não criar outro aluno.

Perguntar ou seguir a regra selecionada:

* atualizar dados existentes;

* ignorar;

* revisar diferença.

Criar três opções de importação:

**Adicionar somente novos**

**Adicionar novos e atualizar existentes**

**Somente atualizar existentes**

Padrão recomendado:

**Adicionar e atualizar**

---

# 7. ESTRUTURA ACADÊMICA

Não relacionar diretamente:

Aluno → Curso

Criar estrutura de matrículas.

Modelo:

ALUNO

↓

MATRÍCULA

↓

TURMA

↓

CURSO

↓

MÓDULO

Isso é necessário porque o mesmo aluno pode participar de mais de um curso.

Exemplo:

João Silva

Matrícula 1 → Informática

Matrícula 2 → Administração

Não criar dois usuários para o mesmo aluno.

---

# 8. MUDANÇAS DE TURMA E CURSO

Quando um aluno mudar de turma:

não apagar dados antigos.

Registrar alteração e preservar histórico.

Quando concluir um curso:

status da matrícula:

**Concluída**

Não excluir o aluno.

Não excluir notas.

Não excluir tentativas.

Não excluir histórico acadêmico.

---

# 9. IDENTIFICAÇÃO DO ALUNO

O acesso deve ser extremamente simples.

Criar uma tela inicial como:

# ÁREA DO ALUNO

CPF

[ ***.***._**-** ]

[ CONTINUAR ]

Ao localizar o CPF:

mostrar:

**João Silva**

Curso: Informática

Turma/Horário: Segunda — 18h às 20h

Módulo atual: Excel

[ ACESSAR MINHAS PROVAS ]

Os dados devem vir da base importada.

O aluno não deve cadastrar livremente:

* curso;

* módulo;

* turma;

* horário.

Isso evita erros.

Quando necessário, mostrar também um painel simples:

Nome

CPF mascarado

Turma / Horário

Esses dados devem ser preenchidos automaticamente.

---

# 10. SEGURANÇA DE IDENTIFICAÇÃO

CPF sozinho não deve ser considerado autenticação forte para acessar informações acadêmicas sensíveis.

Estruturar o sistema permitindo uma camada adicional de segurança.

Pode ser utilizado:

* senha criada no primeiro acesso;

* PIN individual;

* código de ativação;

* outro mecanismo seguro.

A arquitetura deve permitir ativar ou desativar essa camada conforme necessidade.

Nunca armazenar senhas em texto puro.

Usar mecanismo de autenticação seguro.

---

# 11. HOME DO ALUNO

Depois de entrar, mostrar:

# Olá, João 👋

## Provas pendentes

Windows — Avaliação

Disponível agora

20 questões

[ COMEÇAR ]

## Em andamento

Excel — Avaliação

12 de 20 respondidas

[ CONTINUAR ]

## Concluídas

Internet — Avaliação

Entregue

Resultado aguardando liberação

Não adicionar informações desnecessárias.

---

# 12. SISTEMA DE PROVAS

Criar módulo chamado:

**Provas / Avaliações**

Cada avaliação deve possuir:

* título;

* descrição opcional;

* curso;

* módulo;

* conteúdo;

* turma ou turmas;

* professor responsável;

* data de criação;

* data de abertura;

* data de encerramento;

* nota máxima;

* média mínima;

* número máximo de tentativas;

* tempo limite;

* configuração de randomização;

* configuração de resultado;

* status.

---

# 13. STATUS DAS AVALIAÇÕES

Criar estados claros:

RASCUNHO

PROGRAMADA

DISPONÍVEL

ENCERRADA

EM CORREÇÃO

FINALIZADA

ARQUIVADA

Não permitir combinações inconsistentes.

Uma prova em rascunho não pode aparecer para alunos.

---

# 14. TIPOS DE QUESTÃO

Preparar suporte para:

## Múltipla escolha

Uma alternativa correta.

## Múltipla seleção

Duas ou mais alternativas podem estar corretas.

## Verdadeiro ou falso

## Resposta curta

## Discursiva

## Preencher lacunas

Pode ficar preparado para fase futura.

## Associação

Pode ficar preparado para fase futura.

## Envio de arquivo

Para atividades práticas.

Pode ser implementado posteriormente, mas deixar arquitetura preparada.

---

# 15. BANCO DE QUESTÕES

Criar um banco reutilizável de questões.

Cada questão pode possuir:

* curso;

* módulo;

* conteúdo;

* dificuldade;

* tipo;

* enunciado;

* imagem;

* alternativas;

* gabarito;

* pontuação;

* explicação;

* data de criação;

* autor.

Permitir busca e filtros por:

curso;

módulo;

conteúdo;

dificuldade;

tipo.

---

# 16. CLASSIFICAÇÃO POR CONTEÚDO

Cada questão deve poder ser marcada com um conteúdo.

Exemplo:

Curso: Informática

Módulo: Excel

Conteúdo: Fórmulas

Isso será utilizado posteriormente para gerar métricas pedagógicas.

---

# 17. IMPORTAÇÃO DE PROVAS DOCX

Esta é uma funcionalidade importante.

Criar:

**Importar prova DOCX**

O sistema deverá:

receber o arquivo;

↓

extrair texto;

↓

identificar questões;

↓

identificar alternativas;

↓

identificar questões discursivas;

↓

identificar possível gabarito;

↓

identificar imagens quando possível;

↓

gerar rascunho;

↓

mostrar revisão.

Nunca publicar automaticamente.

---

# 18. REVISÃO DO DOCX

Depois da importação mostrar:

**20 questões identificadas**

17 múltipla escolha

3 discursivas

2 precisam de revisão

Para cada questão permitir:

* editar enunciado;

* escolher tipo;

* editar alternativas;

* escolher gabarito;

* definir pontuação;

* definir conteúdo;

* remover;

* adicionar imagem.

Se alguma parte não for interpretada:

mostrar claramente:

**Não foi possível interpretar este trecho.**

E permitir edição manual.

---

# 19. GABARITO

O gabarito deve ser armazenado de forma protegida.

**Nunca enviar o gabarito para o navegador do aluno durante a realização da prova.**

O navegador deve receber apenas:

* enunciado;

* alternativas;

* recursos necessários.

O gabarito deve permanecer no backend.

A correção automática deve ocorrer server-side.

Isso é uma exigência de segurança.

---

# 20. CRIAÇÃO MANUAL DA PROVA

Permitir também criar provas sem DOCX.

Botão:

**Nova prova**

Opções:

Adicionar questão existente

Criar nova questão

Importar questões

Selecionar questões aleatórias do banco

---

# 21. PONTUAÇÃO

Permitir:

**Distribuir pontuação automaticamente**

Exemplo:

20 questões

Nota máxima: 10

Cada questão: 0,5.

Também permitir valores individuais.

Exemplo:

Questão 1 → 0,5

Questão 2 → 0,5

Questão 3 → 2,0

Validar obrigatoriamente se o total corresponde à nota máxima.

---

# 22. PROVA ALEATÓRIA

Permitir criar uma avaliação usando um banco maior.

Exemplo:

Banco:

60 questões.

Prova:

20 questões.

Para cada aluno selecionar automaticamente 20 questões.

Permitir critérios:

5 fáceis

10 médias

5 difíceis

ou seleção totalmente aleatória.

Registrar exatamente quais questões cada aluno recebeu.

---

# 23. EMBARALHAMENTO

Adicionar configurações:

[ ] Embaralhar questões

[ ] Embaralhar alternativas

O sistema deve manter corretamente o vínculo do gabarito independentemente da ordem apresentada.

---

# 24. APLICAÇÃO DA PROVA

Ao iniciar:

mostrar:

nome da prova;

quantidade de questões;

tempo disponível;

tentativas;

regras.

Botão:

**INICIAR PROVA**

Ao clicar:

criar uma tentativa no banco.

Registrar:

student_id

assessment_id

started_at

status

attempt_number

---

# 25. AUTOSAVE

Isto é obrigatório.

Cada resposta deve ser salva automaticamente.

Não esperar o aluno clicar em finalizar.

Fluxo:

Aluno responde

↓

Salvar no banco

↓

Mostrar:

**Resposta salva ✓**

Se houver erro:

**Não foi possível salvar. Tentando novamente...**

Implementar retries controlados.

Não permitir que o aluno acredite que algo foi salvo quando não foi.

---

# 26. QUEDA DE INTERNET

O sistema deve ser tolerante a falhas.

Caso a conexão caia:

* manter respostas locais temporariamente quando possível;

* mostrar aviso;

* tentar sincronizar novamente;

* não apagar respostas já salvas;

* evitar duplicação de registros.

Mensagem:

**Você está sem conexão. Suas respostas já salvas permanecem seguras. O sistema tentará sincronizar as novas respostas automaticamente.**

---

# 27. FECHAR NAVEGADOR

Se o aluno fechar:

Chrome;

aba;

computador;

ou recarregar a página,

ao entrar novamente:

mostrar:

**Você possui uma avaliação em andamento.**

[ CONTINUAR DE ONDE PAREI ]

Nunca criar uma nova tentativa automaticamente.

---

# 28. DUPLA SESSÃO

Se o aluno abrir a mesma prova em outro computador:

não criar outra tentativa.

Detectar tentativa ativa.

Permitir retomar a tentativa existente.

Registrar evento para auditoria.

---

# 29. NAVEGAÇÃO DA PROVA

Interface:

# Questão 4 de 20

[ barra de progresso ]

Enunciado

alternativas ou campo de resposta

← ANTERIOR

PRÓXIMA →

Mostrar também um painel opcional:

1 ✓

2 ✓

3 ✓

4 atual

5 ○

6 ○

Permitir navegar facilmente pelas questões.

---

# 30. FINALIZAÇÃO

Botão:

**FINALIZAR PROVA**

Nunca finalizar diretamente.

Mostrar confirmação.

Exemplo:

**Você está prestes a entregar sua prova.**

18 de 20 questões respondidas.

2 questões estão em branco.

Depois de entregar você não poderá alterar suas respostas.

[ VOLTAR ]

[ ENTREGAR MESMO ASSIM ]

---

# 31. ENTREGA

Depois da confirmação:

alterar status da tentativa para:

ENTREGUE

Registrar:

submitted_at

Após entrega:

bloquear alteração das respostas.

---

# 32. TEMPO DE PROVA

Permitir:

Sem limite

30 minutos

45 minutos

60 minutos

90 minutos

Personalizado.

O tempo deve ser controlado pelo servidor.

Registrar:

started_at

expires_at

Não confiar no relógio do computador do aluno.

Atualizar a página não pode reiniciar o tempo.

---

# 33. TEMPO ESGOTADO

Quando o tempo terminar:

salvar respostas existentes;

finalizar automaticamente;

registrar:

**Finalizada por tempo esgotado.**

---

# 34. CORREÇÃO AUTOMÁTICA

Corrigir automaticamente:

* múltipla escolha;

* múltipla seleção;

* verdadeiro ou falso;

* outros tipos objetivos implementados.

Nunca depender do frontend para decidir se está correto.

---

# 35. QUESTÕES DISCURSIVAS

Questões discursivas devem ficar:

**Aguardando correção**

No painel do professor mostrar:

Questão

Resposta do aluno

Valor máximo

Campo:

Nota atribuída

Comentário opcional

[ SALVAR CORREÇÃO ]

Depois de todas as discursivas corrigidas:

calcular nota final.

---

# 36. RESULTADOS

Resultado deve conter:

Nota

Aproveitamento percentual

Quantidade de acertos

Quantidade de erros

Quantidade de questões em branco

Situação

Exemplo:

**8,5 / 10**

Aproveitamento: 85%

17 acertos

3 erros

APROVADO

---

# 37. RESULTADOS NÃO DEVEM SER SEMPRE IMEDIATOS

Configuração por prova:

[ ] Mostrar nota imediatamente

[ ] Mostrar questões erradas

[ ] Mostrar questões corretas

[ ] Mostrar gabarito

[ ] Mostrar somente depois do encerramento

[ ] Professor libera manualmente

Isso evita que um aluno faça a prova e passe o gabarito para os próximos.

---

# 38. APROVAÇÃO

Cada avaliação poderá possuir:

Nota máxima

Média mínima

Exemplo:

Nota máxima: 10

Média mínima: 7

Resultado:

≥ 7 = Aprovado

< 7 = Abaixo da média / recuperação

Permitir que administrador altere terminologia.

---

# 39. RECUPERAÇÃO

Preparar suporte para recuperação.

Exemplo:

Selecionar automaticamente:

**Alunos com nota abaixo de 7**

Criar avaliação de recuperação.

Permitir regras:

* substituir nota anterior;

* considerar maior nota;

* calcular média;

* regra personalizada futuramente.

Preservar as duas notas no histórico.

---

# 40. VERSIONAMENTO DE PROVAS

Uma prova que já possui tentativa iniciada não deve ser livremente modificada.

Se o professor alterar:

* enunciado;

* alternativas;

* gabarito;

* valor da questão;

depois de alunos terem começado:

criar nova versão.

Exemplo:

Avaliação Windows

Versão 1

Versão 2

Cada tentativa deve indicar qual versão foi utilizada.

---

# 41. QUESTÃO ANULADA

Permitir ao professor:

**ANULAR QUESTÃO**

Perguntar como recalcular:

**Dar pontos a todos**

ou

**Remover questão do total**

Recalcular automaticamente todas as notas afetadas.

Registrar alteração em auditoria.

---

# 42. NÃO APAGAR HISTÓRICO

Quando já existirem respostas:

não permitir exclusão destrutiva de:

* aluno;

* prova;

* tentativa;

* questão utilizada;

* resultado.

Utilizar:

**Arquivar**

ou soft delete.

Histórico acadêmico precisa permanecer consistente.

---

# 43. DASHBOARD DO PROFESSOR

Criar dashboard simples.

Mostrar:

Alunos ativos

Provas disponíveis

Provas realizadas

Avaliações aguardando correção

Média geral

Avaliações recentes

Conteúdos com maior dificuldade

Evitar dashboard exageradamente carregado.

---

# 44. MÉTRICAS POR ALUNO

Página individual:

**João Silva**

Curso

Turma

Módulo atual

Provas realizadas

Média geral

Aproveitamento

Quantidade de avaliações

Aprovações

Avaliações abaixo da média

Evolução das notas

Tabela:

Prova | Data | Nota | Aproveitamento | Situação

---

# 45. MÉTRICAS POR TURMA

Mostrar:

quantidade de alunos;

quantos fizeram a avaliação;

quantos ainda não fizeram;

média;

maior nota;

menor nota;

mediana, se apropriado;

percentual de aprovação;

percentual abaixo da média.

---

# 46. MÉTRICAS POR QUESTÃO

Esta métrica é extremamente importante.

Exemplo:

Questão 1 → 92% acerto

Questão 2 → 87%

Questão 3 → 41% ⚠️

Questão 4 → 78%

Destacar automaticamente questões com índice de erro elevado.

Mensagem:

**Esta questão apresentou índice de erro acima do esperado.**

Não concluir automaticamente que a questão está errada.

Apenas sinalizar para análise do professor.

---

# 47. MÉTRICAS POR CONTEÚDO

Como as questões possuem conteúdo cadastrado, calcular desempenho por assunto.

Exemplo:

Excel

Fórmulas básicas → 68%

Formatação → 91%

Gráficos → 83%

PROCV → 54%

Isso deve ajudar o professor a identificar conteúdos que precisam de reforço.

---

# 48. EVOLUÇÃO DO ALUNO

Mostrar progressão.

Exemplo:

Prova 1 → 6,5

Prova 2 → 7,3

Prova 3 → 8,1

Gerar gráfico simples.

Evitar gráficos decorativos.

Somente métricas úteis pedagogicamente.

---

# 49. RELATÓRIOS

Criar relatórios:

## Relatório individual

Dados do aluno

Curso

Turma

Avaliações

Notas

Aproveitamento

Situação

## Relatório da turma

Alunos

Notas

Médias

Situação

## Relatório da avaliação

Participação

Notas

Média

Questões

Percentuais de acerto

## Relatório por conteúdo

Desempenho por módulo e assunto.

Preparar exportação para:

PDF

Excel/XLSX.

---

# 50. HISTÓRICO DE NOTAS

Nunca sobrescrever uma alteração sem registro.

Exemplo:

Nota anterior: 6,8

Nova nota: 7,2

Motivo: questão anulada

Alterado por: Professor X

Data: XX/XX/XXXX

---

# 51. LOGS DE AUDITORIA

Registrar eventos importantes.

Exemplos:

Aluno iniciou prova.

Aluno finalizou prova.

Professor alterou gabarito.

Professor anulou questão.

Administrador importou base.

Administrador alterou matrícula.

Nota foi alterada.

Não registrar dados sensíveis desnecessariamente.

---

# 52. SEGURANÇA — EXIGÊNCIA OBRIGATÓRIA

Toda segurança deve existir no backend.

Não confiar somente em esconder botões ou páginas.

Implementar:

* autenticação;

* autorização;

* roles;

* validação server-side;

* Row Level Security no banco;

* proteção de endpoints;

* sanitização de entradas;

* tratamento adequado de arquivos;

* controle de permissões;

* logs;

* políticas de acesso.

---

# 53. ROW LEVEL SECURITY

Aplicar RLS em todas as tabelas com dados acadêmicos ou pessoais.

Aluno deve conseguir consultar somente registros cujo student_id seja o seu.

Professor somente dados autorizados.

Administrador conforme permissões.

Nunca depender apenas do frontend.

---

# 54. CPF E DADOS PESSOAIS

CPF deve ser tratado como dado sensível operacional.

Mostrar mascarado sempre que o número completo não for necessário.

Exemplo:

***.***.***-42

Não colocar CPF em:

* URL;

* nome de arquivo;

* logs públicos;

* identificadores técnicos;

* parâmetros expostos sem necessidade.

---

# 55. LGPD E MINIMIZAÇÃO DE DADOS

Armazenar apenas informações necessárias.

Evitar duplicação de dados pessoais.

Controlar quem acessa informações pessoais.

Registrar ações administrativas relevantes.

Preparar arquitetura para exclusão/anonymização quando legalmente aplicável, sem destruir registros acadêmicos que precisem ser preservados.

---

# 56. ARQUIVOS

Arquivos enviados não devem ficar expostos publicamente sem necessidade.

Aplicar controle de acesso.

Validar:

* extensão;

* MIME type;

* tamanho;

* nome;

* conteúdo quando possível.

Evitar execução de arquivos enviados.

---

# 57. PROTEÇÃO CONTRA MANIPULAÇÃO DO FRONTEND

Considerar que um usuário pode:

* alterar JavaScript;

* modificar requisições;

* tentar acessar endpoints diretamente;

* alterar IDs;

* tentar visualizar outra prova;

* tentar descobrir o gabarito.

Toda decisão importante deve ser validada no servidor.

Exemplo:

O frontend solicita:

**entregar prova**

Backend verifica:

* usuário;

* matrícula;

* avaliação;

* tentativa;

* status;

* prazo;

* permissões.

Somente então processa.

---

# 58. BANCO DE DADOS

Estruturar aproximadamente com entidades:

users

profiles

user_roles

students

teachers

courses

modules

classes

enrollments

question_bank

questions

question_options

assessments

assessment_versions

assessment_questions

assessment_assignments

attempts

answers

grades

feedback

files

docx_imports

import_batches

audit_logs

Evitar tabelas gigantes contendo tudo.

Normalizar corretamente os relacionamentos.

---

# 59. REGRAS DE INTEGRIDADE

Criar foreign keys.

Aplicar unique constraints quando necessário.

Exemplo:

CPF normalizado deve ser único por aluno.

Não permitir:

tentativa sem aluno;

resposta sem tentativa;

questão sem prova;

matrícula sem aluno;

turma sem curso quando aplicável.

---

# 60. PERFORMANCE

O sistema pode ter centenas ou milhares de alunos.

Implementar:

* paginação;

* índices;

* consultas otimizadas;

* filtros server-side;

* carregamento sob demanda;

* evitar buscar dados desnecessários;

* evitar carregar todas as respostas de todos os alunos simultaneamente.

---

# 61. BUSCA

Painel administrativo deve permitir localizar rapidamente:

Aluno por nome

Aluno por CPF

Turma

Curso

Módulo

Prova

Questão

Usar busca rápida e filtros combináveis.

---

# 62. DESIGN

Interface profissional, moderna e educacional.

Evitar aparência infantil.

Evitar aparência exageradamente corporativa.

Criar layout clean.

Usar:

cards;

espaçamento;

bordas suaves;

ícones claros;

hierarquia visual;

tipografia grande o suficiente.

A área do aluno deve ter menos elementos que a área administrativa.

---

# 63. ACESSIBILIDADE

Aplicar boas práticas:

* contraste adequado;

* foco visível;

* navegação por teclado;

* labels;

* botões grandes;

* mensagens não baseadas somente em cores;

* tipografia legível.

---

# 64. RESPONSIVIDADE

O sistema deve funcionar bem em:

Desktop

Notebook

Tablet

Celular

Entretanto, priorizar especialmente Desktop/Notebook porque muitas provas serão realizadas em computadores da escola.

---

# 65. MENSAGENS DE ERRO

Nunca mostrar ao usuário final:

stack trace;

erro SQL;

código interno;

mensagem técnica do backend.

Mostrar:

**Não foi possível salvar sua resposta. Tente novamente.**

Registrar erro técnico separadamente.

---

# 66. CONFIRMAÇÕES IMPORTANTES

Solicitar confirmação antes de:

finalizar prova;

anular questão;

arquivar avaliação;

alterar gabarito após publicação;

alterar nota manualmente;

executar importação;

desfazer importação.

---

# 67. IMPORTAÇÃO REVERSÍVEL

Registrar cada importação como um lote.

Exemplo:

import_batch_id.

Salvar:

arquivo;

data;

usuário;

registros criados;

registros atualizados;

erros.

Criar opção de reversão somente quando tecnicamente segura.

Nunca reverter de forma que apague alterações realizadas posteriormente.

---

# 68. PÁGINAS ADMINISTRATIVAS

Criar inicialmente:

Dashboard

Alunos

Turmas

Cursos

Módulos

Provas

Banco de questões

Correções

Resultados

Relatórios

Importações

Configurações

Auditoria

---

# 69. PÁGINAS DO ALUNO

Criar somente:

Minhas Provas

Resultados

Meu Perfil

Evitar menus adicionais sem necessidade.

---

# 70. NÃO CRIAR FUNÇÕES DESNECESSÁRIAS

Neste momento o projeto não é:

* plataforma de videoaulas;

* rede social;

* LMS completo;

* sistema financeiro;

* sistema de comunicação;

* agenda escolar completa.

O foco é:

**AVALIAÇÃO E DESEMPENHO.**

---

# 71. DIFERENCIAR PROVA E ATIVIDADE

Criar um campo:

Tipo:

ATIVIDADE

AVALIAÇÃO

ATIVIDADE pode permitir:

várias tentativas;

feedback imediato;

dicas;

repetição.

AVALIAÇÃO pode utilizar:

uma tentativa;

tempo;

resultado bloqueado;

gabarito oculto;

randomização.

---

# 72. POSSÍVEL IA FUTURA

Preparar arquitetura, mas não tornar obrigatória no MVP.

Futuramente IA poderá:

* sugerir questões;

* identificar estrutura de DOCX;

* sugerir gabarito;

* classificar conteúdo;

* sugerir dificuldade;

* ajudar na correção discursiva;

* detectar questões potencialmente problemáticas.

A IA nunca deve alterar nota oficial sem confirmação do professor.

---

# 73. PRIORIDADE DE IMPLEMENTAÇÃO

Desenvolver primeiro a fundação:

Usuários

↓

Alunos

↓

Importação

↓

Cursos

↓

Turmas

↓

Matrículas

Depois:

Provas

↓

Questões

↓

Publicação

↓

Tentativas

↓

Autosave

↓

Entrega

Depois:

Correção

↓

Notas

↓

Resultados

Depois:

Métricas

↓

Relatórios

Depois:

DOCX

↓

Banco avançado de questões

↓

Recuperação

↓

Versionamento

↓

Auditoria avançada

Não tentar resolver tudo com componentes improvisados.

---

# 74. CRITÉRIOS DE ACEITE

O sistema não deve ser considerado funcional até que seja possível executar este cenário completo:

Administrador importa uma planilha de alunos.

↓

Sistema valida a planilha.

↓

Alunos são criados sem duplicidade.

↓

Aluno está relacionado à turma correta.

↓

Professor cria uma prova.

↓

Professor adiciona questões e gabarito.

↓

Professor publica para uma turma.

↓

Somente alunos daquela turma conseguem visualizar.

↓

Aluno inicia a prova.

↓

Tentativa é criada.

↓

Aluno responde.

↓

Cada resposta é salva automaticamente.

↓

Aluno fecha o navegador.

↓

Aluno entra novamente.

↓

Sistema recupera sua tentativa.

↓

Aluno finaliza.

↓

Sistema bloqueia alterações.

↓

Questões objetivas são corrigidas automaticamente.

↓

Questões discursivas aguardam correção.

↓

Professor corrige.

↓

Nota final é calculada.

↓

Resultado é armazenado.

↓

Professor consegue visualizar:

nota;

aproveitamento;

desempenho do aluno;

desempenho da turma;

índice de acertos por questão;

desempenho por conteúdo.

↓

Aluno visualiza somente o resultado que foi autorizado.

---

# 75. TESTES DE SEGURANÇA OBRIGATÓRIOS

Antes de considerar o sistema pronto, verificar:

Aluno A consegue acessar resultado do aluno B?

Resposta obrigatória: NÃO.

Aluno consegue trocar ID na URL e acessar outra prova?

NÃO.

Aluno consegue visualizar gabarito no HTML ou resposta da API?

NÃO.

Usuário sem autenticação consegue consultar banco diretamente?

NÃO.

Professor consegue visualizar turmas não autorizadas?

NÃO, salvo permissão definida.

CPF aparece em URLs?

NÃO.

Senhas estão armazenadas em texto puro?

NÃO.

RLS está ativa nas tabelas privadas?

SIM.

Endpoints sensíveis validam usuário e permissão?

SIM.

---

# 76. TESTES DE FALHA

Testar obrigatoriamente:

Internet cai no meio da prova.

Página é atualizada.

Navegador é fechado.

Aluno abre prova em outro computador.

Professor encerra prova enquanto aluno está respondendo.

Tempo acaba.

Resposta não consegue salvar.

Arquivo DOCX está corrompido.

Planilha possui CPF duplicado.

Planilha possui aluno já existente.

Questão é anulada.

Professor altera gabarito.

Prova possui questão discursiva.

Aluno deixa questão em branco.

Garantir comportamento previsível em todos esses casos.

---

# 77. REGRA DE OURO DO PROJETO

Nunca priorizar aparência em detrimento da lógica.

Nunca priorizar velocidade de desenvolvimento em detrimento da integridade das notas.

Nunca confiar somente no frontend para segurança.

Nunca apagar histórico acadêmico relevante.

Nunca publicar automaticamente conteúdo importado sem revisão.

Nunca expor gabarito durante prova.

Nunca permitir que falhas simples de internet façam o aluno perder todo o trabalho.

---

# 78. RESULTADO ESPERADO

O sistema final deve permitir que a escola substitua grande parte das provas impressas por avaliações digitais, mantendo uma experiência simples para o aluno e fornecendo ao professor informações muito mais completas do que apenas uma nota.

O objetivo final é transformar:

**PROVA**

em:

**PROVA → CORREÇÃO → NOTA → MÉTRICAS → ANÁLISE PEDAGÓGICA**

O sistema deverá permitir identificar não apenas quanto um aluno tirou, mas também:

* em quais conteúdos possui dificuldade;

* como está sua evolução;

* quais questões apresentam maior índice de erro;

* quais conteúdos precisam ser reforçados;

* como uma turma está performando;

* quais alunos estão abaixo da média.

Construa primeiro uma fundação sólida, segura e funcional.

Somente depois adicione recursos avançados.

Ao tomar decisões de arquitetura, priorize:

**integridade dos dados, segurança, simplicidade, rastreabilidade e experiência do usuário.**

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://grade-guardian-90.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d0e80369-6632-4426-8b81-d70de4d06a33).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
