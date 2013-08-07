var EE = require("./ee"),
    Primitive = require("./primitive");

var Model = module.exports = function Model(attributes) {
  EE.call(this);

  this._attributes = {};

  if (typeof attributes === "object" && attributes !== null) {
    this.multiSet(attributes);
  }
};
Model.prototype = Object.create(EE.prototype, {constructor: {value: Model}});

Model.prototype.type = function type() {
  return "object";
};

Model.prototype.toJSON = function toJSON() {
  return this._attributes;
};

Model.prototype.toString = function toString() {
  return this.toJSON() + "";
};

Model.prototype.has = function has(path) {
  return !!this.get(path);
};

Model.prototype.get = function get(path) {
  if (path instanceof Primitive) {
    path = path.get();
  }

  if (typeof path === "string") {
    path = path.split(".");
  }

  var top = path.shift();

  if (!this._attributes[top]) {
    return;
  }

  if (!path.length) {
    return this._attributes[top];
  }

  if (!(this._attributes[top] instanceof Model)) {
    return;
  }

  return this._attributes[top].get(path);
};

Model.prototype.set = function set(key, value, options) {
  options = options || {};

  if (key instanceof Primitive) {
    key = key.get();
  }

  if (typeof key !== "string") {
    throw new Error("`key' argument must be a string or a Primitive-wrapped string");
  }

  if (typeof value !== "object" || value === null) {
    return this.set(key, new Primitive(value));
  } else if (typeof value === "object" && Array.isArray(value)) {
    return this.set(key, new Collection(value))
  } else if (!(value instanceof Primitive || value instanceof Model || value instanceof Collection)) {
    return this.set(key, new Model(value));
  }

  var previousValue = this._attributes[key];

  this._attributes[key] = value;

  if (!options.quiet && !options.silent) {
    this.emit("change", key, value, previousValue);
    this.emit("change:" + key, value, previousValue);
  }

  if (previousValue) {
    if (!options.silent) {
      previousValue.emit("replacedBy", value, this, key);
    }
  } else if (!options.silent && !options.quiet) {
    this.emit("add", key, value);
    this.emit("add:" + key, value);
  }

  if (!options.silent) {
    value.emit("replaced", previousValue, this, key);
  }

  return this;
};

Model.prototype.remove = function remove(key, options) {
  if (typeof this._attributes[key] === "undefined") {
    return this;
  }

  var previousValue = this._attributes[key];

  delete this._attributes[key];

  if (!options.silent && !options.quiet) {
    this.emit("delete", key, previousValue);
    this.emit("delete:" + key, previousValue);
  }

  if (!options.silent) {
    previousValue.emit("deletedFrom", this);
  }

  return this;
};

Model.prototype.multiSet = function multiSet(attributes, options) {
  options = options || {};

  var newKeys = Object.keys(attributes);

  if (options.absolute) {
    var oldKeys = this.keys();

    for (var i=0;i<oldKeys.length;++i) {
      if (newKeys.indexOf(oldKeys[i]) === -1) {
        this.remove(oldKeys[i], options.remove);
      }
    }
  }

  for (var k in attributes) {
    this.set(k, attributes[k], options.add);
  }

  if (!options.quiet) {
    this.emit("multiSet", newKeys);
  }

  return this;
};

Model.prototype.keys = function keys() {
  return Object.keys(this._attributes);
};

Model.prototype.each = function each(fn) {
  var keys = this.keys();

  for (var i=0;i<keys.length;++i) {
    fn.call(null, this.get(k), k);
  }

  return this;
};

Model.prototype.move = function move(oldKey, newKey, options) {
  if (oldKey === newKey) {
    return;
  }

  this._attributes[newKey] = this._attributes[oldKey];

  delete this._attributes[oldKey];

  if (!options.silent) {
    this.emit("move", oldKey, newKey);
  }

  return this;
};

Model.prototype.match = function match(query) {
  if (typeof query !== "object" || query === null) {
    return false;
  }

  for (var k in query) {
    if (!this.has(k) || !this.get(k).match(query[k])) {
      return false;
    }
  }

  return true;
};
