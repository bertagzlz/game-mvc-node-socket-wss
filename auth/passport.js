const bcrypt = require("bcryptjs");
LocalStrategy = require("passport-local").Strategy;

//Load model
//const User = require("../models/User");

// DATOS LOCALES
const users = require("../data/data").users;
const salas = require("../data/data").salas;

const loginCheck = passport => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {

      //Check customer USING mongodb
      /*User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            console.log("wrong email");
            return done();
          }
          //Match Password
          bcrypt.compare(password, user.password, (error, isMatch) => {
            if (error) throw error;
            if (isMatch) {
              return done(null, user);
            } else {
              console.log("Wrong password");
              return done();
            }
          });
        })
        .catch((error) => console.log(error));*/

      //Check local customer
      var foundUser=users.find((user)=>user.email===email);
      if (!foundUser) {
        console.log("Wrong email");
        return done();
      }
      //Match local Password
      bcrypt.compare(password, foundUser.password, (error, isMatch) => {
        if (error) return (error); //throw error;
        if (isMatch) {
          console.log("Correct password");
          return done(null, foundUser); // va a passport.serialize
        } else {
          console.log("Wrong password");
          return done(null,false);
        }
      });
    })
  );
    /*
    used to persist a user's data into the session after successful authentication,
    while a deserializeUser is used to retrieve a user's data from the session.
        passport.serializeUser() is setting id as cookie in user’s browser and
        passport.deserializeUser() is getting id from the cookie, which is then used
        in callback to get user info or something else,
        based on that id or some other piece of information from the cookie
    * */
  passport.serializeUser((user, done) => {
      done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    var user=users.find((user)=>user.id==id);
    if (user) {
        done(null, user);
    } else  {
        return done();
    }
    /*User.findById(id, (error, user) => {
      done(error, user);
    });*/
  });
};

module.exports = {
  loginCheck,
};
