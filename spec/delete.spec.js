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

    it("should have a params key for each reply element", function() {
      for(index in deleter.replyList) {
        if(!deleter.replyList[index].hasOwnProperty('params') && !this.missing) {
          this.missing = true;
        }
      }

      expect(this.missing).toEqual(false);
    });

    it("should have a result key for each reply element", function() {
      for(index in deleter.replyList) {
        if(!deleter.replyList[index].hasOwnProperty('result') && !this.missing) {
          this.missing = true;
        }
      }
      expect(this.missing).toEqual(false);
    });

    it("should have a success key for each reply element", function() {
      for(index in deleter.replyList) {
        if(!deleter.replyList[index].hasOwnProperty('success') && !this.missing) {
          this.missing = true;
        }
      }
      expect(this.missing).toEqual(false);
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
