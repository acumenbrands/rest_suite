require('./spec_helper.js');

describe("RecordLoader", function() {

  var recordLoader;
  var recordType   = 'inventoryitem';
  var idList       = ['12345', '12345', '67890'];
  var uniqueList   = ['12345', '67890'];

  beforeEach(function() {
    recordLoader = new RecordLoader(recordType, idList);
    global.nlapiLoadRecord = function() {};        
    spyOn(global, 'nlapiLoadRecord').andReturn({});
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

    it("calls nlapiLoadRecord on each id", function() {
      recordLoader.loadRecords();
      expect(global.nlapiLoadRecord).toHaveBeenCalled();
    });

    it("should have an equal element count between idList and resultList", function() {
      recordLoader.loadRecords();
      expect(recordLoader.idList.length).toEqual(recordLoader.resultList.length);
    });
  });

  describe("#addFormattedReply", function() {

    beforeEach(function() {
      recordLoader.loadRecords();
      this.missing = false;
    });

    it("should have an equal element count between idList and replyList", function() {
      expect(recordLoader.idList.length).toEqual(recordLoader.replyList.length);
    });

    it("should have a params key for each reply element", function() {
      for(index in recordLoader.replyList) {
        if(!recordLoader.replyList[index].hasOwnProperty('params') && !this.missing) {
          this.missing = true;
        }
      }
      expect(this.missing).toEqual(false);
    });

    it("should have a result key for each reply element", function() {
      for(index in recordLoader.replyList) {
        if(!recordLoader.replyList[index].hasOwnProperty('result') && !this.missing) {
          this.missing = true;
        }
      }
      expect(this.missing).toEqual(false);
    });

    it("should have a success key for each reply element", function() {
      for(index in recordLoader.replyList) {
        if(!recordLoader.replyList[index].hasOwnProperty('success') && !this.missing) {
          this.missing = true;
        }
      }
      expect(this.missing).toEqual(false);
    });
  });

  describe("#reply", function() {
    beforeEach(function() {
      recordLoader.loadRecords();
    });

    it("should return the replyList", function() {
      expect(recordLoader.reply()).toEqual(recordLoader.replyList);
    });
  });
});
