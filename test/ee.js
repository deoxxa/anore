var Anore = require("../"),
    assert = require("chai").assert;

describe("EE", function() {
  describe("#on(name, cb, options)", function() {
    it("should return the instance", function() {
      var ee = new Anore.EE();

      assert.equal(ee, ee.on("a", function() {}));
    });

    it("should register a single listener", function(done) {
      var ee = new Anore.EE();

      ee.on("a", done);

      ee.emit("a");
    });

    it("should register two separate listeners", function(done) {
      var ee = new Anore.EE();

      var count = 0;

      ee.on("a", function() {
        if (++count === 2) {
          return done();
        }
      });

      ee.on("a", function() {
        if (++count === 2) {
          return done();
        }
      });

      ee.emit("a");
    });

    it("should not register the same listener twice", function(done) {
      var ee = new Anore.EE();

      var count = 0;

      var timeoutHandle = setTimeout(done, 5);

      var onEvent = function() {
        if (++count === 2) {
          clearTimeout(timeoutHandle);
          return done(Error("same listener called twice"));
        }
      };

      ee.on("a", onEvent);
      ee.on("a", onEvent);

      ee.emit("a");
    });

    it("should register the same listener twice if told to explicitly", function(done) {
      var ee = new Anore.EE();

      var count = 0;

      var onEvent = function() {
        if (++count === 2) {
          return done();
        }
      };

      ee.on("a", onEvent, {allowDuplicates: true});
      ee.on("a", onEvent, {allowDuplicates: true});

      ee.emit("a");
    });

    it("should emit an `addListener' event", function(done) {
      var ee = new Anore.EE();

      var fn = function() {};

      ee.on("addListener", function(name, listener) {
        if (name === "a" && listener === fn) {
          return done();
        }
      });

      ee.on("a", fn);
    });

    it("should not emit an `addListener' event if told to be quiet", function(done) {
      var ee = new Anore.EE();

      var timeoutHandle = setTimeout(done, 5);

      var fn = function() {};

      ee.on("addListener", function(name, listener) {
        if (name === "a" && listener === fn) {
          clearTimeout(timeoutHandle);
          done(Error("should not emit an event"));
        }
      });

      ee.on("a", fn, {quiet: true});
    });

    it("should not emit an `addListener' event if told to be silent", function(done) {
      var ee = new Anore.EE();

      var timeoutHandle = setTimeout(done, 5);

      var fn = function() {};

      ee.on("addListener", function(name, listener) {
        if (name === "a" && listener === fn) {
          clearTimeout(timeoutHandle);
          done(Error("should not emit an event"));
        }
      });

      ee.on("a", fn, {silent: true});
    });
  });

  describe("#has(name, cb)", function() {
    it("should return false if there are no listeners for an event", function() {
      var ee = new Anore.EE();

      assert.isFalse(ee.has("a", function() {}));
    });

    it("should return false if the given function is not listening to the given event", function() {
      var ee = new Anore.EE();

      ee.on("a", function() {});

      assert.isFalse(ee.has("a", function() {}));
    });

    it("should return true if the given function is the only one listening to the given event", function() {
      var ee = new Anore.EE();

      var f = function() {};
      ee.on("a", f);

      assert.isTrue(ee.has("a", f));
    });

    it("should return true if the given function is not the only one listening to the given event", function() {
      var ee = new Anore.EE();

      var f = function() {};
      ee.on("a", f);
      ee.on("a", function() {});

      assert.isTrue(ee.has("a", f));
    });
  });

  describe("#off(name, cb)", function() {
    it("should unsubscribe a listener if it is the only one listening", function() {
      var ee = new Anore.EE();

      var fn = function() {};

      ee.on("a", fn);

      assert.isTrue(ee.has("a", fn));

      ee.off("a", fn);

      assert.isFalse(ee.has("a", fn));
    });

    it("should unsubscribe a listener if it is not the only one listening", function() {
      var ee = new Anore.EE();

      var fn = function() {};

      ee.on("a", fn);
      ee.on("a", function() {});

      assert.isTrue(ee.has("a", fn));

      ee.off("a", fn);

      assert.isFalse(ee.has("a", fn));
    });

    it("should emit a `removeListener' event", function(done) {
      var ee = new Anore.EE();

      var fn = function() {};

      ee.on("removeListener", function(name, cb) {
        if (name === "a" && cb === fn) {
          return done();
        }
      });

      ee.on("a", fn);
      ee.off("a", fn);
    });

    it("should not emit a `removeListener' event if told to be quiet", function(done) {
      var ee = new Anore.EE();

      var fn = function() {};

      var timeoutHandle = setTimeout(done, 5);

      ee.on("removeListener", function(name, cb) {
        if (name === "a" && cb === fn) {
          clearTimeout(timeoutHandle);
          return done(Error("should not emit an event"));
        }
      });

      ee.on("a", fn);
      ee.off("a", fn, {quiet: true});
    });

    it("should not emit a `removeListener' event if told to be silent", function(done) {
      var ee = new Anore.EE();

      var fn = function() {};

      var timeoutHandle = setTimeout(done, 5);

      ee.on("removeListener", function(name, cb) {
        if (name === "a" && cb === fn) {
          clearTimeout(timeoutHandle);
          return done(Error("should not emit an event"));
        }
      });

      ee.on("a", fn);
      ee.off("a", fn, {silent: true});
    });
  });

  describe("#offAll(name)", function() {
    it("should remove all listeners for an event", function() {
      var ee = new Anore.EE();

      var fn1 = function() {},
          fn2 = function() {};

      ee.on("a", fn1);
      ee.on("a", fn2);

      ee.offAll("a");

      assert.isFalse(ee.has("a", fn1));
      assert.isFalse(ee.has("a", fn2));
    });

    it("shouldn't clobber other events", function() {
      var ee = new Anore.EE();

      var fn1 = function() {},
          fn2 = function() {},
          fn3 = function() {};

      ee.on("a", fn1);
      ee.on("a", fn2);
      ee.on("b", fn3);

      ee.offAll("a");

      assert.isFalse(ee.has("a", fn1));
      assert.isFalse(ee.has("a", fn2));
      assert.isTrue(ee.has("b", fn3));
    });

    it("should emit a `removeAllListeners' event", function(done) {
      var ee = new Anore.EE();

      ee.on("a", function() {});

      ee.on("removeAllListeners", function(name) {
        if (name === "a") {
          return done();
        }
      });

      ee.offAll("a");
    });

    it("should not emit a `removeAllListeners' event if told to be quiet", function(done) {
      var ee = new Anore.EE();

      var timeoutHandle = setTimeout(done, 5);

      ee.on("a", function() {});

      ee.on("removeAllListeners", function(name) {
        if (name === "a") {
          clearTimeout(timeoutHandle);
          return done(Error("shouldn't emit an event"));
        }
      });

      ee.offAll("a", {quiet: true});
    });

    it("should not emit a `removeAllListeners' event if told to be silent", function(done) {
      var ee = new Anore.EE();

      var timeoutHandle = setTimeout(done, 5);

      ee.on("a", function() {});

      ee.on("removeAllListeners", function(name) {
        if (name === "a") {
          clearTimeout(timeoutHandle);
          return done(Error("shouldn't emit an event"));
        }
      });

      ee.offAll("a", {silent: true});
    });
  });

  describe("#emit(name, ...)", function() {
    it("should emit an event to one listener", function(done) {
      var ee = new Anore.EE();

      ee.on("a", function() {
        return done();
      });

      ee.emit("a");
    });

    it("should emit an event to two listeners", function(done) {
      var ee = new Anore.EE();

      var count = 0;

      ee.on("a", function() {
        if (++count === 2) {
          return done();
        }
      });

      ee.on("a", function() {
        if (++count === 2) {
          return done();
        }
      });

      ee.emit("a");
    });

    it("should emit an event with one argument", function(done) {
      var ee = new Anore.EE();

      ee.on("a", function(arg) {
        assert.equal(arg, "x");

        return done();
      });

      ee.emit("a", "x");
    });

    it("should emit an event with two arguments", function(done) {
      var ee = new Anore.EE();

      ee.on("a", function(arg1, arg2) {
        assert.equal(arg1, "x");
        assert.equal(arg2, "y");

        return done();
      });

      ee.emit("a", "x", "y");
    });
  });
});
