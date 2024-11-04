import { Tabuleiro, type Coordenada, type Direcao } from "./board";

export class Jogo {
  private tabuleiros: Tabuleiro[];

  constructor(tamanho: number) {
    this.tabuleiros = [new Tabuleiro(tamanho), new Tabuleiro(tamanho)];
  }

  public iniciar(): void {
    console.log("Jogo iniciado!");
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
  ):  { sucesso: boolean; coordenadas?: Coordenada[]; tabuleiro: string[][] } {
    this.tabuleiros[jogadorId].exibir();
    const resultado = this.tabuleiros[jogadorId].posicionarNavio(
      inicio,
      comprimento,
      direcao,
    );

    return {
      sucesso: resultado.sucesso,
      coordenadas: resultado.coordenadas,
      tabuleiro: this.tabuleiros[jogadorId].getGrade(),
    };
  }

  public atacar(atacanteId: number, coordenada: Coordenada): void {
    const oponenteId = (atacanteId + 1) % 2;
    const acerto = this.tabuleiros[oponenteId].receberAtaque(coordenada);
    console.log(
      `Jogador ${atacanteId + 1} atacou ${coordenada.x}, ${coordenada.y} e ${acerto ? "acertou" : "errou"}`,
    );

    if (acerto) {
      this.tabuleiros[atacanteId].marcarAcerto(coordenada);
    }

    this.exibirTabuleiros();
  }

  public getEstado() {
    return this.tabuleiros.map((tabuleiro, index) => ({
      jogador: index + 1,
      tabuleiro: tabuleiro.getGrade(),
    }));
  }
}