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
      'sublist_data': {
        'item': {
          'item':     '12345',
          'quantity': '7'
        }
      },
      'do_sourcing':      true,
      'ignore_mandatory': true
    },
    {
      'record_data': {
        'id':         '12345',
        'custitem22': '75'
      },
      'sublist_data': {
        'item': {
          'item':     '12345',
          'quantity': '7'
        }
      },
      'do_sourcing':      false,
      'ignore_mandatory': false
    }
  ];

  beforeEach(function () {
    upserter = new Upserter(recordType, recordData);
    errorMessage = "ZOMG AN ERROR DONE HAPPENED";
  });

  describe('#init(recordType, recordData)', function() {

    describe('Constants', function() {

      it("should define RECORD_DATA_KEY", function() {
        expect(upserter.RECORD_DATA_KEY).toBeDefined();
      });

      it("shuld define SUBLIST_KEY", function() { 
        expect(upserter.SUBLIST_KEY).toBeDefined();
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

    beforeEach(function() {
      this.recordWithId    = recordData[1];
      this.recordWithoutId = recordData[0];
    });

    describe('no exception is thrown', function() {

      beforeEach(function() {
        spyOn(upserter, 'loadRecord').andReturn({});
        spyOn(upserter, 'initializeRecord').andReturn({});
      });

      it("should call loadRecord if an id is supplied", function() {
        data = this.recordWithId['record_data'];
        upserter.loadOrInitializeRecord(this.recordWithId);
        expect(upserter.loadRecord).toHaveBeenCalledWith(data['id']);
      });

      it("should call initializeRecord if an id is suppplied", function() {
        upserter.loadOrInitializeRecord(this.recordWithoutId);
        expect(upserter.initializeRecord).toHaveBeenCalledWith(upserter.recordType);
      });

    });

    describe('an exception is thrown', function() {

      beforeEach(function() {
        spyOn(upserter, 'loadRecord').andCallFake(function() {
          throw errorMessage;
        });
        spyOn(upserter, 'initializeRecord').andCallFake(function() {
          throw errorMessage;
        });
        spyOn(upserter.common, 'formatException');

        this.formatter = upserter.common.formatException;
      });

      it("should call formatException on CommonObject when given an id", function() {
        upserter.loadOrInitializeRecord(this.recordWithId);
        expect(this.formatter).toHaveBeenCalledWith(this.recordWithId, errorMessage);
      });

      it("should call formatException on CommonObject when given no id", function() {
        upserter.loadOrInitializeRecord(this.recordWithoutId);
        expect(this.formatter).toHaveBeenCalledWith(this.recordWithoutId, errorMessage);
      });

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

  describe('#populateRecordFields(record, recordData', function() {

    it("should call updateSublists if sublist data is present", function() {
    });

    it("should not call updateSublists if sublist data is not present", function() {
    });

    it("should call setRecordField for each record field given", function() {
    });

    describe('an error occurs in setting any attribute of the record', function() {

      it("should call formatException on CommonObject", function() {
      });

      it("should set the result field on the element", function() {
      });

      it("should set the exception field on the element", function() {
      });

    });

  });

  describe('#setRecordField(record, fieldName, value)', function() {

    it("should call setFieldValue on the record object", function() {
    });

  });

  describe('#updateSublists(sublistsData)', function() {

    it("should call populateSublist for each sublist given", function() {
    });

  });

  describe('#populateSublist(sublistData)', function() {

    it("should call populateSublistItemFields for each sublist item given", function() {
    });

  });

  describe('#populateSublistItemFields(sublistItemData)', function() {

    it("should call setSublistItemField for each sublist item field given", function() {
    });

  });

  describe('#setSublistItemField(sublistItem, sublistItemFieldName, value)', function() {

    it("should setSublistItemField with the given params", function() {
    });

  });

  describe('#pushRecordToRecordList(recordData, record)', function() {

    beforeEach(function() {
      spyOn(global, 'UpsertRecordListElement').andCallThrough();

      this.elementMaker   = global.UpsertRecordListElement;
      this.recordData     = {};
      this.record         = {};
      upserter.recordList = [];
    });


    describe('it is not an exception', function() {

      beforeEach(function() {
        upserter.pushRecordToRecordList(this.recordData, this.record, false);
        this.element = upserter.recordList[0];
      });

      it("should add a new element to recordList", function() {
        expect(upserter.recordList.length).toEqual(1);
      });

      it("should not add an exception element", function() {
        expect(this.element.isException()).toEqual(false);
      });

      it("should call new UpsertRecordListElement", function() {
        expect(this.elementMaker).toHaveBeenCalledWith(this.recordData, this.record, false);
      });

    });

    describe('it is an exception', function() {

      beforeEach(function() {
        upserter.pushRecordToRecordList(this.recordData, this.record, true);
        this.element = upserter.recordList[0]
      });

      it("should add a new element to recordList", function() {
        expect(upserter.recordList.length).toEqual(1);
      });

      it("should add an exception element", function() {
        expect(this.element.isException()).toEqual(true);
      });

      it("should call new UpsertRecordListElement", function() {
        expect(this.elementMaker).toHaveBeenCalledWith(this.recordData, this.record, true);
      });

    });

  });

  describe('#submitRecordList', function() {

    beforeEach(function() {
      spyOn(upserter, 'addResultToRecord');
      spyOn(upserter.common, 'formatException');
    });

    describe('in all cases', function() {

      beforeEach(function() {
        upserter.recordList = [new UpsertRecordListElement({}, {}, true)]
        spyOn(upserter, 'submitRecord');
        upserter.submitRecordList();
      });

      it("should not call submitRecord if the element is an exception", function() {
        expect(upserter.submitRecord.callCount).toEqual(0);
      });

    });

    describe('no exception is raised', function() {

      beforeEach(function() {
        upserter.recordList = [
          new UpsertRecordListElement({}, {}, false),
          new UpsertRecordListElement({}, {}, false)
        ];
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
        upserter.recordList = [
          new UpsertRecordListElement({}, {}, false),
          new UpsertRecordListElement({}, {}, false)
        ];
        spyOn(upserter, 'submitRecord').andCallFake(function() {
          throw errorMessage;
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

  describe('#init', function() {

    describe('in all cases', function() {

      beforeEach(function() {
        this.element = new UpsertRecordListElement(recordData, record);
      });

      it("should set the recordData", function() {
        expect(this.element.recordData).toEqual(recordData);
      });

      it("should set the record", function() {
        expect(this.element.record).toEqual(record);
      });

      it("should set the result field to null", function() {
        expect(this.element.result).toEqual(null);
      });

    });

    describe('it is an exception', function() {

      beforeEach(function() {
        this.element = new UpsertRecordListElement(recordData, record, true);
      });

      it("should set the exception field", function() {
        expect(this.element.exception).toEqual(true);
      });

      it("should set the result field equal to record", function() {
        expect(this.element.result).toEqual(this.element.record);
      });

    });

    describe('it is not an exception', function() {

      beforeEach(function() {
        this.element = new UpsertRecordListElement(recordData, record);
      });

      it("should set the exception field", function() {
        expect(this.element.exception).toEqual(false);
      });

    });

  });

  describe('#isException', function() {
    
    describe('it is an exception', function() {

      beforeEach(function() {
        this.element = new UpsertRecordListElement(recordData, record, true);
      });

      it("should return true", function() {
        expect(this.element.isException()).toEqual(true);
      });

    });

    describe('it is not an exception', function() {

      beforeEach(function() {
        this.element = new UpsertRecordListElement(recordData, record);
      });

      it("should return false", function() {
        expect(this.element.isException()).toEqual(false);
      });

    });

  });

  describe('#makeException(formattedException)', function() {

    beforeEach(function() {
      this.exception = new Error(errorMessage);
      this.common = new CommonObject();
      this.formattedException = this.common.formatException(this.exception);
      this.element = new UpsertRecordListElement(recordData, record);
      this.element.makeException(this.formattedException);
    });

    it("should set result equal to the formatted exception", function() {
      expect(this.element.result).toEqual(this.formattedException);
    });

    it("should respond with true to isException", function() {
      expect(this.element.isException()).toEqual(true);
    });

  });

});
