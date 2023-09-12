class UserLocal {
  id;
  name;
  email;
  password;
  imagen;

  constructor(name, email, password,imagen) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.imagen = imagen;
  }
}
module.exports = UserLocal;
