var EE = module.exports = function EE() {
  this._events = {};
};

EE.prototype.on = function on(name, cb, options) {
  options = options || {};

  if (!options.allowDuplicates && this.has(name, cb)) {
    return this;
  }

  if (!this._events[name]) {
    this._events[name] = [];
  }

  this._events[name].push(cb);

  if (!options.silent && !options.quiet) {
    this.emit("addListener", name, cb);
  }

  return this;
};

EE.prototype.has = function has(name, cb) {
  if (!this._events[name]) {
    return false;
  }

  return this._events[name].indexOf(cb) !== -1;
};

EE.prototype.off = function off(name, cb, options) {
  options = options || {};

  if (!this._events[name]) {
    return this;
  }

  var pos;
  while ((pos = this._events[name].indexOf(cb)) !== -1) {
    this._events[name].splice(pos, 1);

    if (!options.silent && !options.quiet) {
      this.emit("removeListener", name, cb);
    }
  }

  return this;
};

EE.prototype.offAll = function offAll(name, options) {
  options = options || {};

  if (!this._events[name]) {
    return;
  }

  this._events[name] = null;

  if (!options.silent && !options.quiet) {
    this.emit("removeAllListeners", name);
  }

  return this;
};

EE.prototype.emit = function emit(name) {
  if (!this._events[name] || !this._events[name].length) {
    return this;
  }

  var args = [].slice.call(arguments, 1);

  var events = this._events[name].slice(0);

  for (var i=0;i<events.length;++i) {
    events[i].apply(null, args);
  }

  return this;
};
