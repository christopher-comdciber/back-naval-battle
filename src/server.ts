import express from 'express';
import cors from 'cors';
import { Game } from './game';
import { Fase, type Coordenada, type Direcao } from './types';
import { Server } from 'socket.io';
import http from 'node:http';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const game = new Game(10, 5);

app.get('/health', (req, res) => {
  res.json({ status: 'Server is online' });
});

app.post('/posicionarNavio', (req, res) => {
  const { playerId, inicio, comprimento, direcao } = req.body;
  console.log('Posicionar navio', playerId, inicio, comprimento, direcao);
  const resultado = game.posicionarNavio(playerId, inicio as Coordenada, comprimento, direcao as Direcao);
  console.log('Resultado', JSON.stringify(resultado, null, 2)); // Usar JSON.stringify para exibir arrays completos
  res.json(resultado);

  if (game.getFase() === Fase.Ataque) {
    io.emit('faseAlterada', { fase: game.getFase() });
  }
});

app.post('/atacar', (req, res) => {
  const { playerId, coordenada } = req.body;
  console.log('Tentando atacar');
  console.log('playerId', playerId);
  console.log('vez de quem', game.getTurnoAtual());
  if (game.getTurnoAtual() === playerId) {
    console.log('Atacar', playerId, coordenada);
    const resultado = game.ataque(playerId, coordenada as Coordenada);
    console.log('Resultado', resultado);
    res.json(resultado);

    if (game.getFase() === Fase.Fim) {
      io.emit('fimDeJogo', { fase: game.getFase(), vencedor: playerId });
    }

    const adversarioId = playerId === 1 ? 0 : 1;
    const tabuleiro = game.getGrade(adversarioId);

    const tabuleiroTransformado = {
      ...tabuleiro,
      posicionamento: tabuleiro.posicionamento.map((row) => row.map((cell) => (cell === 'N' ? '~' : cell))),
    };

    io.emit('ataqueRecebido', { tabuleiro: tabuleiroTransformado, playerId });

    if (!resultado.acerto) {
      game.alternarTurno();
      io.emit('turnoAlterado', { turnoAtual: game.getTurnoAtual() });
    }
  }
});

app.get('/tabuleiro/:playerId', (req, res) => {
  const { playerId } = req.params;
  try {
    const tabuleiro = game.getGrade(Number(playerId));
    res.json(tabuleiro);
  } catch (error) {
    res.status(400).json({ mensagem: 'Erro ao obter o tabuleiro' });
  }
});

app.get('/naviosPorJogador/:playerId', (req, res) => {
  const { playerId } = req.params;
  const todosNavisPosicionados = game.getTodosDoJogadorPosicionados(Number(playerId));
  res.json({ todosNavisPosicionados });
});

app.get('/fase', (req, res) => {
  const fase = game.getFase();
  res.json({ fase });
});

server.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});
