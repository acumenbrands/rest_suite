require("./spec_helper.js");

describe('Initializer', function() {
  var initializer;
  var recordType  = 'salesorder';
  var blankRecord = { 'recordtype': recordType };
  global.nlapiInitializeRecord = function () {};

  beforeEach(function() {
    initializer = new Initializer(recordType);
    spyOn(global, 'nlapiInitializeRecord').andReturn(blankRecord);
  });

  describe('#init', function() {
    it("should set the record type", function(){
      expect(initializer.recordType).toEqual(recordType);
    });
  });

  describe('#initializeRecord', function() {
    it("should call initialize record from the Netsuite API", function() {
      initializer.initializeRecord();
      expect(global.nlapiInitializeRecord).toHaveBeenCalled();
    });
  });

  describe('#reply', function() {
    it("should return the blank record", function() {
      initializer.initializeRecord();
      expect(initializer.reply()).toEqual(blankRecord);
    });
  });
});
