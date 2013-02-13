var Upserter;

this.Upserter = (function() {
  function Upserter(recordType, recordData) {
    this.recordType = recordType;
    this.recordData = recordData;
  };

  Upserter.prototype.upsertRecords = function() {
    this.populateRecordList();
    this.submitRecordList();
  }

  Upserter.prototype.populateRecordList = function() {
    // iterate over recorddata
    //   record = loadOrInitializeRecord(element)
    //   populateRecordFields(record, element)
    //   this.recordList.push(record)
  }

  Upserter.prototype.loadOrInitializeRecord = function() {
  }

  Upserter.prototype.loadRecord = function(recordId) {
    return nlapiLoadRecord(this.recordType, recordId);
  }

  Upserter.prototype.initializeRecord = function() {
  }

  Upserter.prototype.populateRecordFields = function() {
  }

  Upserter.prototype.buildSublists = function() {
  }

  Upserter.prototype.submitRecordList = function() {
  }

  Upserter.prototype.upsertRecord = function() {
  }

  Upserter.prototype.addFormattedReply = function () {
  }

  Upserter.prototype.reply = function() {
  }

  return Upserter;
})();

var postHandler = function(request) {
  var upserter = new Upserter();
  upserter.loadRecords();
  return recordUpserter.reply();
}
