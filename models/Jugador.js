class Jugador {
  id;
  name;
  email;
  password;
  imagen;
  color; // = new Map();

  constructor(id,name, email, password, imagen, color) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.imagen = imagen;
    this.color=color; //(null? new Map(): this.#createMap(color));
  }
  /*#createMap(obj) {
    let map = new Map();
    Object.keys(obj).forEach(key => {
      map.set(key, obj[key]);
    });
    return map;
  }*/
  // llamada setColor ( {"0": "Red"} )
  /*setColor(k,v){
    this.color.set(k,v);
  }
  getColor(k){
    return this.color(k);
  }*/
  toString(){
    var str = "id: " + this.id + " | name: " + this.name + " | email: " + this.email + " "
        +this.password.substr(0,5)+"..."+
        + this.imagen +" color: "+this.color;
    return str;
  }
  log(){
    console.log("nuevo usuario creado ", this.toString());
  }
}
module.exports = Jugador;
