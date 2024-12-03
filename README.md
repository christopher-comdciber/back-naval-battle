# Projeto de Batalha Naval

Este projeto implementa um jogo de Batalha Naval utilizando TypeScript, Node.js, e WebSockets. Abaixo está uma descrição detalhada de cada arquivo, suas funções principais e como eles se interligam.

## Estrutura do Projeto
```
biome.json
package.json
README.md
src/
  board-ataque.ts
  board-posicionamento.ts
  board.ts
  client.ts
  game.ts
  memento.ts
  socket.ts
  types.ts
tsconfig.json
```

## Descrição dos Arquivos

### `biome.json`
Configurações do Biome, um linter e formatador de código.

### `package.json`
Arquivo de configuração do npm, contendo as dependências do projeto e scripts de build e desenvolvimento.

### `tsconfig.json`
Configurações do compilador TypeScript.

### `src/board.ts`
Define a classe base `Board` que representa um tabuleiro genérico. Contém métodos para validar coordenadas, obter a grade do tabuleiro e exibir o tabuleiro no console.

### `src/board-ataque.ts`
Define a classe `TabuleiroAtaque` que estende `Board`. Adiciona métodos específicos para marcar acertos e erros no tabuleiro de ataque.

### `src/board-posicionamento.ts`
Define a classe `TabuleiroPosicionamento` que estende `Board`. Adiciona métodos para posicionar navios, receber ataques e verificar se um navio foi destruído.

### `src/client.ts`
Simula um cliente que se conecta ao servidor e realiza ações como posicionar navios e atacar.

### `src/game.ts`
Define a classe `Game` que gerencia o estado do jogo, incluindo os tabuleiros dos jogadores, a fase do jogo, e o turno atual. Contém métodos para posicionar navios, realizar ataques, alternar turnos, e criar/restaurar mementos.

### `src/memento.ts`
Implementa o padrão Memento para salvar e restaurar o estado do jogo.

### `src/socket.ts`
Configura o servidor WebSocket utilizando `socket.io`. Gerencia a comunicação em tempo real entre o servidor e os clientes, incluindo eventos para posicionar navios, realizar ataques, e obter o estado atual do jogo.

### `src/types.ts`
Define tipos e enums utilizados no projeto, como `Coordenada`, `Direcao`, `Navio`, e `Fase`.

## Interligação dos Arquivos

1. **Tabuleiros (`board.ts`, `board-ataque.ts`, `board-posicionamento.ts`)**:
   - `Board` é a classe base para `TabuleiroAtaque` e `TabuleiroPosicionamento`.
   - `TabuleiroAtaque` adiciona funcionalidades específicas para marcar acertos e erros.
   - `TabuleiroPosicionamento` adiciona funcionalidades para posicionar navios e receber ataques.

2. **Jogo (`game.ts`)**:
   - `Game` utiliza `TabuleiroPosicionamento` e `TabuleiroAtaque` para gerenciar os tabuleiros dos jogadores.
   - Contém a lógica principal do jogo, como alternar turnos, verificar o estado do jogo, e gerenciar a fase atual.

3. **Cliente (`client.ts`)**:
   - Simula ações de um jogador, como posicionar navios e realizar ataques, enviando requisições HTTP para o servidor.

4. **Servidor WebSocket (`socket.ts`)**:
   - Configura o servidor WebSocket e gerencia eventos de comunicação em tempo real.
   - Utiliza a classe `Game` para manipular o estado do jogo com base nos eventos recebidos dos clientes.

5. **Memento (`memento.ts`)**:
   - Implementa o padrão Memento para salvar e restaurar o estado do jogo.
   - Utilizado pela classe `Game` para criar e restaurar estados do jogo.

6. **Tipos (`types.ts`)**:
   - Define tipos e enums utilizados em todo o projeto para garantir a tipagem estática e evitar erros.

## Funções Principais e Interligações

### `Board`
- `coordenadaValida(coordenada: Coordenada): boolean`: Verifica se uma coordenada é válida dentro do tabuleiro.
- `getGrade(): string[][]`: Retorna a grade do tabuleiro.
- `exibir(nome: string): void`: Exibe o tabuleiro no console.

### `TabuleiroAtaque`
- `marcarAcerto(coordenada: Coordenada): void`: Marca um acerto no tabuleiro de ataque.
- `marcarErro(coordenada: Coordenada): void`: Marca um erro no tabuleiro de ataque.

### `TabuleiroPosicionamento`
- `posicionarNavio(inicio: Coordenada, comprimento: number, direcao: Direcao): { sucesso: boolean; coordenadas?: Coordenada[] }`: Posiciona um navio no tabuleiro.
- `receberAtaque(coordenada: Coordenada): boolean`: Recebe um ataque e verifica se acertou um navio.
- `verificarNavioDestruido(navio: Coordenada[]): boolean`: Verifica se um navio foi destruído.

### `Game`
- `posicionarNavio(jogador: number, inicio: Coordenada, comprimento: number, direcao: Direcao): { sucesso: boolean; mensagem?: string; coordenadas?: Coordenada[]; tabuleiro?: { ataque: string[][]; posicionamento: string[][] } }`: Posiciona um navio para um jogador.
- `ataque(jogador: number, coordenada: Coordenada): { sucesso: boolean; acerto?: boolean; mensagem?: string; coordenada?: Coordenada; tabuleiro?: { ataque: string[][]; posicionamento: string[][] } }`: Realiza um ataque.
- `alternarTurno(): void`: Alterna o turno entre os jogadores.
- `criarMemento(): Memento`: Cria um memento do estado atual do jogo.
- `restaurarMemento(memento: Memento): void`: Restaura o estado do jogo a partir de um memento.

### `Socket`
- `io.on('connection', (socket) => { ... })`: Gerencia a conexão de novos clientes e define eventos para posicionar navios, realizar ataques, e obter o estado atual do jogo.
