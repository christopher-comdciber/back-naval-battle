import Table from 'cli-table3';
import { Direcao, type Coordenada } from '../types';

export class Tabuleiro {
  private tamanho: number;
  private grade: string[][];
  private navios: Coordenada[][];
  private naviosRestantes: number;

  constructor(tamanho: number) {
    this.tamanho = tamanho;
    this.grade = Array.from({ length: tamanho }, () => Array(tamanho).fill('~'));
    this.navios = [];
    this.naviosRestantes = 0;
  }

  // Verifica se uma coordenada é válida dentro do tabuleiro
  private coordenadaValida(coordenada: Coordenada): boolean {
    return coordenada.x >= 0 && coordenada.x < this.tamanho && coordenada.y >= 0 && coordenada.y < this.tamanho;
  }

  // Obtém as coordenadas que um navio ocupará no tabuleiro
  private obterCoordenadas(inicio: Coordenada, comprimento: number, direcao: Direcao): Coordenada[] {
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

  // Posiciona um navio no tabuleiro
  public posicionarNavio(
    inicio: Coordenada,
    comprimento: number,
    direcao: Direcao,
  ): { sucesso: boolean; coordenadas?: Coordenada[] } {
    const coordenadas = this.obterCoordenadas(inicio, comprimento, direcao);

    // Verifica se todas as coordenadas são válidas e estão livres
    for (const coord of coordenadas) {
      // Verifica se a coordenada é válida e se a célula está livre (não ocupada por outro navio)
      if (
        !this.coordenadaValida(coord) || // Coordenada fora dos limites do tabuleiro
        this.grade[coord.y][coord.x] !== '~' // Célula já ocupada (não está livre)
      ) {
        return { sucesso: false, coordenadas };
      }
    }

    for (const coord of coordenadas) {
      this.grade[coord.y][coord.x] = 'N';
    }

    this.navios.push(coordenadas);
    this.naviosRestantes += 1;

    return { sucesso: true, coordenadas };
  }

  // Recebe um ataque em uma coordenada específica
  public receberAtaque(coordenada: Coordenada): boolean {
    if (!this.coordenadaValida(coordenada)) {
      return false;
    }

    const celula = this.grade[coordenada.y][coordenada.x];
    if (celula === 'N') {
      this.grade[coordenada.y][coordenada.x] = 'X';
      this.verificarNavioDestruido(coordenada);
      return true;
    }

    if (celula === '~') {
      this.grade[coordenada.y][coordenada.x] = 'O';
      return false;
    }
    return false;
  }

  // Marca uma coordenada específica como um acerto
  public marcarAcerto(coordenada: Coordenada): void {
    if (this.coordenadaValida(coordenada)) {
      this.grade[coordenada.y][coordenada.x] = 'A';
    }
  }

  // Verifica se um navio foi destruído
  private verificarNavioDestruido(coordenada: Coordenada): void {
    for (const navio of this.navios) {
      let coordenadaEncontrada = false;
      for (const coord of navio) {
        if (coord.x === coordenada.x && coord.y === coordenada.y) {
          coordenadaEncontrada = true;
          break;
        }
      }

      if (coordenadaEncontrada) {
        let navioDestruido = true;
        for (const coord of navio) {
          if (this.grade[coord.y][coord.x] !== 'X') {
            navioDestruido = false;
            break;
          }
        }

        if (navioDestruido) {
          this.naviosRestantes -= 1;
        }
        return; // Saia do loop assim que encontrar o navio correspondente
      }
    }
  }

  public todosNaviosDestruidos(): boolean {
    return this.naviosRestantes === 0;
  }

  // public exibir(): void {
  //   console.log(this.grade.map((linha) => linha.join(' ')).join('\n'));
  // }

  // Exibe o tabuleiro no console do Servidor
  public exibir(): void {
    const table = new Table({
      head: ['', ...Array.from({ length: this.tamanho }, (_, i) => i.toString())],
      colWidths: Array(this.tamanho + 1).fill(3),
    });

    this.grade.forEach((linha, y) => table.push([y.toString(), ...linha]));

    console.log(table.toString());
  }

  // Retorna a grade do tabuleiro
  public getGrade(): string[][] {
    return this.grade;
  }
}
