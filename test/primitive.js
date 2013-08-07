var Anore = require("../"),
    assert = require("chai").assert;

describe("Primitive", function() {
  describe("#type()", function() {
    it("should return `boolean' if the content is a boolean", function() {
      var p = new Anore.Primitive(true);

      assert.equal(p.type(), "boolean");
    });

    it("should return `null' if the content is null", function() {
      var p = new Anore.Primitive(null);

      assert.equal(p.type(), "null");
    });

    it("should return `integer' if the content is an integer", function() {
      var p = new Anore.Primitive(5);

      assert.equal(p.type(), "integer");
    });

    it("should return `number' if the content is a floating-point number", function() {
      var p = new Anore.Primitive(1.5);

      assert.equal(p.type(), "number");
    });

    it("should return `string' if the content is a string", function() {
      var p = new Anore.Primitive("testing");

      assert.equal(p.type(), "string");
    });
  });

  describe("#get()", function() {
    it("should return the content verbatim", function() {
      var p = new Anore.Primitive("a");

      assert.equal(p.get(), "a");
    });
  });

  describe("#set(value)", function() {
    it("should set true properly", function() {
      var p = new Anore.Primitive();

      p.set(true);

      assert.strictEqual(p.get(), true);
    });

    it("should set false properly", function() {
      var p = new Anore.Primitive();

      p.set(false);

      assert.strictEqual(p.get(), false);
    });

    it("should set null properly", function() {
      var p = new Anore.Primitive();

      p.set(null);

      assert.strictEqual(p.get(), null);
    });

    it("should set a number properly", function() {
      var p = new Anore.Primitive();

      p.set(5);

      assert.strictEqual(p.get(), 5);
    });

    it("should set a string properly", function() {
      var p = new Anore.Primitive();

      p.set("a");

      assert.strictEqual(p.get(), "a");
    });

    it("should emit a `change' event when the value changes", function(done) {
      var p = new Anore.Primitive();

      p.on("change", function() {
        return done();
      });

      p.set("a");
    });

    it("should not emit a `change' event when the value does not change", function(done) {
      var p = new Anore.Primitive("a");

      p.on("change", function() {
        return done(Error("a `change' event should not be emitted"));
      });

      p.set("a");

      setTimeout(done, 5);
    });

    it("should not emit a `change' event when it has been told to be quiet", function(done) {
      var p = new Anore.Primitive();

      p.on("change", function() {
        return done(Error("a `change' event should not be emitted"));
      });

      p.set("a", {quiet: true});

      setTimeout(done, 5);
    });

    it("should not emit a `change' event when it has been told to be silent", function(done) {
      var p = new Anore.Primitive();

      p.on("change", function() {
        return done(Error("a `change' event should not be emitted"));
      });

      p.set("a", {silent: true});

      setTimeout(done, 5);
    });
  });

  describe("#match(value)", function() {
    it("should match true", function() {
      var p = new Anore.Primitive(true);

      assert.ok(p.match(true))
    });

    it("should match false", function() {
      var p = new Anore.Primitive(false);

      assert.ok(p.match(false))
    });

    it("should match null", function() {
      var p = new Anore.Primitive(null);

      assert.ok(p.match(null))
    });

    it("should match a number", function() {
      var p = new Anore.Primitive(1);

      assert.ok(p.match(1))
    });

    it("should match a string", function() {
      var p = new Anore.Primitive("a");

      assert.ok(p.match("a"))
    });
  });
});
