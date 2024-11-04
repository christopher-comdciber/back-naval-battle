import Table from 'cli-table3';

export type Coordenada = {
  x: number;
  y: number;
};

export enum Direcao {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export class Tabuleiro {
  private tamanho: number;
  private grade: string[][];
  private navios: Coordenada[][];

  constructor(tamanho: number) {
    this.tamanho = tamanho;
    this.grade = Array.from({ length: tamanho }, () =>
      Array(tamanho).fill('~'),
    );
    this.navios = [];
  }

  private coordenadaValida(coordenada: Coordenada): boolean {
    return (
      coordenada.x >= 0 &&
      coordenada.x < this.tamanho &&
      coordenada.y >= 0 &&
      coordenada.y < this.tamanho
    );
  }

  private obterCoordenadas(
    inicio: Coordenada,
    comprimento: number,
    direcao: Direcao,
  ): Coordenada[] {
    const coordenadas: Coordenada[] = [];
    if (direcao === Direcao.Horizontal) {
      for (let x = inicio.x; x < inicio.x + comprimento; x++) {
        coordenadas.push({ x, y: inicio.y });
      }
    } else if (direcao === Direcao.Vertical) {
      for (let y = inicio.y; y < inicio.y + comprimento; y++) {
        coordenadas.push({ x: inicio.x, y });
      }
    }
    return coordenadas;
  }

  public posicionarNavio(
    inicio: Coordenada,
    comprimento: number,
    direcao: Direcao,
  ): { sucesso: boolean; coordenadas?: Coordenada[] } {
    const coordenadas = this.obterCoordenadas(inicio, comprimento, direcao);

    for (const coord of coordenadas) {
      if (
        !this.coordenadaValida(coord) ||
        this.grade[coord.y][coord.x] !== '~'
      ) {
        return {sucesso: false, coordenadas};
      }
    }

    for (const coord of coordenadas) {
      this.grade[coord.y][coord.x] = 'N';
    }

    this.navios.push(coordenadas);

    return { sucesso: true, coordenadas };
  }

  public receberAtaque(coordenada: Coordenada): boolean {
    if (!this.coordenadaValida(coordenada)) {
      return false;
    }

    const celula = this.grade[coordenada.y][coordenada.x];
    if (celula === 'N') {
      this.grade[coordenada.y][coordenada.x] = 'X'; // Acerto
      return true;
    } if (celula === '~') {
      this.grade[coordenada.y][coordenada.x] = 'O'; // Erro
      return false;
    }
    return false;
  }

  public marcarAcerto(coordenada: Coordenada): void {
    if (this.coordenadaValida(coordenada)) {
      this.grade[coordenada.y][coordenada.x] = 'A';
    }
  }

  // public exibir(): void {
  //   console.log(this.grade.map((linha) => linha.join(' ')).join('\n'));
  // }

  public exibir(): void {
    const table = new Table({
      head: ['', ...Array.from({ length: this.tamanho }, (_, i) => i.toString())],
      colWidths: Array(this.tamanho + 1).fill(3),
    });

    for (let y = 0; y < this.tamanho; y++) {
      table.push([y.toString(), ...this.grade[y]]);
    }

    console.log(table.toString());
  }

  public getGrade(): string[][] {
    return this.grade;
  }
}
