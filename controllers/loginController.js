const passport = require("passport");
const bcrypt = require("bcryptjs");

//   M O D E L O   D E   D A T O S
const Jugador = require("../models/Jugador.js");

//   D A T O S   L O C A L E S   S I N   P E R S I S T E N C I A
// los tengo como globales en index.js

//   R E G I S T E R

//   V I S T A
const registerView = (req, res) => {
  res.render("register", {});
};

//   S U B M I T for Register
const registerUser = (req, res) => {
  const { name, email, password, confirm, imagen } = req.body;

  if (!name || !email || !password || !confirm || !imagen) {
    console.log("Rellene campos vacíos");
  }

  //Confirm Passwords
  if (password !== confirm) {
    console.log("Passwords deben emparejar");
  } else {

  // Validation and redirect login o register (change email)
  var foundUser=users.find((u)=> u.email === email);
  if (foundUser) {
    console.log("email existe");
    res.render("register", { name, email, password, confirm, imagen })
  } else {

  //const newUser = new Userlocal(name, email, password,imagen);
  const newJugador = new Jugador(-1,name, email, password,imagen);

  //Password Hashing
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newJugador.password, salt, (err, hash) => {
             if (err) console.log(err);
          newJugador.password = hash;
              //catch((err) => console.log(err));
        })
  );

  // id
  const ids = users.map((user) => user.id);
  let id = Math.max(...ids) + 1;
  newJugador.id=id;

  // color
  let color = '#'+Math.floor(Math.random()*16777215).toString(16);
  //newUser.setColor(id,color);
  newJugador.color=color;

  newJugador.log();
  users.push(newJugador);
  res.render("login", {});

    }
  }
};

//   L O G I N
//   V I S T A
const loginView = (req, res) => {
  noConectados.clear(); // borra todos los elem del Map
  users.forEach(u=>{
    if (conectados.contiene(u.id)) {
      //if (conectados.find(c=>c===u.id) !=null) {
    } else {
      noConectados.set(u.id, u);
    }
  });
  res.render("login", {});
};
//   S U B M I T // redirect login OR juego
const loginUser = (req, res) => {
  const { email, password } =req.body;
  //{email: 'j@gmail.com',password:'12345678'};

  //Required
  if (!email || !password) {
    console.log("Rellene todos los campos");
    res.render("login", {
      email,
      password,
    });
  }
  else {
    var foundUser = users.find((u) => u.email === email);
    if (foundUser!=null) esteJugador=foundUser;
    if (noConectados.has(foundUser.id)) noConectados.delete(foundUser.id);
    passport.authenticate("local", {
      successRedirect: "/juego",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res);
  }
};



const logoutUser=function(req, res, error_message) {
  try {

    // PARA TODAS LAS PARTIDAS BUSCO EN QUÉ PARTIDA JUEGA
    let partida=null;
    let existeEnLaPartida=false;
    let hayJugando=0;
    for (const  [key, value] of partidas) {
      partida = partidas.get(key); // g vale "1"....es el idSala
      existeEnLaPartida = partida.contieneJugador(req.user.id);
      hayJugando = partida.getNumeroJugadores();
      if (existeEnLaPartida) break;
    }
    console.log("Logout del user "+ req.user.id);
    // SI JUEGA EN UNA PARTIDA
    if (existeEnLaPartida) {
      console.log(req.user.id+" sale de la sala "+partida.id);
      conectados.getArray().forEach(idConectado => {
        const payLoad = { "method": "disjoin", "partida": partida, "clientAQuitar": req.user.id }
        // TODOS LOS CONECTADOS TIENEN UNA SALA CON ESE JUGADOR Y EL MISMO SE QUITA DE SU SALA
        // removeChild de la sala, nada más
        clients[idConectado].connection.send(JSON.stringify(payLoad))
        console.log(req.user.id+" sale de la sala "+partida.id+" en el usuario "+idConectado);
      });
      conectados.quitarElemento(req.user.id);
      partida.borrarJugador(req.user.id);

      // AVISO A TODOS DE QUE SE HA IDO
      if (hayJugando===2) {
        // quien es el contrario?
        //let i=0;
        //if (req.user.id===partida.jugadores[0].id) i=1;
        //const oppositePlayer=partida.jugadores[i].id;
        // borre un jugador, luego sólo puede haber uno en la partida
        const oppositePlayer=partida.jugadores[0].id;
        // removeChild de la sala al contrario, nada más
        const payLoad = { "method": "disjoin", "partida":partida, "clientAQuitar": oppositePlayer }
        clients[req.user.id].connection.send(JSON.stringify(payLoad))
        partida.clearEstados();
      }
    }

    // ESTABA CONECTADO PERO EN NINGUNA PARTIDA
    else if (conectados.contiene(req.user.id)) {
      console.log("borra Avatar del "+req.user.id+ " en todos los conectados");
      conectados.getArray().forEach(idConectado => {
        const payLoad = { "method": "borraMiAvatarEnRestoConectados", "idJugador": req.user.id }
        // B logout
        // dile a A que borre a B
        // dile a B que borre a B
        clients[idConectado].connection.send(JSON.stringify(payLoad))
        console.log("\tborra Avatar del "+req.user.id+ " en el user "+idConectado);
      });
      // quita a B de conectados
      conectados.quitarElemento(req.user.id);
      console.log("borra partidas del usuario "+req.user.id);
      // dile a B que borre a A
      conectados.getArray().forEach(idConectado => {
        existeEnLaPartida=false;
        for (const  [key, value] of partidas) {
          partida = partidas.get(key); // g vale "1"....es el idSala
          existeEnLaPartida=partida.contieneJugador(idConectado);

          if (existeEnLaPartida) {
            partida.jugadores.forEach(j => {
              console.log("\tsaca de la partida "+partida.id+" al user "+j.id+" en la ventana del user "+req.user.id);
              const payLoad = {"method": "disjoin", "partida": partida, "idJugador": j.id}
              clients[req.user.id].connection.send(JSON.stringify(payLoad))
            });
            break;
          }
        }
      });
    } else {
      console.log("Algo raro pasa. User logout no está en partida ni en conectdos.");
    }
    noConectados.set(req.user.id, req.user );
    delete req.session.authStatus;
    delete req.user;
    res.render("login", {});

  } catch (error) {
      res.end("LogoutUser. Internal server error.\n"+error_message);
  }
}

module.exports = {
  registerView,
  loginView,
  registerUser,
  loginUser,
  logoutUser,
};
