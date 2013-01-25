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
    beforeEach(function() {
      initializer.initializeRecord();
    });

    it("should call initialize record from the Netsuite API", function() {
      expect(global.nlapiInitializeRecord).toHaveBeenCalled();
    });

    it("should update the initializedRecord field with the new record", function() {
      expect(initializer.initializedRecord).toEqual(blankRecord);
    });
  });

  describe('#reply', function() {
    it("should return the blank record in a formatted reply", function() {
      initializer.initializeRecord();
      var formattedReply = initializer.common.formatReply(initializer.recordType,
                                                          initializer.initializedRecord,
                                                          initializer.exception)
      expect(initializer.reply()).toEqual(formattedReply);
    });
  });
});
