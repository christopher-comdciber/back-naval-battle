import { TabuleiroPosicionamento } from './board-posicionamento';
import { TabuleiroAtaque } from './board-ataque';
import type { Coordenada, Direcao } from './types';
import { Fase } from './types';

// deixar parametro como 0 ou 1
// controlar a vez de quem jogar

interface TabuleirosJogador {
  dePosicionamento: TabuleiroPosicionamento;
  deAtaque: TabuleiroAtaque;
}

export class Game {
  private tabuleiros: TabuleirosJogador[];
  private fase: Fase;
  private naviosPosicionados: number[];
  private totalNavios: number;
  private turnoAtual: number;

  constructor(tamanho: number, totalNavios: number) {
    this.tabuleiros = [
      {
        dePosicionamento: new TabuleiroPosicionamento(tamanho),
        deAtaque: new TabuleiroAtaque(tamanho),
      },
      {
        dePosicionamento: new TabuleiroPosicionamento(tamanho),
        deAtaque: new TabuleiroAtaque(tamanho),
      },
    ];
    this.fase = Fase.Posicionamento;
    this.naviosPosicionados = [0, 0];
    this.totalNavios = totalNavios;
    this.turnoAtual = 0;
  }

  public getTurnoAtual(): number {
    return this.turnoAtual;
  }

  public setTurnoAtual(turno: number): void {
    this.turnoAtual = turno;
  }

  public alternarTurno(): void {
    this.turnoAtual = this.turnoAtual === 0 ? 1 : 0;
  }

  public getFase(): Fase {
    return this.fase;
  }

  public setFase(fase: Fase): void {
    this.fase = fase;
  }

  public getPosicoesAtingidasDosJogadores(): {
    player1: { playerId: number; posicoesAtingidas: number };
    player2: { playerId: number; posicoesAtingidas: number };
  } {
    return {
      player1: { playerId: 0, posicoesAtingidas: this.tabuleiros[0].dePosicionamento.getPositionAtingidas() },
      player2: { playerId: 1, posicoesAtingidas: this.tabuleiros[1].dePosicionamento.getPositionAtingidas() },
    };
  }

  public getPosicoesTotaisDosJogadores(): {
    player1: { playerId: number; posicoesTotais: number };
    player2: { playerId: number; posicoesTotais: number };
  } {
    return {
      player1: { playerId: 0, posicoesTotais: this.tabuleiros[0].dePosicionamento.getPosicoesTotais() },
      player2: { playerId: 1, posicoesTotais: this.tabuleiros[1].dePosicionamento.getPosicoesTotais() },
    };
  }

  public getGrade(jogador: number): {
    ataque: string[][];
    posicionamento: string[][];
  } {
    if (jogador !== 0 && jogador !== 1) {
      throw new Error('Jogador inválido. Deve ser 0 ou 1.');
    }

    return {
      posicionamento: this.tabuleiros[jogador].dePosicionamento.getGrade(),
      ataque: this.tabuleiros[jogador].deAtaque.getGrade(),
    };
  }

  private verificarTodosNaviosPosicionados(): void {
    for (let i = 0; i < this.naviosPosicionados.length; i++) {
      if (this.naviosPosicionados[i] < this.totalNavios) {
        return;
      }
    }
    this.fase = Fase.Ataque;
  }

  public getTodosDoJogadorPosicionados(jogadorId: number): boolean {
    if (jogadorId !== 0 && jogadorId !== 1) {
      throw new Error('Jogador inválido. Deve ser 0 ou 1.');
    }
    return this.naviosPosicionados[jogadorId] === this.totalNavios;
  }

  public posicionarNavio(
    jogador: number,
    inicio: Coordenada,
    comprimento: number,
    direcao: Direcao,
  ): {
    sucesso: boolean;
    mensagem?: string;
    coordenadas?: Coordenada[];
    tabuleiro?: {
      ataque: string[][];
      posicionamento: string[][];
    };
  } {
    if (this.fase !== Fase.Posicionamento) {
      return {
        sucesso: false,
        mensagem: 'Não estamos na fase de posicionamento.',
      };
    }

    if (this.naviosPosicionados[jogador] >= this.totalNavios) {
      return {
        sucesso: false,
        mensagem: 'Todos os seus navios já foram posicionados.',
      };
    }

    const resultado = this.tabuleiros[jogador].dePosicionamento.posicionarNavio(inicio, comprimento, direcao);

    if (jogador !== 0 && jogador !== 1) {
      return { sucesso: false, mensagem: 'Jogador inválido. Deve ser 0 ou 1.' };
    }

    if (resultado.sucesso) {
      this.naviosPosicionados[jogador]++;
      this.verificarTodosNaviosPosicionados();
    }

    return {
      sucesso: resultado.sucesso,
      mensagem: resultado.sucesso ? 'Navio posicionado com sucesso.' : 'Falha ao posicionar navio.',
      coordenadas: resultado.coordenadas,
      tabuleiro: this.getGrade(jogador),
    };
  }

  public ataque(
    jogador: number,
    coordenada: Coordenada,
  ): {
    sucesso: boolean;
    acerto?: boolean;
    mensagem?: string;
    coordenada?: Coordenada;
    tabuleiro?: { ataque: string[][]; posicionamento: string[][] };
  } {
    if (jogador !== 0 && jogador !== 1) {
      return { sucesso: false, mensagem: 'Jogador inválido. Deve ser 0 ou 1.' };
    }

    if (this.fase !== Fase.Ataque) {
      return { sucesso: false, mensagem: 'Não estamos na fase de ataque.' };
    }

    const oponente = jogador === 1 ? 0 : 1;
    const acerto = this.tabuleiros[oponente].dePosicionamento.receberAtaque(coordenada);
    if (acerto) {
      this.tabuleiros[jogador].deAtaque.marcarAcerto(coordenada);
    } else {
      this.tabuleiros[jogador].deAtaque.marcarErro(coordenada);
    }

    const naviosRestantes = this.tabuleiros[oponente].dePosicionamento.getNaviosRestantes();
    const acabou =
      this.tabuleiros[oponente].dePosicionamento.getPosicoesTotais() -
      this.tabuleiros[oponente].dePosicionamento.getPositionAtingidas();

    if (acabou === 0) {
      console.log('acabou');
      this.fase = Fase.Fim;
      return {
        sucesso: true,
        acerto,
        coordenada,
        mensagem: `Jogador ${jogador === 1 ? 1 : 0} venceu!`,
        tabuleiro: this.getGrade(jogador),
      };
    }

    if (naviosRestantes === 0) {
      this.fase = Fase.Fim;
      return {
        sucesso: true,
        acerto,
        coordenada,
        mensagem: `Jogador ${jogador === 1 ? 1 : 0} venceu!`,
        tabuleiro: this.getGrade(jogador),
      };
    }

    return {
      sucesso: true,
      acerto,
      coordenada,
      mensagem: acerto ? 'Acertou!' : 'Errou!',
      tabuleiro: this.getGrade(jogador),
    };
  }

  public exibirTabuleiros(jogador: number): void {
    console.log(`Tabuleiro de Posicionamento do Jogador ${jogador + 1}:`);
    this.tabuleiros[jogador].dePosicionamento.exibir('Posicionamento');
    console.log(`Tabuleiro de Ataque do Jogador ${jogador + 1}:`);
    this.tabuleiros[jogador].deAtaque.exibir('Ataque');
  }
}
