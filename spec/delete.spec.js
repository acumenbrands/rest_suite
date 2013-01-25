require('./spec_helper.js');

describe('Deleter', function() {
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
    beforeEach(function() {
      deleter.deleteRecords();
    });

    it("should call the Netsuite deletion function", function() {
      expect(global.nlapiDeleteRecord).toHaveBeenCalled();
    });

    it("should have an equal count between the replyList and idList", function() {
      expect(deleter.replyList.length).toEqual(deleter.idList.length);
    });
  });

  describe('#addFormattedReply', function() {
    beforeEach(function() {
      deleter.deleteRecords();
      this.missing = false;
    });

    it("should have an equal element count between idList and replyList", function() {
      expect(deleter.idList.length).toEqual(deleter.replyList.length);
    });

    it("should call formatReply() on CommonObject", function() {
    });
  });

  describe('#reply', function() {
    beforeEach(function() {
      deleter.deleteRecords();
    });

    it("should return the replyList", function() {
      expect(deleter.reply()).toEqual(deleter.replyList);
    });
  });
});
