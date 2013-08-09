var EE = require("./ee"),
    Primitive = require("./primitive"),
    Collection = require("./collection");

var Model = module.exports = function Model(attributes, options) {
  EE.call(this);

  options = options || {};

  this._bubbleEvents = (typeof options.bubbleEvents === "undefined") || !!options.bubbleEvents;

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

  // unbox `Primitive` values

  if (key instanceof Primitive) {
    key = key.get();
  }

  // ensure correct key type

  if (typeof key !== "string") {
    throw new Error("`key' argument must be a string or a Primitive-wrapped string");
  }

  // box things that need boxing

  if (typeof value !== "object" || value === null) {
    value = new Primitive(value);
  } else if (typeof value === "object" && Array.isArray(value)) {
    value = new Collection(value);
  } else if (!(value instanceof Primitive || value instanceof Model || value instanceof Collection)) {
    value = new Model(value);
  }

  // record previous value

  var previousValue = this._attributes[key];

  // skip out if there's no change

  if (previousValue === value) {
    return this;
  }

  // handle event bubbling

  if (this._bubbleEvents) {
    var self = this,
        onChange = null;

    if (value instanceof Primitive) {
      onChange = function onChange() {
        self.emit("change", [key], value);
      };
    } else {
      onChange = function onChange(path, value) {
        self.emit("change", [key].concat(path), value);
      };
    }

    var onRemovedFrom = function onRemovedFrom(parent, oldKey) {
      if (parent === self && oldKey === key) {
        value.off("change", onChange);
        value.off("removedFrom", onRemovedFrom);
      }
    };

    value.on("change", onChange);
    value.on("removedFrom", onRemovedFrom);
  }

  // set new value

  this._attributes[key] = value;

  // handle change event emission

  if (!options.silent && !options.quiet) {
    this.emit("change", [key], value, previousValue);
    this.emit("change:" + key, value, previousValue);
  }

  // notify listeners of the old value that it's been removed (and replaced)

  if (previousValue && !options.silent) {
    previousValue.emit("replacedBy", this, key, value);
    previousValue.emit("removedFrom", this, key);
  }

  // emit add events if there was no previous value

  if (!previousValue && !options.silent && !options.quiet) {
    this.emit("add", [key], value);
    this.emit("add:" + key, value);
  }

  // tell listeners of the new value that it's been added to a model

  if (!options.silent) {
    value.emit("addedTo", this, key);
  }

  // tell listeners of the new value that it's replaced another value

  if (previousValue && !options.silent) {
    value.emit("replaced", this, key, previousValue);
  }

  return this;
};

Model.prototype.remove = function remove(key, options) {
  options = options || {};

  if (typeof this._attributes[key] === "undefined") {
    return this;
  }

  var previousValue = this._attributes[key];

  delete this._attributes[key];

  if (!options.silent && !options.quiet) {
    this.emit("remove", key, previousValue);
    this.emit("remove:" + key, previousValue);
  }

  if (!options.silent) {
    previousValue.emit("removedFrom", this, key);
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
