require('./spec_helper.js');

describe('Upserter', function() {
  var upserter;
  var recordType = 'inventoryitem';
  var doSourcing      = false;
  var ignoreMandatory = false;
  var recordData = [
    {
      'itemid':      'SCHWA-FOO',
      'displayname': 'SCHWA-FOO',
      'custitem22':  '17'
    },
    {
      'id':         '12345',
      'custitem22': '75'
    }
  ];

  global.nlapiSubmitRecord = function() {};

  describe('#init', function() {
    it("should set the record type", function() {
    });

    it("should set the record data", function() {
    });

    it("should set the sourcing mode", function() {
    });

    it("should set the mandatory ignoring mode", function() {
    });
  });

  describe('#upsertRecords', function() {
    it("should call performUpsert", function() {
    });

    it("should call loadRecordById if an id is supplied for a record", function() {
    });
  });

  describe('#loadRecordById', function() {
    it("should call the Netsuite load record function", function() {
    });
  });

  describe('#buildSublists', function() {
  });

  describe('#performUpsert', function() {
  });

  describe('#addFormattedReply', function() {
  });

  describe('#reply', function() {
  });
});
