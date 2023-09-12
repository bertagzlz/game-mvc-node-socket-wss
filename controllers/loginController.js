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
noConectados.clear();
    users.forEach(u=>{
      if (conectados.find(c=>c===u.id) !=null) {
      } else {
      noConectados.set(u.id, u);
      }
    });
  /*const ids = users.filter(obj =>
      (item.id===obj.id) && (item.sala===obj.sala)
  );*/
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
    passport.authenticate("local", {
      successRedirect: "/juego",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res);
  }
};
const logoutUser=function(req, res, error_message) {
  try {

    let oppositePlayer;
    for (const  [key, value] of partidas) {
      const partida = partidas.get(key); // g vale "1"....es el idSala
      const existeEnLaPartida=partida.existeJugador(req.user.id);
      const hayJugando=partida.getNumeroJugadores();

      //  ESTABA JUGANDO CON UN CONTRARIO
      if (existeEnLaPartida && hayJugando===2){

        let i=0;
        // quien es el contrario?
        if (req.user.id==partida.jugadores[0].id) i=1;

        // AVISO AL CONTRARIO DE QUE SE HA IDO
        oppositePlayer=partida.jugadores[i].id;
        const payLoad = {
          "method": "disjoin",
          "partida":partida,
          "clientAQuitar":req.user.id,
        }
        console.log("disjoin del "+req.user.id);
        clients[oppositePlayer].connection.send(JSON.stringify(payLoad))
        clients[req.user.id].connection.send(JSON.stringify(payLoad))
        partida.clearEstados();
        partida.borrarJugador(req.user.id);
        var foundUser=conectados.find((u)=> u.id === oppositePlayer);
        if (foundUser) {
          const index = conectados.indexOf(foundUser.id);
          if (index > -1) { // only splice array when item is found
            conectados.splice(index, 1); // 2nd parameter means remove one item only
          }
        }
        //  ESTABA ÉL SOLO EN LA SALA SIN UN CONTRARIO
      } else if (existeEnLaPartida && hayJugando===1) {

        //  ME QUITO EL AVATAR DE LA SALA
        const thisPlayer=partida.jugadores[0].id;
        const payLoad = {
          "method": "disjoin",
          "partida":partida,
          "clientAQuitar":req.user.id,
        }
        console.log("disjoin del "+req.user.id);
        clients[thisPlayer].connection.send(JSON.stringify(payLoad))
        partida.clearEstados();
        partida.borrarJugador(req.user.id);
      }
      // ESTABA CONECTADO PERO NO JUGANDO
      else if (!existeEnLaPartida) {
        //  ME QUITO EL AVATAR DE LA SALA
        console.log("Este jugador NO jugaba pero estaba conectado????");
      }
      else {
        console.log("Este jugador ni jugaba ni estaba conectado????");
      }
     // partidas.delete(key);
     // partidas.set(key,partida);

    }

    delete req.session.authStatus;
    delete req.user;
    res.render("login", {});
  } catch (error) {
      res.end("LogoutUser. Internal server error");
  }
}

module.exports = {
  registerView,
  loginView,
  registerUser,
  loginUser,
  logoutUser,
};
