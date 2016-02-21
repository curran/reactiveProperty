// Unit tests for the ReactiveProperty library.
var assert = require("assert");

// If using from the NPM package, this line would be
// var ReactiveProperty = require("reactive-property");
var ReactiveProperty = require("./index.js");

describe("ReactiveProperty", function() {

  describe("Getter-setters", function() {

    it("Should construct a property.", function () {
      var a = ReactiveProperty();
      assert.equal(typeof(a), "function");
      assert.equal(typeof(a()), "undefined");
    });

    it("Should construct a property with a default value and get the value.", function () {
      var a = ReactiveProperty(5);
      assert.equal(a(), 5);
    });

    it("Should set and the value.", function () {
      var a = ReactiveProperty();
      a(10);
      assert.equal(a(), 10);
    });

    it("Should set and the value, overriding the default value.", function () {
      var a = ReactiveProperty(5);
      a(10);
      assert.equal(a(), 10);
    });

  });


  describe("Reacting to changes", function (){

    it("Should react to changes.", function (done) {
      var a = ReactiveProperty();
      a.on(function (){
        assert.equal(a(), 10);
        done();
      }); 
      a(10);
    });

    it("Should react to the default value.", function (done) {
      var a = ReactiveProperty(5);
      a.on(function (){
        assert.equal(a(), 5);
        done();
      }); 
    });

    it("Should not react to no value.", function () {
      var a = ReactiveProperty();
      var numInvocations = 0;
      a.on(function (){ numInvocations++; }); 
      assert.equal(numInvocations, 0);
    });

    it("Should react synchronously.", function () {
      var a = ReactiveProperty();
      var numInvocations = 0;
      a.on(function (){ numInvocations++; }); 
      assert.equal(numInvocations, 0);
      a(10);
      assert.equal(numInvocations, 1);
      a(15);
      assert.equal(numInvocations, 2);
    });

    it("Should stop reacting to changes.", function () {
      var a = ReactiveProperty();
      var numInvocations = 0;
      var listener = a.on(function (){ numInvocations++; }); 
      a(10);
      assert.equal(numInvocations, 1);
      a.off(listener);
      a(15);
      assert.equal(numInvocations, 1);
    });

    it("Should pass the value to the listener as an argument.", function (done) {
      var a = ReactiveProperty();
      a.on(function (value){
        assert.equal(value, 10);
        done();
      }); 
      a(10);
    });
  });


  describe("Edge cases and error handling", function (){

    it("Should not give errors when removing a listener twice.", function () {
      var a = ReactiveProperty();
      var numInvocations = 0;
      var listener = a.on(function (){ numInvocations++; }); 
      a(10);
      assert.equal(numInvocations, 1);
      a.off(listener);
      a(15);
      assert.equal(numInvocations, 1);
      a.off(listener);
      a(20);
      assert.equal(numInvocations, 1);
    });

    it("Should throw an error if 'on' is invoked with a non-function.", function (){
      assert.throws(function (){
        ReactiveProperty().on("foo");
      });
    });

    it("Should throw an error if 'on' is invoked with multiple arguments.", function (){
      assert.throws(function (){
        ReactiveProperty().on(function (){}, function (){});
      });
    });

    it("Should throw an error if 'on' is invoked with no arguments.", function (){
      assert.throws(function (){
        ReactiveProperty().on();
      });
    });

    it("Should not throw an error if 'off' is invoked but there are no listeners.", function (){
      assert.doesNotThrow(function (){
        ReactiveProperty().off(function (){});
      });
    });
  });
});
