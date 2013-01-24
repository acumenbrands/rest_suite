require('./spec_helper.js');

describe("RecordLoader", function() {

  var recordLoader;
  var recordType   = 'inventoryitem';
  var idList       = ['12345', '12345', '67890'];
  var uniqueList   = ['12345', '67890'];

  beforeEach(function() {
    recordLoader = new RecordLoader(recordType, idList);
  });

  describe("#init", function() {

    it("accepts a record type string", function() {
      expect(recordLoader.recordType).toEqual(recordType);
    });

    it("accepts a list of ids", function() {
      expect(recordLoader.idList).toEqual(jasmine.any(Array));
    });

    it("has an empty list of results", function() {
      expect(recordLoader.resultList).toEqual([]);
    });

    it("should reduce the list to unique values", function() {
      expect(recordLoader.idList).toEqual(uniqueList);
    });

  });

  describe("#loadRecords", function() {


    beforeEach(function() {
      global.nlapiLoadRecord = function() {};
      spyOn(global, 'nlapiLoadRecord').andReturn({});
    });

    it("calls nlapiLoadRecord on each id", function() {
      recordLoader.loadRecords();
      expect(global.nlapiLoadRecord).toHaveBeenCalled();
    });

    it("should have an equal element count between idList and resultList", function() {
      recordLoader.loadRecords();
      expect(recordLoader.idList.length).toEqual(recordLoader.resultList.length);
    });
  });

});
