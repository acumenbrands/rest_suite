require('./spec_helper.js');

describe("Transformer", function() {

  var transformer;
  var initialRecordType = 'salesorder'
  var resultRecordType = 'invoice'

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
      'record_data': {
        'custitemcustomdata': "Woo! It's a memo!"
      },
      'sublist_data': {
        'item': [
          sublistItemToAlter,
          sublistItemToDelete
        ],
      }
    }
  ];

  beforeEach(function() {
    transformer = new Transformer(initialRecordType, resultRecordType, recordData);
    global.nlapiLoadRecord = function() {}
    global.nlapiTransformRecord = function() {}
  });

  describe('#init(initialRecordType, resultRecordType, recordData)', function() {

    describe('Constants', function() {

      it("should define RECORD_DATA_KEY", function() {
        expect(transformer.RECORD_DATA_KEY).toBeDefined();
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

  describe('#transformRecordList', function() {
  });

  describe('#transformSingleRecord(recordId)', function() {

    beforeEach(function() {
      this.id = '12345';
      spyOn(global, 'nlapiTransformRecord');
      transformer.transformSingleRecord(this.id);
    });

    it('calls nlapiTransformRecord with the initial type, result type and given id', function() {
      expect(global.nlapiTransformRecord).toHaveBeenCalledWith(transformer.initialRecordType, this.id,
                                                               transformer.resultRecordType);
    });

  });

  describe('#updateTransformedRecord', function() {
  });

  describe('#updateLiteralFields', function() {
  });

  describe('#setSingleLiterlaField', function() {
  });

  describe('#filterSublists', function() {
  });

  describe('#filterSingleSublist', function() {
  });

  describe('#setSublistItemFields', function() {
  });

  describe('#setSingleSublistItemField', function() {
  });

  describe('#removeSublistItems', function() {
  });

  describe('#removeSingleSublistItem', function() {
  });

  describe('#writeTransformedRecord', function() {
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

