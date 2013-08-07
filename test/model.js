var Anore = require("../"),
    assert = require("chai").assert;

describe("Model", function() {
  describe("#type()", function() {
    it("should return `object'", function() {
      var model = new Anore.Model();

      assert.equal(model.type(), "object");
    });
  });

  describe("#has(path)", function() {
    it("should return true if an attribute is directly accessible", function() {
      var model = new Anore.Model({x: "y"});

      assert.isTrue(model.has("x"));
    });

    it("should return true if an attribute is indirectly accessible", function() {
      var model = new Anore.Model({x: {y: "z"}});

      assert.isTrue(model.has("x.y"));
    });

    it("should return true if the path is supplied as an array", function() {
      var model = new Anore.Model({x: {y: "z"}});

      assert.isTrue(model.has(["x", "y"]));
    });

    it("should return false if an attribute is not directly accessible", function() {
      var model = new Anore.Model({x: "y"});

      assert.isFalse(model.has("z"));
    });

    it("should return false if an attribute is not indirectly accessible", function() {
      var model = new Anore.Model({x: {y: "z"}});

      assert.isFalse(model.has("x.z"));
    });
  });

  describe("#get(path)", function() {
    it("should return the correct attribute if it is directly accessible", function() {
      var property = new Anore.Primitive("y");

      var model = new Anore.Model({x: property});

      assert.strictEqual(model.get("x"), property);
    });

    it("should return the correct attribute if it is indirectly accessible", function() {
      var property = new Anore.Primitive("y");

      var model = new Anore.Model({x: {y: property}});

      assert.strictEqual(model.get("x.y"), property);
    });

    it("should return the correct attribute if the path is supplied as an array", function() {
      var property = new Anore.Primitive("y");

      var model = new Anore.Model({x: {y: property}});

      assert.strictEqual(model.get(["x", "y"]), property);
    });

    it("should return undefined if an attribute is not directly accessible", function() {
      var model = new Anore.Model({x: "y"});

      assert.isUndefined(model.get("z"));
    });

    it("should return undefined if an attribute is not indirectly accessible", function() {
      var model = new Anore.Model({x: {y: "z"}});

      assert.isUndefined(model.get("x.z"));
    });
  });

  describe("#set(key, value, options)", function() {
    it("should set the correct property", function() {
      var property = new Anore.Primitive("x");

      var model = new Anore.Model();

      model.set("x", property);

      assert.strictEqual(model.get("x"), property);
    });

    it("should box `false'", function() {
      var model = new Anore.Model();

      model.set("x", false);

      assert.instanceOf(model.get("x"), Anore.Primitive);
      assert.equal(model.get("x").type(), "boolean");
    });

    it("should box `true'", function() {
      var model = new Anore.Model();

      model.set("x", true);

      assert.instanceOf(model.get("x"), Anore.Primitive);
      assert.equal(model.get("x").type(), "boolean");
    });

    it("should box `null'", function() {
      var model = new Anore.Model();

      model.set("x", null);

      assert.instanceOf(model.get("x"), Anore.Primitive);
      assert.equal(model.get("x").type(), "null");
    });

    it("should box an integer", function() {
      var model = new Anore.Model();

      model.set("x", 1);

      assert.instanceOf(model.get("x"), Anore.Primitive);
      assert.equal(model.get("x").type(), "integer");
    });

    it("should box a floating-point number", function() {
      var model = new Anore.Model();

      model.set("x", 1.5);

      assert.instanceOf(model.get("x"), Anore.Primitive);
      assert.equal(model.get("x").type(), "number");
    });

    it("should box a string", function() {
      var model = new Anore.Model();

      model.set("x", "x");

      assert.instanceOf(model.get("x"), Anore.Primitive);
      assert.equal(model.get("x").type(), "string");
    });

    it("should emit an `add' event if the property does not already exist", function(done) {
      var property = new Anore.Primitive("x");

      var model = new Anore.Model();

      model.on("add", function(name, value) {
        assert.equal(name, "x");
        assert.strictEqual(value, property);

        return done();
      });

      model.set("x", property);
    });

    it("should not emit an `add' event if the property does already exist", function(done) {
      var property = new Anore.Primitive("x");

      var timeoutHandle = setTimeout(done, 5);

      var model = new Anore.Model({x: null});

      model.on("add", function(name, value) {
        clearTimeout(timeoutHandle);
        return done(Error("shouldn't emit an event"));
      });

      model.set("x", property);
    });

    it("should emit a `change' event if the property changes", function(done) {
      var property = new Anore.Primitive("x");

      var model = new Anore.Model({x: "y"});

      model.on("change", function(name, value) {
        assert.equal(name, "x");
        assert.strictEqual(value, property);

        return done();
      });

      model.set("x", property);
    });
  });
});
