import axios from 'axios';

const player1 = { playerId: 0 };
const player2 = { playerId: 1 };

async function main() {
  try {
    console.log('Player 1 connected');
    let response = await axios.post('http://localhost:3000/posicionarNavio', {
      playerId: player1.playerId,
      inicio: { x: 0, y: 0 },
      comprimento: 5,
      direcao: 'horizontal',
    });
    console.log('Player 1 posicionarNavio:', response.data);

    console.log('Player 2 connected');
    response = await axios.post('http://localhost:3000/posicionarNavio', {
      playerId: player2.playerId,
      inicio: { x: 1, y: 1 },
      comprimento: 4,
      direcao: 'vertical',
    });
    console.log('Player 2 posicionarNavio:', response.data);

    response = await axios.post('http://localhost:3000/attack', {
      playerId: player1.playerId,
      coordinates: { x: 1, y: 1 },
    });
    console.log('Player 1 attack:', response.data);

    response = await axios.post('http://localhost:3000/attack', {
      playerId: player2.playerId,
      coordinates: { x: 0, y: 0 },
    });
    console.log('Player 2 attack:', response.data);
  } catch (error) {
    console.error(error);
  }
}

main();
