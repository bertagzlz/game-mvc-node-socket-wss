// For Juego Page
const juegoView = (req, res) => {
  res.render("juego", {
    // creo que sobra
    user: req.user,
    users: users,
    //usersConnected: usersConnected,
    // creo que sobra
    //salas: salas,
  })
};
module.exports = {
  juegoView,
};
