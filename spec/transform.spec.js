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
      'literal_fields': {
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
  });

  describe('#init', function() {

    it('sets the initial record type', function() {
    });

    it('sets the result record type', function() {
    });

  });

  describe('#loadRecordsFromNetsuite', function() {
  });

  describe('#loadSingleRecord', function() {
  });

  describe('#transformRecordList', function() {
  });

  describe('#transformSingleRecord', function() {
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
  });

  describe('#reply', function() {
  });

});

