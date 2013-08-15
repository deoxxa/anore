var EE = require("./ee"),
    Model = require("./model"),
    Primitive = require("./primitive");

var Collection = module.exports = function Collection(elements, options) {
  EE.call(this);

  if (!Array.isArray(elements)) {
    options = elements;
    elements = null;
  }

  options = options || {};

  this._idField = options.idField || "id";

  this._elements = [];
  this.length = 0;

  if (Array.isArray(elements)) {
    var self = this;

    elements.forEach(function(element) {
      self.add(element, options);
    });
  }
};
Collection.prototype = Object.create(EE.prototype, {constructor: {value: Collection}});

Collection.prototype.type = function type() {
  return "array";
};

Collection.prototype.toJSON = function toJSON() {
  return this._elements;
};

Collection.prototype.toString = function toString() {
  return this.toJSON() + "";
};

Collection.prototype.indexOf = function indexOf(element) {
  var literalIndex = this._elements.indexOf(element);
  if (literalIndex !== -1) {
    return literalIndex;
  }

  var foundElement = this.get(element.get(this._idField));
  if (foundElement) {
    return this._elements.indexOf(foundElement);
  }

  return -1;
};

Collection.prototype.empty = function empty() {
  while (this._elements.length) {
    this.remove(this._elements[0]);
  }

  return this;
};

Collection.prototype.setElements = function setElements(elements) {
  this.empty();

  if (!elements) {
    return this;
  }

  elements.forEach(this.add.bind(this));

  return this;
};

Collection.prototype.makeModel = function makeModel(value) {
  // jeez. working around browserify. ouch.
  var Model = require("./model");

  if (typeof value === "object" && (value instanceof Primitive || value instanceof Model || value instanceof Collection)) {
    return value;
  } else if (typeof value !== "object" || value === null) {
    return new Primitive(value, typeof value);
  } else if (Array.isArray(value)) {
    return new Collection(value);
  } else {
    return new Model(value);
  }
};

Collection.prototype.add = function add(element, options) {
  options = options || {};

  var position = options.at || this._elements.length;

  element = this.makeModel(element);

  if (this.indexOf(element) !== -1) {
    return this;
  }

  this._elements.splice(position, 0, element);

  this.emit("add", element, {at: position});

  this.length++;

  return this;
};

Collection.prototype.remove = function remove(element) {
  var position = this.indexOf(element);

  if (position === -1) {
    return this;
  }

  this._elements.splice(position, 1);

  this.emit("remove", element, {at: position});
  element.emit("removeFrom", this);

  this.length--;

  return this;
};

Collection.prototype.at = function at(index) {
  return this._elements[index];
};

Collection.prototype.each = function each(fn) {
  this._elements.forEach(fn);

  return this;
};

Collection.prototype.filter = function filter(fn) {
  return this._elements.filter(fn);
};

Collection.prototype.map = function map(fn) {
  return this._elements.map(fn);
};

Collection.prototype.where = function where(query) {
  return this.filter(function(element) {
    return element.match(query);
  });
};

Collection.prototype.get = function get(id) {
  var query = {};

  query[this._idField] = id;

  return this.where(query).shift();
};

Collection.prototype.match = function match(query) {
  return this.where(query);
};

Collection.prototype.create = function create(data, options) {
  options = options || {};

  var model = new Model(data);

  this.add(model);

  return model;
};
