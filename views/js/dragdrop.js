function dragStart(ev) {
    ev.dataTransfer.effectAllowed='move'; // copy, move or link
    ev.dataTransfer.setData('text/html', ev.target.getAttribute('id'));
    return true;
}
function dragEnter(ev) {
    ev.preventDefault();
    return true;
}
function dragOver(ev) {
    ev.target.style.opacity = "0.4";
    ev.preventDefault();
    return false;
}
function dragDrop(ev) {
    // O R I G E N   ID DEL USUARIO EN SU IMAGEN DE AVATAR
    var src = ev.dataTransfer.getData('text/html');
    var origen=document.getElementById(src);

    //   S Ó L O   P U E D E   H A B E R   D O S   E N   L A   S A L A
    if (ev.target.childElementCount < 2) {
        // O R I G E N   E N   E L   D E S T I N O   ID="Sala 1"...
        ev.target.appendChild(origen);

        join(Number(document.getElementById(src).id), Number(ev.target.getAttribute('id').substr(5, 1)))
        ev.stopPropagation();

        // NO USO LS DE MOMENTO   //addItem(origen.id, ev.target.getAttribute('id'));
        ev.target.style.opacity = "1";
        //ev.target.style.width="80px";
        ev.target.style.border = "2px dotted #ffaa99";
    } else {
        alert("Ya hay dos jugadores en esta sala")
    }
    return false;
}

// añade un id de html a la Sala 0, Sala 1...
function mostrarEnSala(idPlayer, idSala) {
    if (document.getElementById(idPlayer) !=null) {
        let node = document.getElementById(idPlayer);
        // necesito colocar esto: <img id="1" src="./images/avatar1.jpg" ...>
        // a la sala j
        document.getElementById("Sala "+idSala).appendChild(node);
    }
}
function quitarAvatarDeSala(idPlayer, idSala) {
    if (document.getElementById(idPlayer) !=null) {
        let node = document.getElementById(idPlayer);
        document.getElementById("Sala "+idSala).removeChild(node);
    }
}

//   U N   J U G A D O R   W A S   J O I N E D,   E N T R A   E N   P A R T I D A
function updateMiAvatarAlResto(idRecentJoined, idSala){
    let img =document.createElement('img');
    let user=users.find ( u => (u.id === Number(idRecentJoined)));
    console.log("En esta página: updateMiAvatarAlResto (userId: " + idRecentJoined+", "+idSala+")");
    img.id=idRecentJoined;
    img.src=user.imagen;
    img.tagName=user.name;
    img.alt="avatar"+idRecentJoined;
    img.draggable=true;
    img.style.width="80px";
    // colocando <img id="4" src="./images/avatar4.jpg" name="avatar" alt="avatar" draggable="true" width="80px">
    document.getElementById("Sala "+idSala).appendChild(img);
}

function updateAvatarEnConectados(idNuevo, draggable){
    let img =document.createElement('img');
    // idContrario viene como "1" no lo entiendo
    let user=users.find ( u => (u.id === Number(idNuevo)));
    console.log("En esta página: crearAvatarMioEnConectados (userId: " + idNuevo+")");
    img.id=idNuevo;
    img.src=user.imagen;
    img.tagName=user.name;
    img.alt="avatar"+idNuevo;
    img.draggable=draggable;
    img.style.width="80px";
    // colocando <img id="4" src="./images/avatar4.jpg" name="avatar" alt="avatar" draggable="true" width="80px">
    document.getElementById("conectados").appendChild(img);
    document.getElementById(idNuevo).setAttribute('draggable', draggable);
}
function quitarAvatarDeConectados(idExistente){
    console.log("En esta página: quitarAvatarEnConectados (userId: " + idExistente+")");
    let img=document.getElementById(idExistente);
    // borrando <img id="4" src="./images/avatar4.jpg" name="avatar" alt="avatar" draggable="true" width="80px">
    document.getElementById("conectados").removeChild(img);
}

function join(id, sala) {
    // MSJ ->   N O D E:   J O I N   U S U A R I O   C A R G A   T A B L E R O + B O T O N E S
    const payLoad = {
        "method": "join",
        "idJugador": id,
        "idSala": sala,
    }
    ws.send(JSON.stringify(payLoad));
}

// borra del localStorage el item cuyo id es field1
function deleteItem(field1) { //},field2) {
    if (localStorage.getItem("items") !== null) {
        var items = JSON.parse(localStorage.getItem("items"));
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.id === String(field1)) { //&& (item.sala===field2)) {
                items.splice(i, 1);
            }
        }
        localStorage.setItem("items", JSON.stringify(items));
    }
}

//   A Ñ A D E   A L   L S   O B J E T O   id:sala
function addItem(idItem1,idItem2) {
    item = {"id": idItem1,"sala": idItem2};
    items = localStorage.getItem("items");
    if (items == null) {
        items = [];
    }
    else {
        items = JSON.parse(items);
    }
    const ids = items.filter(obj =>
        (item.id===obj.id) && (item.sala===obj.sala)
    );
    if (ids.length===2) {
        alert("LocalStorage tendría dos items iguales.")
        return;
    }
    else {
        items.push(item);
        localStorage.setItem("items", JSON.stringify(items));
    }
}

//   B O R R A R   L O C A L S T O R A G E
if(localStorage.getItem("items") !== null) {
    document.getElementById("btnClearStorage").addEventListener('click', function(event) {
        event.preventDefault();

        // SI borramos localstorage devolvemos los usuarios a su lugar inicial
        //devolverItems();

        // ahora se vacía el localstorage
        localStorage.clear();

        // ocultamos la tabla porque ya no hay asignaciones
        document.getElementById("items").hidden=true;
        document.getElementById("tablaItems").innerHTML="";
        document.getElementById("estado").innerHTML="";
    });
}
// muestro en la sala el idPlayer recibido que se encuentra asociado en el LS
function mostrarItemDeLS(idPlayer,jugadoresPorSala) {

    if (localStorage.getItem("items") !== null) {
        var items = JSON.parse(localStorage.getItem("items"));

        let item=items.find(item=>Number(item.id)===Number(idPlayer));

        if (item!=null) {
            console.log("En página de userId "+idPlayer+" mostrarItemDeLS (userId: " + idPlayer+", "+item.sala+")");
            // cada item del LS colocarlo en la sala asignada, no en cualquier lugar
            if (Number(document.getElementById(item.id).id) === Number(idPlayer)) {

                // U S U A R I O   N O   C O N E C T A D O,   Y A   E N   S A L A   P A R A   J U G A R
                const idSala=item.sala.substr(5,1);
                join(item.id, idSala)

                // S I M U L A C I O N   D R A G  &  D R O P   A   L A   S A L A
                let node = document.getElementById(item.id);
                // necesito colocar esto: <img id="1" src="./images/avatar1.jpg" ...>
                // a la sala j le ponemos el avatar del usuario i
                //if (document.getElementById(item.sala).childElementCount < 2)
                if (jugadoresPorSala[idSala] < 2)
                    document.getElementById(item.sala).appendChild(node);
                /*
                * <div class="col" >
                        <p style="margin-bottom: 0.2rem"><%= sala.name %></p>
                        <div class="sala" id="<%= sala.name %>"
                             ondragenter="return dragEnter(event)"
                             ondrop="return dragDrop(event)"
                             ondragover="return dragOver(event)">
                        </div>
                        *
                        * AQUÍ ENTRA EL AVATAR
                        *
                        <div class="divBoard" id = "divBoard<%= sala.id %>"></div>
                    </div>
                * */
            }
        }
        else {

            alert ("el item "+idPlayer+ " no existe en el LS");
            return;
        }




    } else {
        alert("No hay items en el LS");
    }
}

// mostrar items en cada sala CONTROLAR SI CABEN...
function mostrarItems() {

    if (localStorage.getItem("items") !== null) {
        var items = JSON.parse(localStorage.getItem("items"));

        //actualizaAsignaciones();

        items.forEach(function(item) {

            // cada item del LS colocarlo en la sala asignada, no en cualquier lugar
            if (document.getElementById(item.id) != null) {
                document.getElementById("userConnected").hidden=true;
                document.getElementById("usuarios").hidden=true;
                //if (idSala === null) idSala = 1;
                const payLoad = {
                    "method": "join",
                    "clientId": item.id,
                    "idSala": item.sala.substr(5,1)
                }
                ws.send(JSON.stringify(payLoad));
                let node = document.getElementById(item.id);
                // necesito colocar esto: <img id="1" src="./images/avatar1.jpg" ...>
                // a la sala j le ponemos el avatar del usuario i
                document.getElementById(item.sala).appendChild(node);
                /*
                * <div class="col" >
                        <p style="margin-bottom: 0.2rem"><%= sala.name %></p>
                        <div class="sala" id="<%= sala.name %>"
                             ondragenter="return dragEnter(event)" ondrop="return dragDrop(event)" ondragover="return dragOver(event)">
                        </div>
                        *
                        * AQUÍ ENTRA EL AVATAR
                        *
                        <div class="divBoard" id = "divBoard<%= sala.id %>"></div>
                    </div>
                * */
            } else {
                let img =document.createElement('img');

                let user=users.find ( u => u.id === Number(item.id));

                img.id=item.id;
                img.src=user.imagen;
                img.tagName=user.username;
                img.alt="avatar"+item.id;
                img.draggable=true;
                img.style.width="80px";

                // colocando <img id="4" src="./images/avatar4.jpg" name="avatar" alt="avatar" draggable="true" width="80px">
                document.getElementById(item.sala).appendChild(img);
            }

        });
    } else {
        //document.getElementById("estado").innerHTML="No hay items asignados a salas";
        //document.getElementById("items").hidden=true;
        alert("No hay items en LS");
    }
}

// devolver items a su lugar original
function devolverItems() {
    var items = JSON.parse(localStorage.getItem("items"));
    items.forEach(function(item) {

        let div = document.createElement("div");
        div.className = "col";
        div.appendChild(document.getElementById(item.id));

        // importante: devolvemos el usuario i a su contenedor inicial que es el div cuyo id es usuarios-row
        document.getElementById("usuarios-row").appendChild(div);
    });
}

//   C O M P R O B A R   L O C A L S T O R A G E
function hayLocalStorage() {
    try {
        if ("localStorage" in window && window["localStorage"] !== null) {
            return true;
        }
    } catch (e) {
        alert("LocalStorage no disponible. No se presentan items.");
        return false;
    }
}
