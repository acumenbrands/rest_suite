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
    upserter        = new Upserter(recordType, recordData);
    recordWithoutId = recordData[0];
    recordWithId    = recordData[1];
  });

  describe('#init(recordType, recordData)', function() {

    describe('Constants', function() {

      it("should define RECORD_DATA_KEY", function() {
        expect(upserter.RECORD_DATA_KEY).toBeDefined();
      });

      it("should define DO_SOURCING_KEY", function() {
        expect(upserter.DO_SOURCING_KEY).toBeDefined();
      });

      it("should define IGNORE_MANDATORY_KEY", function() {
        expect(upserter.IGNORE_MANDATORY_KEY).toBeDefined();
      });

    });

    it("should set the record type", function() {
      expect(upserter.recordType).toEqual(recordType);
    });

    it("should set the record data", function() {
      expect(upserter.recordData).toEqual(recordData);
    });

    it("should set the record list with a blank array", function() {
      expect(upserter.recordList).toEqual([]);
    });

    it("should set the reply list with a blank array", function() {
      expect(upserter.replyList).toEqual([]);
    });

    it("should set the common object", function() {
      expect(upserter.common).toBeDefined();
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

  });

  describe('#populateRecordList', function() {

    beforeEach(function() {
      spyOn(upserter, 'loadOrInitializeRecord').andReturn({});
      spyOn(upserter, 'populateRecordFields');
      spyOn(upserter, 'pushRecordToRecordList');
      upserter.populateRecordList();
    });

    it("should call loadOrInitializeRecord for each element of recordData", function() {
      expect(upserter.loadOrInitializeRecord.callCount).toEqual(recordData.length);
    });

    it("should call populateRecordFields for each element of recordData", function() {
      expect(upserter.populateRecordFields.callCount).toEqual(recordData.length);
    });

    it("should call pushRecordToRecordList for each element of recordData", function() {
      expect(upserter.pushRecordToRecordList.callCount).toEqual(recordData.length);
    });

  });

  describe('#loadOrInitializeRecord', function() {

    it("should call loadRecord if an id is supplied", function() {
      spyOn(upserter, 'loadRecord').andReturn({});
      upserter.loadOrInitializeRecord(recordWithId);
      expect(upserter.loadRecord).toHaveBeenCalled();
    });

    it("should call initializeRecord if an id is suppplied", function() {
      spyOn(upserter, 'initializeRecord').andReturn({});
      upserter.loadOrInitializeRecord(recordWithoutId);
      expect(upserter.initializeRecord).toHaveBeenCalled();
    });

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

    beforeEach(function() {
      global.nlapiInitializeRecord = function() {};
      spyOn(global, 'nlapiInitializeRecord').andReturn({});
    });

    it("should call nlapiInitializeRecord with the recordType", function() {
      upserter.initializeRecord();
      expect(global.nlapiInitializeRecord).toHaveBeenCalledWith(upserter.recordType);
    });
  });

  describe('#populateRecordFields(recordFieldData)', function() {
  });

  describe('#updateSublists(sublistsData)', function() {
    it("should call populateSublist for each sublist", function() {
    });
  });

  describe('#populateSublist(sublistData)', function() {
    it("should call buildSublistItem for each sublist item", function() {
    });
  });

  describe('#buildSublistItem(sublistItemData)', function() {
    it("should call setLineItemValue for each line item field", function() {
    });
  });

  describe('#pushRecordToRecordList(recordData, record)', function() {

    beforeEach(function() {
      this.recordData     = {};
      this.record         = {};
      upserter.recordList = [];
      spyOn(global, 'UpsertRecordListElement').andCallThrough();
      upserter.pushRecordToRecordList(this.recordData, this.record);
    });

    it("should add a new element to recordList", function() {
      expect(upserter.recordList.length).toEqual(1);
    });

    it("should call new UpsertRecordListElement", function() {
      expect(global.UpsertRecordListElement).toHaveBeenCalledWith(this.recordData, this.record);
    });

    describe('new element', function() {

      it("should be a new UpsertRecordListElement", function() {
        element = new UpsertRecordListElement(this.recordData, this.record);
        expect(element).toEqual(upserter.recordList[0]);
      });

    });

  });

  describe('#submitRecordList', function() {

    beforeEach(function() {
      spyOn(upserter, 'addResultToRecord');
      spyOn(upserter.common, 'formatException');
      upserter.recordList = [{}, {}, {}];
    });

    describe('no exception is raised', function() {

      beforeEach(function() {
        spyOn(upserter, 'submitRecord');
        upserter.submitRecordList();
      });

      it("should call submitRecord for each element of recordList", function() {
        expect(upserter.submitRecord.callCount).toEqual(upserter.recordList.length);
      });


      it("should call addResultToRecord for each element of recordList", function() {
        expect(upserter.addResultToRecord.callCount).toEqual(upserter.recordList.length);
      });

    });

    describe('an exception is raised', function() {

      beforeEach(function() {
        spyOn(upserter, 'submitRecord').andCallFake(function() {
          throw "ZOMG AN ERROR HAPPENED";
        });
        upserter.submitRecordList();
      });

      it ("should call formatException on CommonObject", function() {
        expect(upserter.common.formatException).toHaveBeenCalled();
      });

    });

  });

  describe('#submitRecord(record)', function() {

    beforeEach(function() {
      global.nlapiSubmitRecord = function() {};
      spyOn(global, 'nlapiSubmitRecord').andReturn({});
      upserter.submitRecord({});
    });

    it("should call the napiSubmitRecord method", function() {
      expect(global.nlapiSubmitRecord).toHaveBeenCalledWith({});
    });

  });

  describe('#addResultToRecord(recordListElement, result)', function() {

    beforeEach(function() {
      this.recordListElement = new UpsertRecordListElement({});
      this.result            = '12345';
      upserter.addResultToRecord(this.recordListElement, this.result);
    });

    it("should add the given result to the given UpsertRecordListElement", function() {
      expect(this.recordListElement.result).toEqual(this.result);
    });

  });

  describe('#buildReplyList', function() {
    
    beforeEach(function() {
      upserter.recordList = [
        new UpsertRecordListElement({}, {}),
        new UpsertRecordListElement({}, {}),
        new UpsertRecordListElement({}, {})
      ];
      spyOn(upserter, 'addFormattedReply');
      upserter.buildReplyList();
    });

    it("should call addFormattedReply for each element of recordList", function() {
      expect(upserter.addFormattedReply.callCount).toEqual(upserter.recordList.length);
    });

  });

  describe('#addFormatedReply', function() {

    beforeEach(function() {
      this.recordData               = recordData[0];
      this.record                   = {};
      this.recordListElement        = new UpsertRecordListElement(this.recordData, this.record);
      this.recordListElement.result = '12345';
      this.formattedReply           = { 'schwa': 'foo' };

      spyOn(upserter.common, 'formatReply').andReturn(this.formattedReply);
      upserter.replyList = [];
      upserter.addFormattedReply(this.recordListElement);
    });

    it("should call formatReply on CommonObject", function() {
      data      = this.recordListElement.recordData;
      result    = this.recordListElement.result;
      exception = this.recordListElement.exception;
      expect(upserter.common.formatReply).toHaveBeenCalledWith(data, result, exception);
    });

    it("should add a new formatted reply to the replyList", function() {
      expect(upserter.replyList).toEqual([this.formattedReply]);
    });

  });

  describe('#reply', function() {

    it("should return replyList", function() {
      expect(upserter.reply()).toEqual(upserter.replyList);
    });

  });

});

describe('UpsertRecordListElement', function() {

  var upsertRecordListElement;
  var recordData = { 'schwa': 'foo' };
  var record     = {};

  beforeEach(function() {
    upsertRecordListElement = new UpsertRecordListElement(recordData, record);
  });

  describe('#init', function() {

    it("should set the recordData", function() {
      expect(upsertRecordListElement.recordData).toEqual(recordData);
    });

    it("should set the record", function() {
      expect(upsertRecordListElement.record).toEqual(record);
    });

    it("should set the result field to null", function() {
      expect(upsertRecordListElement.result).toEqual(null);
    });

    it("should set the exception field to false", function() {
      expect(upsertRecordListElement.exception).toEqual(false);
    });

  });

});
