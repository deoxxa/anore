var EE = require("./ee");

var Primitive = module.exports = function Primitive(value) {
  EE.call(this);

  this._value = value;
};
Primitive.prototype = Object.create(EE.prototype, {constructor: {value: Primitive}});

Primitive.prototype.type = function type() {
  if (this._value === null) {
    return "null";
  } else if (typeof this._value === "number") {
    return this._value % 1 === 0 ? "integer" : "number";
  } else {
    return typeof this._value;
  }
};

Primitive.prototype.toJSON = function toJSON() {
  return this.get();
};

Primitive.prototype.toString = function toString() {
  return this.toJSON() + "";
};

Primitive.prototype.get = function get() {
  return this._value;
};

Primitive.prototype.set = function set(value, options) {
  options = options || {};

  if (value === this._value) {
    return this;
  }

  var previousValue = this._value;

  this._value = value;

  if (!options.silent && !options.quiet) {
    this.emit("change", value, previousValue);
  }

  return this;
};

Primitive.prototype.match = function match(query) {
  if (query instanceof Primitive) {
    query = query.get();
  }

  return this.get() === query;
};
