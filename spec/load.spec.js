require('./spec_helper.js');

describe("Loader", function() {

  var loader;
  var recordType   = 'inventoryitem';
  var idList       = ['12345', '12345', '67890'];

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

    beforeEach(function() {
      this.id       = '7';
      loader.idList = [this.id];
      spyOn(loader, 'formatParams');
      spyOn(loader, 'addFormattedReply');
      loader.loadRecords();
    });

    it("calls nlapiLoadRecord on each id", function() {
      expect(global.nlapiLoadRecord).toHaveBeenCalledWith(loader.recordType, this.id);
    });

    it("should have an equal element count between idList and resultList", function() {
      expect(loader.idList.length).toEqual(loader.resultList.length);
    });

    it("should call formatParams", function() {
      expect(loader.formatParams).toHaveBeenCalledWith(this.id);
    });

    it("should call addFormattedReply", function() {
      expect(loader.addFormattedReply).toHaveBeenCalledWith(this.params, {});
    });

    describe("an exception occurs", function() {

    });
  });

  describe("#formatParams(id)", function() {

    beforeEach(function() {
      this.id     = '7';
      this.params = loader.formatParams(this.id);
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
