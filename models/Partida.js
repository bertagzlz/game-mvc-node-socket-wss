class Partida {
  id;
  name;
  balls;
  jugadores=[];
  estados={};

  constructor(id, name, balls, jugadores, estados) {
    this.id = id;
    this.name = name;
    this.balls = balls;
    this.jugadores = jugadores;
    this.estados=estados;
  }
  getEstados() {
    return this.estados;
  }
  clearEstados() {
    this.estados={};
  }
  // puntos que lleva cada jugador en esta partida
  getColoresPorJugador(color) {
    let points=0;
    for (let i=0; i<this.balls; i++) {
      if (this.estados[i] === color) {
        points++;
      }
    }
    return points;
  }
  // en esta partida
  existeJugador(idJugador) {
    return (this.jugadores.indexOf(idJugador) === -1)
  }
  // en esta partida
  borrarJugador(idJugador){
    let i=0;
    this.jugadores.forEach(c=> { // req viene de juego.ejs
      if (c.id==idJugador) {
        this.jugadores.splice(i,1)
      } else { }
      i++;
    })
  }
  // en esta partida
  getNumeroJugadores(){
    return this.jugadores.length;
  }
  toString() {
    var str = "id " + this.id + " " + this.name + " " + this.balls + " "
        + this.jugadores.toString()
    +" "+estados.forEach(this.estadosToString());
    return str;
  }
}
module.exports = Partida;
