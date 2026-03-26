# Revisão do Sistema

**Revisado por: Alisson Gabriel Assunção de Oliveira**  
**Link do repositório: https://github.com/hrodruck/TALP1**  
**Responsável pela implementação: Rodrigo Vitor Castro Alves de Mello**

---

# Revisão do Sistema

## 1. O sistema está funcionando com as funcionalidades solicitadas?

O sistema proposto para desenvolvimento como primeiro experimento prático com utilização de agentes tem como objetivo 4 módulos **principais**: Gerenciamento de questões, Gerenciamento de provas, Geração de PDFs e Correção de provas.

### Funcionalidade 1 – Gerenciamento de questões

Este primeiro módulo está desenvolvido de forma quase completa. Atualmente é possível fazer a adição de uma questão clicando no botão **"Add Question"**, que abre uma caixa de diálogo padrão do navegador onde é possível inserir o enunciado da questão. Também é possível fazer a adição das alternativas, marcando quais são as corretas. Também é possível remover individualmente alternativas ou remover a questão inteira, porém só é permitido editar o enunciado de uma questão, já a descrição das alternativas, isto não é possível.

Não há validações no sistema para verificar se uma questão possui no mínimo 1 alternativa correta, e 1 alternativa incorreta.

### Funcionalidade 2 – Gerenciamento de provas

Este módulo não foi implementado neste sistema, logo não é possível incluir, ler, editar ou remover provas.

### Funcionalidade 3 – Geração de PDFs

Este módulo também está desenvolvido de forma quase completa. Atualmente é possível gerar PDFs com todas as questões cadastradas, podendo selecionar a quantidade de combinações necessárias e escolher entre letras ou potências de 2. Cada PDF é baixado individualmente com seus respectivos gabaritos.

Não há validação para verificar se há ao menos uma questão cadastrada, logo é possível gerar um PDF somente com o cabeçalho. Quando é solicitado apenas um PDF, não é inserido o rodapé com o número da prova.

O gabarito gerado contém apenas qual é a alternativa correta para cada questão, o que impossibilitaria a revisão no modo "Parcial".

### Funcionalidade 4 – Correção de provas

Este módulo também não foi implementado neste sistema, logo não é possível fazer a correção de forma "Rigorosa" ou "Parcial" nem gerar o relatório de notas da turma.

## 2. Quais os problemas de qualidade do código e dos testes?

Os sistemas estão corretamente separados no **frontend**, que é a camada de apresentação/interface, e no **backend**, que é a camada responsável por orquestrar as regras de negócio.

### O Frontend

Nesta camada, o projeto está separado em 2 pastas principais, que são a de `components`, onde há um único arquivo, e a de `utils`, que também possui um único arquivo; os demais arquivos estão concentrados na raiz do front.

O problema principal encontrado é a falta de modularização do sistema: o `App.tsx` mistura lógica de busca de dados, manipulação de estado e renderização em um único componente de 184 linhas. O mesmo problema acontece no arquivo `pdfGenerator.ts`, e no `QuestionItem.tsx` onde seria melhor separar as responsabilidades aplicando o conceito **Single Responsibility Principle** do SOLID.

Outro problema identificado é em relação à padronização dos idiomas, a interface está em inglês, porém o PDF gerado está em português.

### O Backend

Nesta camada, o projeto não segue nenhum padrão de arquitetura, toda a lógica está concentrada em um único arquivo chamado `server.ts`. O principal problema encontrado é o mesmo identificado no frontend, pois não há modularização do projeto.

Outro ponto está relacionado à indentação do código, não há espaço entre os blocos.

Por fim, um possível problema de segurança, pois não há sanitização dos dados que são recebidos da requisição, podendo ocasionar problemas de **XSS**, ou se fosse conectado a algum BD o **SQL Injection**.

### Testes de aceitação (Cucumber/Gherkin)

Não existe nenhum arquivo `.feature`, nenhuma configuração do Cucumber e nenhuma suite de testes no projeto.

### 3. Como a funcionalidade e a qualidade desse sistema pode ser comparada com as do seu sistema?

O principal ponto de comparação está relacionado à separação do projeto, em duas camadas, cliente (frontend) e servidor (backend). Outro ponto seria a persistência de dados em arquivos JSON e também permitir que seja possível excluir individualmente uma alternativa de uma questão.

---

# Revisão do Histórico de Desenvolvimento

## 1. Estratégias de interação utilizada

Com base no histórico da planilha, a estratégia utilizada foi de prompts incrementais, divididos por funcionalidade. Acredito que, no primeiro prompt, houve uma sobrecarga de contexto, visto que, além de implementar o gerenciamento de questões, o agente também precisou criar e configurar as estruturas iniciais das camadas de frontend e backend.

## 2. Situações em que o agente funcionou melhor ou pior

### Situações em que o agente funcionou melhor

- Geração do scaffolding inicial (estrutura de pastas, `package.json`, configuração do TypeScript e Tailwind).
- Utilização de dependências populares, como a do `jsPDF`.

### Situações em que o agente funcionou pior

- Mesmo sendo solicitado para modularizar o código, o agente não foi capaz de separar corretamente as responsabilidades.
- Não solicitar do usuário, validações ou confirmações do que estava sendo implementado.

## 3. Tipos de problemas observados (por exemplo, código incorreto ou inconsistências)

O principal problema encontrado ocorreu ao iniciar o projeto. Não há, no `package.json`, a referência à biblioteca `jsPDF`, o que gera um erro em tempo de execução (runtime), já que a dependência não é instalada via npm install.

Outro problema ocorre no carregamento das questões cadastradas no `questions.json`, que não são exibidas quando a aplicação é inicializada na primeira vez.

## 4. Avaliação geral da utilidade do agente no desenvolvimento

O agente foi útil para acelerar a criação da infraestrutura do projeto, porém não foi eficaz em fazer a modularização correta do código com base nas features que foram solicitadas, ocasionando um problema de manutenabilidade e expansibilidade do projeto.

## 5. Comparação com a sua experiência de uso do agente

Pude perceber que a granularização do prompt ajuda o agente a entender melhor os requisitos necessários para a criação das funcionalidades. O modelo utilizado por mim foi o **Claude Sonnet 4.6** com o `CLAUDE.MD` com as principais especificações do projeto, e quatro skills de boas práticas, React, Node, testes com Gherkin e commits semânticos. O resultado que obtive em comparação, mostra que a estratégia de granularizar, utilizar skills e agent.md resulta em um projeto mais próximo de um nível aceitável para implantação em ambiente produtivo.
