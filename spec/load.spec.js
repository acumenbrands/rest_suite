require('./spec_helper.js');

describe("Loader", function() {

  var loader;
  var recordType = 'inventoryitem';
  var idList     = ['12345', '12345', '67890'];
  var fakeRecord = {};

  beforeEach(function() {
    loader = new Loader(recordType, idList);
    global.nlapiLoadRecord = function() {};
    spyOn(global, 'nlapiLoadRecord').andReturn(fakeRecord);
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

    beforeEach(function() {
      loader.idList = [ '12345' ];
      spyOn(loader, 'processResult');
    });

    describe('normal operation', function() {

      beforeEach(function() {
        spyOn(loader, 'getRecordFromNetsuite').andReturn(fakeRecord);
        loader.loadRecords();
      });

      it("should call getRecordFromNetsuite", function() {
        expect(loader.getRecordFromNetsuite).toHaveBeenCalledWith(loader.idList[0]);
      });

      it("should call processResult", function() {
        expect(loader.processResult).toHaveBeenCalledWith(fakeRecord);
      });

    });

    describe("an exception occurs", function() {

      beforeEach(function() {
        this.errorMessage = "ZOMG ERROR";
        spyOn(loader, 'getRecordFromNetsuite').andCallFake(function() {
          throw this.errorMessage;
        });
        loader.loadRecords();
      });

      it("should call formatException on CommonObject", function() {
        expect(loader.processResult).toHaveBeenCalledWith(null, this.exception);
      });

    });
  });

  describe("#getRecordFromNetsuite", function() {

    beforeEach(function() {
      this.recordId = '7';
      loader.getRecordFromNetsuite(this.recordId);
    });

    it("shuld call nlapiLoadRecord", function() {
      expect(global.nlapiLoadRecord).toHaveBeenCalledWith(loader.recordType, this.recordId);
    });

  });

  describe("#processResult", function() {

    beforeEach(function() {
      this.result    = {};
      this.exception = new Error("ZOMG");
      spyOn(loader.resultList, 'push');
      spyOn(loader, 'addFormattedReply');
      loader.processResult(this.result, this.exception);
    });

    it("should call push on resultList", function() {
      expect(loader.resultList.push).toHaveBeenCalledWith(this.result);
    });

    it("should call addFormattedReply", function() {
      expect(loader.addFormattedReply).toHaveBeenCalledWith(this.result, this.exception);
    });
  });

  describe("#getParams(id)", function() {

    beforeEach(function() {
      this.id     = '7';
      this.params = loader.getParams(this.id);
    });

    it("should populate the recordType field", function() {
      expect(this.params['recordType']).toEqual(recordType);
    });

    it("should populate the id field", function() {
      expect(this.params['id']).toEqual(this.id);
    });

  });

  describe("#addFormattedReply", function() {
    beforeEach(function() {
      this.result         = {};
      this.formattedReply = loader.common.formatReply(this.params, this.result);
      this.params         = loader.getParams(this.id);
      spyOn(loader, 'getParams').andReturn(this.params);
      spyOn(loader.common, 'formatReply').andReturn(this.formattedReply);
      spyOn(loader.replyList, 'push');
      loader.addFormattedReply(this.result);
    });

    it("should call formatReply() on CommonObject", function() {
      expect(loader.common.formatReply).toHaveBeenCalledWith(loader.getParams(), this.result,
                                                             undefined);
    });

    it("should call push on the replyList", function() {
      expect(loader.replyList.push).toHaveBeenCalledWith(this.formattedReply);
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
