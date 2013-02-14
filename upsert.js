var Upserter;

this.Upserter = (function() {

  function Upserter(recordType, recordData) {
    this.RECORD_DATA_KEY      = 'record_data';
    this.DO_SOURCING_KEY      = 'do_sourcing';
    this.IGNORE_MANDATORY_KEY = 'ignore_mandatory';

    this.recordType = recordType;
    this.recordData = recordData;
    this.recordList = [];
    this.replyList  = [];

    this.common = new CommonObject;
  };

  Upserter.prototype.upsertRecords = function() {
    this.populateRecordList();
    this.submitRecordList();
  }

  Upserter.prototype.populateRecordList = function() {
    for(index in this.recordData) {
      recordData = this.recordData[index];
      record     = this.loadOrInitializeRecord(recordData)
      this.populateRecordFields(record, recordData)
      this.pushRecordToRecordList(recordData, record);
    }
  }

  Upserter.prototype.loadOrInitializeRecord = function(record) {
    if(record[this.RECORD_DATA_KEY].hasOwnProperty('id')) {
      return this.loadRecord(record['id']);
    } else {
      return this.initializeRecord();
    }
  }

  Upserter.prototype.loadRecord = function(recordId) {
    return nlapiLoadRecord(this.recordType, recordId);
  }

  Upserter.prototype.initializeRecord = function() {
    return nlapiInitializeRecord(this.recordType);
  }

  Upserter.prototype.populateRecordFields = function(recordFieldData) {
  }

  Upserter.prototype.updateSublists = function(sublistsData) {
  }

  Upserter.prototype.populateSublist = function(sublistData) {
  }

  Upserter.prototype.buildSublistItem = function(sublistItemData) {
  }

  Upserter.prototype.buildSublists = function() {
  }

  Upserter.prototype.pushRecordToRecordList = function(recordData, record) {
    recordListElement = new global.UpsertRecordListElement(recordData, record);
    this.recordList.push(recordListElement);
  }

  Upserter.prototype.submitRecordList = function() {
    for(index in this.recordList) {
      record = this.recordList[index][this.RECORD_LIST_RECORD_KEY];
      result = this.submitRecord(record);
      this.addResultToRecord(record, result);
    }
  }

  Upserter.prototype.submitRecord = function(record) {
    return nlapiSubmitRecord(record);
  }

  Upserter.prototype.addResultToRecord = function(recordListElement, result) {
    recordListElement.result = result;
  }

  Upserter.prototype.buildReplyList = function() {
    for(index in this.recordList) {
      recordListElement = this.recordList[index];
      this.addFormattedReply(recordListElement);
    }
  }

  Upserter.prototype.addFormattedReply = function(recordListElement) {
    data   = recordListElement.recordData;
    result = recordListElement.result;

    formattedReply = this.common.formatReply(data, result);
    this.replyList.push(formattedReply);
  }

  Upserter.prototype.reply = function() {
    return this.replyList;
  }

  return Upserter;
})();

var UpsertRecordListElement;

this.UpsertRecordListElement = (function() {

  function UpsertRecordListElement(recordData, record) {
    this.recordData = recordData;
    this.record     = record;
    this.result     = null;
  }

  return UpsertRecordListElement;
})();

var postHandler = function(request) {
  var upserter = new Upserter();
  upserter.loadRecords();
  return recordUpserter.reply();
}
