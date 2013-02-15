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
        'item': [
          {
            'match_field': 'item',
            'delete':      'false',
            'item_data': {
              'item':     '12345',
              'quantity': '7'
            }
          },
          {
            'match_field': 'item',
            'delete':      'true',
            'item_data': {
              'item': '67890'
            }
          },
          {
            'item_data': {
              'item':     '34567',
              'quantity': '15'
            }
          }
        ]
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
    upserter             = new Upserter(recordType, recordData);
    errorMessage         = "ZOMG AN ERROR DONE HAPPENED";
    recordWithSublist    = recordData[0];
    recordwithoutSublist = recordData[1];
    netsuiteRecord       = jasmine.createSpyObj(
      'netsuiteRecord', [
        'setFieldValue',    // (sublistFieldName, value)
        'getLineItemCount', // (sublistFieldName)
        'getLineItemValue', // (sublistFieldName, lineItemFieldName, index)
        'insertLineItem',   // (sublistFieldName, index)
        'setLineItemValue', // (sublistFieldName, lineItemFieldName, index, value)
        'removeLineItem',   // (sublistFieldName, index)
      ]
    );
  });

  describe('#init(recordType, recordData)', function() {

    describe('Constants', function() {

      it("should define RECORD_DATA_KEY", function() {
        expect(upserter.RECORD_DATA_KEY).toBeDefined();
      });

      it("shuld define SUBLIST_KEY", function() { 
        expect(upserter.SUBLIST_KEY).toBeDefined();
      });

      it("should define SUBLIST_MATCH_KEY", function() {
        expect(upserter.SUBLIST_MATCH_KEY).toBeDefined();
      });

      it("should define SUBLIST_DELETE_KEY", function() {
        expect(upserter.SUBLIST_DELETE_KEY).toBeDefined();
      });

      it("should define SUBLIST_DATA_KEY", function() {
        expect(upserter.SUBLIST_DATA_KEY).toBeDefined();
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

  describe('#populateRecordFields(record, recordData)', function() {

    describe('no error occurs in setting field', function() {

      beforeEach(function() {
        spyOn(upserter, 'setRecordField');
        spyOn(upserter, 'updateSublists');
        upserter.populateRecordFields({}, recordData[0]);
      });

      it("should call updateSublists if sublist data is present", function() {
        expect(upserter.updateSublists.callCount).toEqual(1);
      });

      it("should call setRecordField for each record field given that is not 'id'", function() {
        expect(upserter.setRecordField.callCount).toEqual(3);
      });

    });

    describe('an error occurs in setting any attribute of the record', function() {

      beforeEach(function() {
        this.exception          = new Error(errorMessage);
        this.formattedException = upserter.common.formatException(this.exception);
        spyOn(upserter.common, 'formatException');
        spyOn(upserter, 'setRecordField').andCallFake(function() {
          throw errorMessage;
        });
        spyOn(upserter, 'updateSublists').andCallFake(function() {
          throw errorMessage;
        });
        upserter.populateRecordFields({}, recordData[0]);
      });

      it("should call formatException on CommonObject", function() {
        expect(upserter.common.formatException).toHaveBeenCalledWith(errorMessage);
      });

    });

  });

  describe('#setRecordField(record, fieldName, value)', function() {

    beforeEach(function() {
      this.fieldName = 'displayname';
      this.value     = 'VENDOR-MODEL-COLOR';
      upserter.setRecordField(netsuiteRecord, this.fieldName, this.value);
    });

    it("should call setFieldValue on the record object", function() {
      expect(netsuiteRecord.setFieldValue).toHaveBeenCalledWith(this.fieldName, this.value);
    });

  });

  describe('#updateSublists(record, sublistsData)', function() {

    beforeEach(function() {
      this.sublistData = recordWithSublist[upserter.SUBLIST_KEY];
      spyOn(upserter, 'populateSublist');
      upserter.updateSublists(netsuiteRecord, this.sublistData);
    });

    it("should call populateSublist for each sublist given", function() {
      expect(upserter.populateSublist.callCount).toEqual(Object.keys(this.sublistData).length);
    });

  });

  describe('#populateSublist(record, sublistData)', function() {

    it("should call matchSublistItem for each sublist item with a match field", function() {
    });

    it("should call populateSublistItemFields for each sublist item to be written", function() {
    });

    it("should call deleteSublistItem for each sublist item to be deleted", function() {
    });

  });

  describe('#matchSublistItem(record, sublistName, sublistItemData)', function() {

    beforeEach(function() {
      netsuiteRecord.getLineItemCount = function() {};
      spyOn(netsuiteRecord, 'getLineItemCount').andReturn(1);
      netsuiteRecord.getLineItemValue = function() {};
      spyOn(netsuiteRecord, 'getLineItemValue').andReturn('12345');
      this.sublistName     = 'item';
      this.matchField      = 'item';
      this.matchValue      = '12345';
      this.sublistItemData = recordWithSublist[upserter.SUBLIST_KEY][this.sublistName][0];
      this.returnValue     = upserter.matchSublistItem(netsuiteRecord, 'item', this.sublistData,
                                                       this.matchField, this.matchValue);
    });

    it("should call getLineItemCount", function() {
      expect(netsuiteRecord.getLineItemCount).toHaveBeenCalledWith('item');
    });

    it("should call getLineItemValue", function() {
      expect(netsuiteRecord.getLineItemValue).toHaveBeenCalledWith('item', 'item', 1);
    });

    it("should return the index of a matching line item", function() {
      expect(this.returnValue).toEqual(1);
    });

  });

  describe('#populateSublistItemFields(record, sublistField, sublistItemData, index)', function() {

    beforeEach(function() {
      this.sublistItemData     = recordWithSublist[upserter.SUBLIST_KEY]['item'][0];
      this.sublistFieldChanges = this.sublistItemData[upserter.SUBLIST_DATA_KEY];
      this.fieldCount          = Object.keys(this.sublistFieldChanges).length;
      spyOn(upserter, 'setSublistItemField');
      upserter.populateSublistItemFields(netsuiteRecord, 'item', this.sublistFieldChanges, 1);
    });

    it("should call setSublistItemField for each sublist item field given", function() {
      expect(upserter.setSublistItemField.callCount).toEqual(this.fieldCount);
    });

  });

  describe('#setSublistItemField(record, sublistField, sublistItemFieldName, index, value)', function() {

    beforeEach(function() {
      upserter.setSublistItemField(netsuiteRecord, 'item', 'item', 1, '12345');
    });

    it("should setLineItemValue with the given params", function() {
      expect(netsuiteRecord.setLineItemValue).toHaveBeenCalledWith('item', 'item', 1, '12345');
    });

  });

  describe('#deleteSublistItem(record, sublistFieldName, index)', function() {

    beforeEach(function() {
      upserter.deleteSublistItem(netsuiteRecord, 'item', 1);
    });

    it("should call removeLineItem wth the given field name and index", function() {
      expect(netsuiteRecord.removeLineItem).toHaveBeenCalledWith('item', 1);
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
        ];
        spyOn(upserter, 'submitRecord').andCallFake(function() {
          throw errorMessage;
        });
        upserter.submitRecordList();
      });

      it("should call formatException on CommonObject", function() {
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
      this.recordListElement      = new UpsertRecordListElement({}, {});
      this.result                 = '12345';
      this.fakeFormattedException = {};
      spyOn(this.recordListElement, 'makeException');
    });

    it("should add the given result to the given UpsertRecordListElement", function() {
      upserter.addResultToRecord(this.recordListElement, this.result);
      expect(this.recordListElement.result).toEqual(this.result);
    });

    it("should call makeException onthe element if exception is true", function() {
      upserter.addResultToRecord(this.recordListElement, this.fakeFormattedException, true);
      expect(this.recordListElement.makeException).toHaveBeenCalledWith(this.fakeFormattedException);
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
