require('./spec_helper.js');

describe("Transformer", function() {

  var transformer;
  var initialRecordType = 'salesorder'
  var resultRecordType = 'invoice'

  var firstId  = '12345';
  var secondId = '67890';
  var sublistItemToAlter = {
    'match_field': 'item',
    'delete':      'false',
    'item_data': {
      'item':     '12345678',
      'quantity': '7'
    }
  } 
  var sublistItemToDelete = {
    'match_field': 'item',
    'delete':      'true',
    'item_data': {
      'item': '0987654321'
    }
  }
  var recordData = [
    {
      'id': firstId,
      'record_data': {
        'custitemcustomdata': "Woo! It's a memo!"
      },
      'sublist_data': {
        'item': [
          sublistItemToAlter,
          sublistItemToDelete
        ],
      }
    },
    {
      'id': secondId,
      'record_data': {
        'tranid': 'HG12345'
      }
    }
  ];

  beforeEach(function() {
    transformer = new Transformer(initialRecordType, resultRecordType, recordData);
    global.nlapiLoadRecord = function() {}
    global.nlapiTransformRecord = function() {}
    global.nlapiSubmitRecord = function() {}
  });

  describe('#init(initialRecordType, resultRecordType, recordData)', function() {

    describe('Constants', function() {

      it("should define RECORD_INTERNAL_ID_KEY", function() {
        expect(transformer.RECORD_INTERNAL_ID_KEY).toBeDefined();
      });

      it("should define RECORD_DATA_KEY", function() {
        expect(transformer.RECORD_DATA_KEY).toBeDefined();
      });

      it("should define RECORD_OBJECT_KEY", function() {
        expect(transformer.RECORD_OBJECT_KEY).toBeDefined();
      });

      it("shuld define SUBLIST_KEY", function() { 
        expect(transformer.SUBLIST_KEY).toBeDefined();
      });

      it("should define SUBLIST_MATCH_KEY", function() {
        expect(transformer.SUBLIST_MATCH_KEY).toBeDefined();
      });

      it("should define SUBLIST_DELETE_KEY", function() {
        expect(transformer.SUBLIST_DELETE_KEY).toBeDefined();
      });

      it("should define SUBLIST_DATA_KEY", function() {
        expect(transformer.SUBLIST_DATA_KEY).toBeDefined();
      });

      it("should define TRANSFORMED_RECORD_KEY", function() {
        expect(transformer.TRANSFORMED_RECORD_KEY).toBeDefined();
      });

      it("should define SUCCESS_KEY", function() {
        expect(transformer.SUCCESS_KEY).toBeDefined();
      });

    });

    it('sets common to an instance of CommonObject', function() {
      expect(transformer.common).toEqual(new CommonObject);
    });

    it('sets the initial record type', function() {
      expect(transformer.initialRecordType).toEqual(initialRecordType);
    });

    it('sets the result record type', function() {
      expect(transformer.resultRecordType).toEqual(resultRecordType);
    });

    it('sets the original record data', function() {
      expect(transformer.originalRecordData).toEqual(recordData);
    });

    it('sets the record data', function() {
      expect(transformer.recordData).toEqual(recordData);
    });

  });

  describe('#loadRecordsFromNetsuite', function() {

    beforeEach(function() {
      spyOn(transformer, 'loadSingleRecord').andReturn({});
      spyOn(transformer, 'appendRecordToData');
      transformer.loadRecordsFromNetsuite();
    });

    it('calls loadSingleRecord for each element of record data', function() {
      expect(transformer.loadSingleRecord.callCount).toEqual(recordData.length);
    });

    it('calls loadSingleRecord with each id in the record data', function() {
      expect(transformer.loadSingleRecord.argsForCall).toEqual([[firstId], [secondId]]);
    });

    it('calls appendRecordToData for each element of record data', function() {
      expect(transformer.appendRecordToData.callCount).toEqual(recordData.length);
    });

    it('calls appendRecordToData for each with each record and set of record data', function() {
      expect(transformer.appendRecordToData.argsForCall).toEqual([[recordData[0], {}],
                                                                 [recordData[1], {}]]);
    });

  });

  describe('#loadSingleRecord(recordId)', function() {

    beforeEach(function() {
      this.id = '12345';
      spyOn(global, 'nlapiLoadRecord');
      transformer.loadSingleRecord(this.id);
    });

    it('calls nlapiLoadRecord with the initial record type and id', function() {
      expect(global.nlapiLoadRecord).toHaveBeenCalledWith(transformer.initialRecordType, this.id);
    });

  });

  describe('#appendRecordToData', function() {

    beforeEach(function() {
      this.record = {};
      transformer.appendRecordToData(recordData[0], this.record);
    });

    it('sets the record object field equal to the given record', function() {
      expect(recordData[0][transformer.RECORD_OBJECT_KEY]).toEqual(this.record);
    });

  });

  describe('#transformRecordList', function() {

    beforeEach(function() {
      spyOn(transformer, 'transformSingleRecord');
      spyOn(transformer, 'appendTransformedRecordToData');
      transformer.transformRecordList();
    });

    it('calls transformSingleRecord for each element of record data', function() {
      expect(transformer.transformSingleRecord.callCount).toEqual(recordData.length);
    });

    it('calls transformSingleRecord with each record object in record data', function() {
      expect(transformer.transformSingleRecord.argsForCall).toEqual([[firstId],
                                                                    [secondId]]);
    });

    it('calls appendTransformedRecordToData for each element of recordData', function() {
      expect(transformer.appendTransformedRecordToData.callCount).toEqual(recordData.length);
    });

  });

  describe('#appendTransformedRecordToData', function() {

    beforeEach(function() {
      this.transformedRecord = {};
      transformer.appendTransformedRecordToData(recordData[0], this.transformedRecord);
    });

    it('sets the record object field equal to the given record', function() {
      expect(recordData[0][transformer.TRANSFORMED_RECORD_KEY]).toEqual(this.transformedRecord);
    });

  });

  describe('#transformSingleRecord(recordId)', function() {

    beforeEach(function() {
      this.id = '12345';
      spyOn(global, 'nlapiTransformRecord');
      transformer.transformSingleRecord(this.id);
    });

    it('calls nlapiTransformRecord with the initial type, result type and given id', function() {
      expect(global.nlapiTransformRecord).toHaveBeenCalledWith(transformer.initialRecordType,
                                                               this.id,
                                                               transformer.resultRecordType);
    });

  });

  describe('#updateTransformedRecord(record)', function() {

    beforeEach(function() {
      this.record = {};
      this.recordData = recordData[0];
      this.recordData[transformer.RECORD_OBJECT_KEY] = this.record;
      this.literalData = this.recordData[transformer.RECORD_DATA_KEY];
      this.sublistData = this.recordData[transformer.SUBLIST_KEY];
      spyOn(transformer, 'updateLiteralFields');
      spyOn(transformer, 'filterSublists');
      transformer.updateTransformedRecord(this.recordData);
    });

    it('calls updateLiteralFields with the record and its matching record data', function() {
      expect(transformer.updateLiteralFields).toHaveBeenCalledWith(this.record, this.literalData);
    });

    it('calls filterSublists with the record and its matching sublist data', function() {
      expect(transformer.filterSublists).toHaveBeenCalledWith(this.record, this.sublistData);
    });

  });

  describe('#updateLiteralFields(record, fieldData)', function() {

    beforeEach(function() {
      this.record = {};
      this.fieldData = {
        'quantity': '17',
        'custitemnote': 'WOO! NOTES!'
      }
      this.firstCall = [this.record, 'quantity', '17'];
      this.secondCall = [this.record, 'custitemnote', 'WOO! NOTES'];
      spyOn(transformer, 'setSingleLiteralField');
      transformer.updateLiteralFields(this.record, this.fieldData);
    });

    it('calls setSingleLiteralField for each element of fieldData', function() {
      expect(transformer.setSingleLiteralField.callCount).toEqual(2);
    });

    it('calls setSingleLiteralField with the correct sequence of arguments', function() {
      expect(transformer.setSingleLiteralField.argsForCall).toContain(this.firstCall,
                                                                      this.secondCall);
    });

  });

  describe('#setSingleLiteralField(record, fieldName, value)', function() {

    beforeEach(function() {
      this.record = {};
      this.fieldName = 'custitem22';
      this.value = '9001';
      this.record.setFieldValue = function() {}
      spyOn(this.record, 'setFieldValue');
      transformer.setSingleLiteralField(this.record, this.fieldName, this.value);
    });

    it('calls setFieldValue with the given values', function() {
      expect(this.record.setFieldValue).toHaveBeenCalledWith(this.fieldName, this.value);
    });

  });

  describe('#filterSublists(record, sublistsData)', function() {

    beforeEach(function() {
    });

    it('calls filterSingleSublist for each element of sublistData', function() {
    });

    it('calls filterSingleSublist with the correct sequence of arguments', function() {
    });

  });

  describe('#filterSingleSublist(record, sublistData)', function() {

    beforeEach(function() {
    });

    it('calls setSublistItemFields with all items that are not to be deleted', function() {
    });

    it('calls removeSingleSublistItems with all items to be deleted', function() {
    });

  });

  describe('#setSublistItemFields(record, index, sublistFieldData)', function() {

    beforeEach(function() {
    });

    it('calls setSingleSublistItemField for each element of sublistFieldData', function() {
    });

    it('calls setSingleSublistItemField with the correct sequence of arguments', function() {
    });

  });

  describe('#setSingleSublistItemField(listName, fieldName, index, value)', function() {

    beforeEach(function() {
      this.record = {};
      this.list = 'items';
      this.field = 'quantity';
      this.index = 7;
      this.value = '17';
      this.record.setLineItemValue = function() {}
      spyOn(this.record, 'setLineItemValue');
      transformer.setSingleSublistItemField(this.record, this.list, this.field,
                                            this.index, this.value);
    });

    it('calls setLineItemValue with the given arguments', function() {
      expect(this.record.setLineItemValue).toHaveBeenCalledWith(this.list, this.field,
                                                                this.index, this.value);
    });

  });

  describe('#removeSublistItems(record, sublistData)', function() {
  });

  describe('#removeSingleSublistItem', function() {

    beforeEach(function() {
      this.sublistName = 'foo';
      this.index = 13;
      this.record = {}
      this.record.removeLineItem = function() {}
      spyOn(this.record, 'removeLineItem');
      transformer.removeSingleSublistItem(this.record, this.sublistName, this.index);
    });

    it('calls removeLineItem on the given record with the sublist name and index', function() {
      expect(this.record.removeLineItem).toHaveBeenCalledWith(this.sublistName, this.index);
    });

  });

  describe('#writeTransformedRecord', function() {

    beforeEach(function() {
      this.record = {};
      spyOn(global, 'nlapiSubmitRecord');
      transformer.writeTransformedRecord(this.record);
    });

    it('calls nlapiSubmitRecord with the given record', function() {
      expect(global.nlapiSubmitRecord).toHaveBeenCalledWith(this.record, false, false);
    });

  });

  describe('#generateResultList', function() {
  });

  describe('#getParams', function() {

    beforeEach(function() {
      this.params = transformer.getParams();
    });

    it('populates the initial record type', function() {
      expect(this.params['initial_record_type']).toEqual(transformer.initialRecordType);
    });

    it('populates the result record type', function() {
      expect(this.params['result_record_type']).toEqual(transformer.resultRecordType);
    });

    it('populates the record data', function() {
      expect(this.params['record_data']).toEqual(transformer.originalRecordData);
    });

  });

  describe('#reply', function() {

    beforeEach(function() {
      this.fakeResults = [];
      this.fakeParams  = {};
      this.fakeReply   = { 'result': this.fakeResults, 'params': this.fakeParams };
      spyOn(transformer, 'generateResultList').andReturn(this.fakeResults);
      spyOn(transformer, 'getParams').andReturn(this.fakeParams);
      spyOn(transformer.common, 'formatReply').andReturn(this.fakeReply);
      this.reply = transformer.reply();
    });

    it('calls generateResultList', function() {
      expect(transformer.generateResultList.callCount).toEqual(1);
    });

    it('calls getParams', function() {
      expect(transformer.getParams.callCount).toEqual(1);
    });

    it('calls formatreply on CommonObject', function() {
      expect(transformer.common.formatReply.callCount).toEqual(1);
    });

    it('returns a formatted reply containing the result list and params', function() {
      expect(this.reply).toEqual(this.fakeReply);
    });

  });

});

