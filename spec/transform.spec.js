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

    it('sets the initial record type', function() {
      expect(transformer.initialRecordType).toEqual(initialRecordType);
    });

    it('sets the result record type', function() {
      expect(transformer.resultRecordType).toEqual(resultRecordType);
    });

    it('sets the record data', function() {
      expect(transformer.recordData).toEqual(recordData);
    });

    it('sets the loaded record list with a blank array', function() {
      expect(transformer.loadedRecordList).toEqual([]);
    });

    it('sets the transformed record list with a blank array', function() {
      expect(transformer.transformedRecordList).toEqual([]);
    });

    it('sets the reply list with a blank array', function() {
      expect(transformer.replyList).toEqual([]);
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

  describe('#updateTransformedRecord', function() {
  });

  describe('#updateLiteralFields', function() {
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

  describe('#filterSublists', function() {
  });

  describe('#filterSingleSublist', function() {
  });

  describe('#setSublistItemFields', function() {
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

  describe('#removeSublistItems', function() {
  });

  describe('#removeSingleSublistItem', function() {
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

  describe('#appendResults', function() {
  });

  describe('#getParams', function() {

    beforeEach(function() {
      this.params = transformer.getParams();
    });

    it('populates the initial record type', function() {
      expect(this.params['initial_record_type']).toBeDefined();
    });

    it('populates the result record type', function() {
      expect(this.params['result_record_type']).toBeDefined();
    });

    it('populates the record data', function() {
      expect(this.params['record_data']).toBeDefined();
    });

  });

  describe('#reply', function() {
  });

});

