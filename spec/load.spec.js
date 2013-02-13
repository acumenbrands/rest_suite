require('./spec_helper.js');

describe("Loader", function() {

  var loader;
  var recordType   = 'inventoryitem';
  var idList       = ['12345', '12345', '67890'];
  var uniqueList   = ['12345', '67890'];

  beforeEach(function() {
    loader = new Loader(recordType, idList);
    global.nlapiLoadRecord = function() {};
    spyOn(global, 'nlapiLoadRecord').andReturn({});
  });

  describe("#init", function() {
    it("accepts a record type string", function() {
      expect(loader.recordType).toEqual(recordType);
    });

    it("accepts a list of ids", function() {
      expect(loader.idList).toEqual(jasmine.any(Array));
    });

    it("has an empty list of results", function() {
      expect(loader.resultList).toEqual([]);
    });
  });

  describe("#loadRecords", function() {
    it("calls nlapiLoadRecord on each id", function() {
      loader.loadRecords();
      expect(global.nlapiLoadRecord).toHaveBeenCalled();
    });

    it("should have an equal element count between idList and resultList", function() {
      loader.loadRecords();
      expect(loader.idList.length).toEqual(loader.resultList.length);
    });
  });

  describe("#addFormattedReply", function() {
    beforeEach(function() {
      loader.loadRecords();
      this.missing = false;
    });

    it("should have an equal element count between idList and replyList", function() {
      expect(loader.idList.length).toEqual(loader.replyList.length);
    });

    it("should call formatReply() on CommonObject", function() {
    });
  });

  describe("#reply", function() {
    beforeEach(function() {
      loader.loadRecords();
    });

    it("should return the replyList", function() {
      expect(loader.reply()).toEqual(loader.replyList);
    });
  });
});
