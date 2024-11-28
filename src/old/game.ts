import type { TabuleiroAtaque } from '../board-ataque';
import type { TabuleiroPosicionamento } from '../board-posicionamento';
import type { Coordenada, Direcao } from '../types';
import { Tabuleiro } from './board';

enum Fase {
  Posicionamento = 'Posicionamento',
  Ataque = 'Ataque',
  FimDeJogo = 'FimDeJogo',
}

interface TabuleirosJogador {
  posicionamento: TabuleiroPosicionamento;
  ataque: TabuleiroAtaque;
}

export class Jogo {
  private tabuleiros: Tabuleiro[];
  private naviosPosicionados: number[];
  private bloqueio: boolean;
  private jogadorAtual: number;
  private totalNavios: number;
  private fase: Fase;

  constructor(tamanho: number) {
    this.tabuleiros = [new Tabuleiro(tamanho), new Tabuleiro(tamanho)];
    this.naviosPosicionados = [0, 0];
    this.bloqueio = false;
    this.jogadorAtual = 0;
    this.totalNavios = 5;
    this.fase = Fase.Posicionamento;
  }

  public iniciar(): void {
    console.log('Jogo iniciado!');
    this.exibirTabuleiros();
  }

  private exibirTabuleiros(): void {
    this.tabuleiros.forEach((tabuleiro, index) => {
      console.log(`Tabuleiro do Jogador ${index + 1}:`);
      tabuleiro.exibir();
    });
  }

  public exibirTabuleiro(jogadorId: number): void {
    console.log(`Tabuleiro do Jogador ${jogadorId + 1}:`);
    this.tabuleiros[jogadorId].exibir();
  }

  public getTabuleiro(jogadorId: number): Tabuleiro {
    return this.tabuleiros[jogadorId];
  }

  public posicionarNavio(
    jogadorId: number,
    inicio: Coordenada,
    comprimento: number,
    direcao: Direcao,
  ): {
    sucesso: boolean;
    coordenadas?: Coordenada[];
    tabuleiro: string[][];
    mensagem?: string;
  } {
    if (this.fase !== Fase.Posicionamento) {
      return {
        sucesso: false,
        tabuleiro: this.tabuleiros[jogadorId].getGrade(),
        mensagem: 'Ainda estamos na fase de posicionamento.',
      };
    }

    this.tabuleiros[jogadorId].exibir();

    if (this.naviosPosicionados[jogadorId] === this.totalNavios) {
      return {
        sucesso: false,
        tabuleiro: this.tabuleiros[jogadorId].getGrade(),
        mensagem: 'Todos os seus navios já foram posicionados.',
      };
    }

    const resultado = this.tabuleiros[jogadorId].posicionarNavio(inicio, comprimento, direcao);

    if (resultado.sucesso) {
      console.log(`Jogador ${jogadorId + 1} posicionou navio, total: ${this.naviosPosicionados[jogadorId] + 1}`);
      this.naviosPosicionados[jogadorId] += 1;
    }

    if (this.todosNaviosPosicionados()) {
      console.log('Todos os navios foram posicionados, vamos para a fase de ataque!');
      this.fase = Fase.Ataque;
    }

    return {
      sucesso: resultado.sucesso,
      coordenadas: resultado.coordenadas,
      tabuleiro: this.tabuleiros[jogadorId].getGrade(),
      mensagem: 'Navio posicionado com sucesso!',
    };
  }

  public todosNaviosPosicionados(): boolean {
    return this.naviosPosicionados[0] === this.totalNavios && this.naviosPosicionados[1] === this.totalNavios;
  }

  public naviosPosicionadosPorJogador(jogadorId: number): boolean {
    return this.naviosPosicionados[jogadorId] === this.totalNavios;
  }

  public atacar(
    atacanteId: number,
    coordenada: Coordenada,
  ): {
    sucesso: boolean;
    coordenada: Coordenada;
    tabuleiro: string[][];
    mensagem?: string;
  } {
    if (this.fase !== Fase.Ataque) {
      return {
        sucesso: false,
        coordenada,
        tabuleiro: this.tabuleiros[atacanteId].getGrade(),
        mensagem: 'Ainda estamos na fase de posicionamento.',
      };
    }

    if (this.bloqueio) {
      return {
        sucesso: false,
        coordenada,
        tabuleiro: this.tabuleiros[atacanteId].getGrade(),
        mensagem: 'Outro jogador está atacando. Por favor, aguarde.',
      };
    }

    if (atacanteId !== this.jogadorAtual) {
      return {
        sucesso: false,
        coordenada,
        tabuleiro: this.tabuleiros[atacanteId].getGrade(),
        mensagem: 'Não é sua vez de atacar.',
      };
    }

    this.bloqueio = true;

    if (!this.todosNaviosPosicionados()) {
      console.log('Todos os navios precisam ser posicionados!');
      this.bloqueio = false;
      return {
        sucesso: false,
        coordenada,
        tabuleiro: this.tabuleiros[atacanteId].getGrade(),
        mensagem: 'Todos os jogadores precisam estar com os navis posicionados!',
      };
    }

    const oponenteId = (atacanteId + 1) % 2;
    const acerto = this.tabuleiros[oponenteId].receberAtaque(coordenada);
    console.log(`Jogador ${atacanteId + 1} atacou ${coordenada.x}, ${coordenada.y} e ${acerto ? 'acertou' : 'errou'}`);

    this.jogadorAtual = oponenteId;

    if (acerto) {
      this.tabuleiros[atacanteId].marcarAcerto(coordenada);
      this.jogadorAtual = atacanteId;

      if (this.tabuleiros[oponenteId].todosNaviosDestruidos()) {
        this.fase = Fase.FimDeJogo;
        console.log(`Jogador ${atacanteId + 1} venceu o jogo!`);
        return {
          sucesso: true,
          coordenada,
          tabuleiro: this.tabuleiros[atacanteId].getGrade(),
          mensagem: 'Fim de jogo! Você venceu!',
        };
      }
    }

    this.bloqueio = false;

    this.exibirTabuleiros();

    return {
      sucesso: acerto,
      coordenada,
      tabuleiro: this.tabuleiros[atacanteId].getGrade(),
      mensagem: acerto ? 'Acertou!' : 'Errou!',
    };
  }

  public getEstado() {
    return this.tabuleiros.map((tabuleiro, index) => ({
      jogador: index,
      tabuleiro: tabuleiro.getGrade(),
    }));
  }

  public getFase(): Fase {
    return this.fase;
  }
}
