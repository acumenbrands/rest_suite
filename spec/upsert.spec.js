require('./spec_helper.js');

describe('Upserter', function() {
  var upserter;
  var recordType = 'inventoryitem';
  var recordData = [
    {
    'record_data': {
      'itemid':      'SCHWA-FOO',
      'displayname': 'SCHWA-FOO',
      'custitem22':  '17'
    },
    'do_sourcing':      true,
    'ignore_mandatory': true
  },
  {
    'record_data': {
      'id':         '12345',
      'custitem22': '75'
    },
    'do_sourcing':      false,
    'ignore_mandatory': false
  }
  ];

  beforeEach(function () {
    upserter = new Upserter(recordType, recordData);
  });

  describe('#init(recordType, recordData)', function() {

    it("should set the record type", function() {
      expect(upserter.recordType).toEqual(recordType);
    });

    it("should set the record data", function() {
      expect(upserter.recordData).toEqual(recordData);
    });

    it("should set the record list with a blank array", function() {
    });

  });

  describe('#upsertRecords', function() {

    beforeEach(function () {
      spyOn(upserter, 'populateRecordList');
      spyOn(upserter, 'submitRecordList');
      upserter.upsertRecords();
    });

    it("should call populateRecordList", function() {
      expect(upserter.populateRecordList).toHaveBeenCalled();
    });

    it("should call submitRecordList", function() {
      expect(upserter.submitRecordList).toHaveBeenCalled();
    });

    it("should call performUpsert for each member of recordData", function() {
    });

  });

  describe('#populateRecordList', function() {
  });

  describe('#loadOrInitializeRecord', function() {
  });

  describe('#loadRecord(recordId)', function() {

    beforeEach(function() {
      global.nlapiLoadRecord = function() {};
      spyOn(global, 'nlapiLoadRecord').andReturn({});
    });

    it("should call nlapiLoadrecord with the given record type and id", function() {
      upserter.loadRecord(1);
      expect(global.nlapiLoadRecord).toHaveBeenCalledWith(upserter.recordType, 1);
    });
  });

  describe('#initializeRecord', function() {
    it("should call nlapiInitializeRecord with the recordType", function() {
    });
  });

  describe('#populateRecordFields', function() {
  });

  describe('#updateSublists', function() {
    it("should call populateSublist for each sublist", function() {
    });
  });

  describe('#populateSublist', function() {
    it("should call buildSublistItem for each sublist item", function() {
    });
  });

  describe('#buildSublistItem(recordList)', function() {
    it("should call setLineItemValue for each line item field", function() {
    });
  });

  describe('#submitRecordList', function() {
  });

  describe('#upsertRecord', function() {

    beforeEach(function() {
      global.nlapiSubmitRecord = function() {};
      spyOn(global, 'nlapiSubmitRecord').andReturn({});
    });

    it("should call the napiSubmitRecord method", function() {
    });
  });

  describe('#addFormattedReply', function() {
    it("should have an equal element count between recordData and replyList", function() {
    });

    it("should call formatReply on CommonObject", function() {
    });
  });

  describe('#reply', function() {
    it("should return replyList", function() {
    });
  });
});
