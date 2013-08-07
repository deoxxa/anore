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
});
