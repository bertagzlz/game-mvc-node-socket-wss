class MiArray {
  a = [];
  constructor(a) {
    this.a = a;
  }
  contiene(id) {
    var found = (this.a.find((u) => u === id) != null);
    return found;
  }
  quitarElemento(id) {
    if (this.contiene(id)) {
      const index = this.a.indexOf(id);
      if (index > -1) { // only splice array when item is found
        this.a.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  }

  getArray() {
    return this.a;
  }
  copyArray(a) {
  var o = testArray.map(function(i) {
    return i;
  });
  this.a=o;
  }
  setArray(a) {
    this.a = a.slice();
  }
}
module.exports = MiArray;
