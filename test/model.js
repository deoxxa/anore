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
  });
});
