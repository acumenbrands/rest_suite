require('./spec_helper.js');

describe('Delete', function() {
  var deleter;
  var recordType = 'inventoryitem';
  var idList     = ['123', '456', '789'];
  global.nlapiDeleteRecord = function() {};

  beforeEach(function() {
    deleter = new Deleter(recordType, idList);
    spyOn(global, 'nlapiDeleteRecord').andReturn(null);
  });

  describe('#init', function() {
    it("should set the record type", function() {
      expect(deleter.recordType).toEqual(recordType);
    });
  });

  describe('#deleteRecords', function() {

  });

  describe('#reply', function() {
  });
});
