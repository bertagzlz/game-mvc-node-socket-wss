const express = require("express");
const server = express();

// CARPETA PÚBLICA PASA JS, IMÁGENES
server.use(express.static('views'));

// USO EJS POR HABERLO USADO EN P2. motor plantillas similar a PUG
server.set("view engine", "ejs");

// BODY PARSING
server.use(express.urlencoded({ extended: false }));

const session = require('express-session');
//var session = require('cookie-session');
const passport = require("passport");
const { loginCheck } = require("./auth/passport");
loginCheck(passport);

//   C A R G A   D E   D A T O S   L O C A L E S   D O S   A R R A Y S
global.users=require("./data/data").users;
global.salas=require("./data/data").salas;
const Partida = require("./models/Partida.js");
const Jugador = require("./models/Jugador.js");

//   OBJETO DE CONEXIONES DE J U G A D O R E S
global.clients = {};

//   J U G A D O R   A C T U A L
global.esteJugador={};

//   P A R T I D A S
global.partidas = new Map();
global.conectados = []; //new Map();
global.noConectados=new Map();

salas.forEach(sala=>{
    let value = new Partida(sala.id,sala.name,sala.balls,sala.jugadores,sala.estado)
    partidas.set(sala.id,value)
})

const http = require("http");
const WEB_SOCKET_PORT = process.env.WEB_SOCKET_PORT || 9090;
const websocketServer = require("websocket").server;

const httpServer = http.createServer();
httpServer.listen(WEB_SOCKET_PORT, () => {
        console.log("Websockets por el puerto "+ WEB_SOCKET_PORT);
    }
)

//   B U C L E   D E   M E N S A J E S
// instance of the websocket server:
//const wsServer = require('express-ws')(server);
const wsServer = new websocketServer({ "httpServer": httpServer })

wsServer.on("request", request => {

    //   C O N N E C T
    const connection = request.accept(null, request.origin);
    //   O P E N
    connection.on("open", () => console.log("opened!"))
    //   C O N N E C T
    connection.on("close", () => console.log("closed!"))
    //   O N   M E S S A G E   F R O M   J U G A D O R
    connection.on("message", message => {

        const result = JSON.parse(message.utf8Data)

        //   U N   J U G A D O R   S E   C O N E C T A,   H A   H E C H O   L O G I N
        if (result.method === "connect") {
            const idJugador = result.idJugador;
            conectados.push(idJugador);
            console.log("connect del "+idJugador);

            //   R E C I B O   D E   T O D O S   L O   Q U E   H A Y
            updateAvatarEnConectados(idJugador);
            getAvataresJugando(idJugador);
        }

        //   U N   J U G A D O R   W A N T   T O   J O I N
        if (result.method === "join") {
            const idJugador = result.idJugador;
            const idSala = Number(result.idSala);
            console.log("JOIN del "+ idJugador +" en sala "+idSala);
            let partida = partidas.get(idSala);
            if (partida.getNumeroJugadores() > 2) {
                console.log("sorry max players reached");
                return;
            }
            // T O D A S   L A S   S A L A S   I G U A L E S   R O J O   Y   V E R D E
            partida.jugadores.push({
                "id": String(users[idJugador].id),
                "color": users[idJugador].color
            })
            // T O D O S   R E C I B E N   E L   N U E V O   A V A T A R   D E L   N U E V O JOINED
            updateMiAvatarAlResto(idJugador, idSala);
            borraMiAvatarEnRestoConectados(idJugador);
            //   S I   A D E M Á S   H A Y   D O S   E N   S A L A   S T A R T   T H E   G A M E
            if (partida.getNumeroJugadores() === 2) {
                // A   T O D O S   L O S   D E   L A   S A L A,   Y   A   É L
                // PONE SU COLOR Y DIBUJAR TABLERO
                const payLoad = {
                    "method": "join",
                    "partida": partida,
                    "idJugador": -1 // "0"
                }
                partida.jugadores.forEach(j => {
                    payLoad.idJugador = j.id;
                    clients[j.id].connection.send(JSON.stringify(payLoad))
                })
            }
        }

        //   U N   J U G A D O R   J U E G A
        if (result.method === "play") {
            const idJugador = result.idJugador;
            const idSala = Number(result.idSala);
            const idBall = result.idBall;
            const color = result.color; // color bola

            const partida = partidas.get(idSala);
            //let state = partidas.get(idSala].state;
            let state = partida.estados;
            if (!state)
                state = {}
            // state es un objeto {1: "Red"}. state.1 ó state[1] vale "Red"
            state[idBall] = color; // state es un objeto {"Red", "Green"....} con keys {1, 2,...}
            // añade nuevo color
            //partida.setEstado(idBall,color);
            partida.estados = state;
            updateGameState();
            // A C T U A L I Z O   B A R R A S   D E   P R O G R E S O   A   T O D O S
            let index = 0;
            /*for (const ix of Object.keys(partida.clients)) {
                if (partida.clients[ix].clientId === clientId) index = ix;
            }*/

            const isElement = (j) => j.id ===idJugador;
            index=partida.jugadores.findIndex(isElement);

            /*partida.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify({
                    "method": "newPoint", "idSala": idSala,"index": index,
                }))
            })*/

            // a los dos jugadores pero a la misma barra, ojo
            partida.jugadores.forEach(j => {
                clients[j.id].connection.send(JSON.stringify({
                    "method": "newPoint", "idSala": idSala,"color":color,"index": index,
                }))
            })


            let points = 0;
            /*for (const b of Object.keys(partidas.get(idSala].state)) {
                if (partidas.get(idSala].state[b] === color) {
                    points++;
                }
            }*/

            points=partida.getColoresPorJugador(color);

            // A   T O D O S:   clientId   H A   G A N A D O
            /*if (points > 7) {
                console.log("Gana el jugador: " + clientId);
                const payLoad = {
                    "method": "win",
                    "clientId": clientId,
                }
                partida.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                })
            }*/
            if (points > 7) {
                console.log("Gana el jugador: " + idJugador);
                const payLoad = {
                    "method": "win",
                    "idJugador": idJugador,
                }
                partida.jugadores.forEach(j => {
                    clients[j.id].connection.send(JSON.stringify(payLoad))
                })
            }
        }

        if (result.method === "updateAvatarContrario") {

            console.log("updateAvatar del contrario "+result.clientContrario);
            const payLoad = {
                "method": "updateAvatar",
                "idJugador":result.clientContrario,
                "clientContrario":result.clientId,
                "idSala":result.idSala,
            }
            clients[result.clientId].connection.send(JSON.stringify(payLoad))
        }

    }) //   F I N   O N   M E S S A G E   F R O M   J U G A D O R

    //   T O D O S   L O S   E N V Í O S   V A N   C O N   E S T A   C O N E X I Ó N
    const idJugador = esteJugador.id;
    clients[idJugador] = {
        "connection":  connection
    }

    let jugadoresPorSala={}
    for (const [key, value] of partidas) {
        jugadoresPorSala[key]=value.jugadores.length;
    }

    const payLoadSalas = {
        "method": "updateSalas",
        "partidas": partidas
    }
    /*partidas.get(0].clients.forEach(c=>{
        if (c.clientId !=clientId){
        }
    })*/
})

// irá a la sala de la ventana contraria
function updateMiAvatarAlResto(idJugador,idSala) {
    conectados.forEach(idContrario=> {
        if (idJugador != idContrario) {
            // el 1 es el idJugador, se lo tiene que decir al 0
            const payLoad = {
                "method": "updateAvatar",
                "idJugador": idJugador,
                "idSala": idSala,
            }
            // al contrario le pongo mi avatar en la sala
            clients[idContrario].connection.send(JSON.stringify(payLoad))
            console.log("updateAvatar mio en el contrario " + idContrario);
        }
    });
}
function getAvataresJugando(idReceptor){
// A está en sala, B se loguea (se conecta)
  for (const [key, value] of partidas) {
    const partida = partidas.get(key);
    partida.jugadores.forEach(e=> { // elemento del array
      const payLoad = {
        "method": "getAvatarJugador",
        "idJugador": e.id,
        "idSala": key,
      }
      clients[idReceptor].connection.send(JSON.stringify(payLoad))
    });
    }
}
function updateAvatarEnConectados(idJugador) {
    conectados.forEach(idContrario=> {
        if (idJugador != idContrario) {
            sendPayLoad("updateAvatarEnConectados",idContrario,idJugador);
            sendPayLoad("updateAvatarEnConectados",idJugador,idContrario);
        }
    });

}
// entra a jugar a la sala, sale de su barra de conectados don Drag&drop y el resto de usuarios
// debe saberlo para borrarlo también
function borraMiAvatarEnRestoConectados(idJugador) {
    conectados.forEach(idContrario=> {
    if (idJugador != idContrario) {
      sendPayLoad("borraMiAvatarEnRestoConectados",idContrario,idJugador);
    }
    });
}
function sendPayLoad(method, who, what) {
    const payLoad = { "method": method, "idJugador": what }
    clients[who].connection.send(JSON.stringify(payLoad))
    console.log(method + " "+who);
}

// A   T O D O S   L O S   U S U A R I O S   E N V I A M O S   E L   J U E G O   C O M P L E T O
// CADA 0,5 SEG.
function updateGameState(){
    // { "idSala", fasdfsf }
    for (const [key, value] of partidas) {
        const partida = partidas.get(key)
        if (partida.estados) {
        const payLoad = {
            "method": "update",
            "estados": partida.estados
        }
        partida.jugadores.forEach(j => {
            clients[j.id].connection.send(JSON.stringify(payLoad))
        })
        }
    }
    setTimeout(updateGameState, 500);
}
//
server.use(session({
    secret:'p3node',
    saveUninitialized: true,
    resave: true
}));

// MODULO PASSPORT para autenticar usuarios con datos locales
// npm install passport-local para uso con datos locales
server.use(passport.initialize());
server.use(passport.session());

// ENTRADA PRINCIPAL A LA APLICACIÓN
server.use("/", require("./controllers/entrada"));

// this runs after the server successfully starts:
function serverStart() {
    console.log('Server listening on port ' + PORT);
}
var PORT = process.env.PORT || 4111;
server.listen(PORT, serverStart());


