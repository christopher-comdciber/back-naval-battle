import express from 'express';
import cors from 'cors';
import { Jogo } from './game';
import type { Coordenada } from './board';
import type { Direcao } from './board';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const game = new Jogo(10);

app.get('/health', (req, res) => {
  res.json({ status: 'Server is online' });
});

app.post('/posicionarNavio', (req, res) => {
  const { playerId, inicio, comprimento, direcao } = req.body;
  console.log('Posicionar navio', playerId, inicio, comprimento, direcao);
  const data = game.posicionarNavio(
    playerId,
    inicio,
    comprimento,
    direcao as Direcao,
  );
  const { sucesso, coordenadas, tabuleiro, mensagem } = data;
  console.log('Sucesso', sucesso);
  res.json({ sucesso, coordenadas, tabuleiro, mensagem });
});

app.post('/attack', (req, res) => {
  const { playerId, coordinates } = req.body;
  const resultadoAtaque = game.atacar(playerId, coordinates);
  const { sucesso, coordenada, tabuleiro, mensagem } = resultadoAtaque;
  res.json({ sucesso, coordenada, tabuleiro, mensagem });
});

app.get('/getTabuleiro/:playerId', (req, res) => {
  const { playerId } = req.params;
  const tabuleiro = game.getTabuleiro(Number(playerId));
  res.json({ tabuleiro });
});

app.get('/todosNaviosPosicionados', (req, res) => {
  const todosPosicionados = game.todosNaviosPosicionados();
  res.json({ todosPosicionados });
});

app.get('/naviosPorJogador/:playerId', (req, res) => {
  const { playerId } = req.params;
  const todosNavisPosicionados = game.naviosPosicionadosPorJogador(
    Number(playerId),
  );
  res.json({ todosNavisPosicionados });
});

app.get('/fase', (req, res) => {
  const fase = game.getFase();
  res.json({ fase });
});

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
