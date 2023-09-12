const express = require("express");

const { registerView, loginView, registerUser, loginUser,logoutUser, } = require("./loginController");
const { juegoView } = require("./juegoController");
const { protectRoute } = require("../auth/protect");

const router = express.Router();

// 1. localhost:4111/register va a la vista register.ejs a través del controller
router.get("/register", registerView);
router.post("/register", registerUser);

// 2. localhost:4111/login va a la vista login.ejs a través del controller
router.get("/", loginView);
router.get("/login", loginView);
router.post("/login", loginUser);

// 3. localhost:4111/juego
router.get("/juego", protectRoute, juegoView);

// 4. localhost:4111/logout
router.get("/logout",logoutUser);

/*router.get('/logout', function (req, res) {
  delete req.session.authStatus;*/
  //res.render("logout", {});
  /*res.send([
    'You are now logged out.',
    '&lt;br/>',
    '<a href="/login">Return to the login page. You will have to log in again.</a>',
  ].join(''));*/
//});








module.exports = router;
