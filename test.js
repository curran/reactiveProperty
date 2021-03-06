// Unit tests for reactive-property.
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

    it("Should set and get and the value.", function () {
      var a = ReactiveProperty();
      a(10);
      assert.equal(a(), 10);
    });

    it("Should set the value, overriding the default value.", function () {
      var a = ReactiveProperty(5);
      a(10);
      assert.equal(a(), 10);
    });


    it("Should support method chaining.", function (){

      var my = {
        a: ReactiveProperty(5),
        b: ReactiveProperty(10)
      };

      assert.equal(my.a(), 5);
      assert.equal(my.b(), 10);

      my.a(50).b(100);

      assert.equal(my.a(), 50);
      assert.equal(my.b(), 100);

    });
    
    it("Should not expose default if no default value.", function (){
      var a = ReactiveProperty();
      var hasDefault = a.default ? true : false;
      assert(!hasDefault);
      assert.equal(typeof a.default, "undefined");
    });

    it("Should store and expose default value.", function (){
      var a = ReactiveProperty(5);
      var hasDefault = a.default ? true : false;
      assert(hasDefault);
      assert.equal(a.default(), 5); 

      a(500);
      assert.equal(a(), 500); 
      assert.equal(a.default(), 5); 
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

    it("Should react to null.", function () {
      var a = ReactiveProperty(null);
      var numInvocations = 0;
      a.on(function (){ numInvocations++; }); 
      assert.equal(numInvocations, 1);
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

    it("Should stop reacting to changes after 'off'.", function () {
      var a = ReactiveProperty();
      var numInvocations = 0;
      var listener = a.on(function (){ numInvocations++; }); 
      a(10);
      assert.equal(numInvocations, 1);
      a.off(listener);
      a(15);
      assert.equal(numInvocations, 1);
    });

    it("Should stop reacting to changes after 'destroy'.", function () {
      var a = ReactiveProperty();
      var numInvocations = 0;
      var listener = a.on(function (){ numInvocations++; }); 
      a(10);
      assert.equal(numInvocations, 1);
      a.destroy();
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

    it("Should pass the old value to the listener as the second argument.", function (done) {
      var a = ReactiveProperty();
      a.on(function (value, oldValue){
        if(value === 10){
          assert.equal(value, 10);
          assert(typeof oldValue === "undefined");
          a(20);
        } else if(value === 20){
          assert.equal(value, 20);
          assert.equal(oldValue, 10);
          done();
        }
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

    it("Should stop reacting to changes in one listener while another continues reacting.", function () {
      var a = ReactiveProperty();

      var numInvocations1 = 0;
      var listener1 = a.on(function (){ numInvocations1++; }); 

      var numInvocations2 = 0;
      var listener2 = a.on(function (){ numInvocations2++; }); 

      a(10);
      assert.equal(numInvocations1, 1);
      assert.equal(numInvocations2, 1);

      a.off(listener1);
      a(15);
      assert.equal(numInvocations1, 1);
      assert.equal(numInvocations2, 2);

      a.on(listener1);
      assert.equal(numInvocations1, 2);
      assert.equal(numInvocations2, 2);

      a(20);
      assert.equal(numInvocations1, 3);
      assert.equal(numInvocations2, 3);

      a.off(listener2);
      a(25);
      assert.equal(numInvocations1, 4);
      assert.equal(numInvocations2, 3);
    });
    
    it("Should throw an error if constructor invoked with too many arguments.", function (){
      assert.throws(function (){
        ReactiveProperty(1, 2, 3);
      });
    });

    it("Should throw an error if setter invoked with too many arguments.", function (){
      assert.throws(function (){
        ReactiveProperty()(1, 2);
      });
    });
  });
});
