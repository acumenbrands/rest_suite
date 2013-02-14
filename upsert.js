this.Upserter = (function() {

  function Upserter(recordType, recordData) {
    this.RECORD_DATA_KEY      = 'record_data';
    this.SUBLIST_KEY          = 'sublist_data';
    this.DO_SOURCING_KEY      = 'do_sourcing';
    this.IGNORE_MANDATORY_KEY = 'ignore_mandatory';

    this.recordType = recordType;
    this.recordData = recordData;
    this.recordList = [];
    this.replyList  = [];

    this.common = new CommonObject;
  }

  Upserter.prototype.upsertRecords = function() {
    this.populateRecordList();
    this.submitRecordList();
  }

  Upserter.prototype.populateRecordList = function() {
    for(index in this.recordData) {
      recordData = this.recordData[index];
      record     = this.loadOrInitializeRecord(recordData);

      if(!record.hasOwnProperty['message'] && !record.hasOwnProperty['trace']) {
        this.populateRecordFields(record, recordData);
        this.pushRecordToRecordList(recordData, record, false);
      } else {
        this.pushRecordToRecordList(recordData, record, true);
      }
    }
  }

  Upserter.prototype.loadOrInitializeRecord = function(recordData) {
    data = recordData[this.RECORD_DATA_KEY];

    if(data.hasOwnProperty('id')) {
      func     = this.loadRecord;
      argument = data['id'];
    } else {
      func     = this.initializeRecord;
      argument = this.recordType;
    }

    try {
      return func(argument);
    } catch(exception) {
      return this.common.formatException(recordData, exception);
    }
  }

  Upserter.prototype.loadRecord = function(recordId) {
    return nlapiLoadRecord(this.recordType, recordId);
  }

  Upserter.prototype.initializeRecord = function() {
    return nlapiInitializeRecord(this.recordType);
  }

  Upserter.prototype.populateRecordFields = function(record, recordData) {
  }

  Upserter.prototype.setRecordField = function(record, fieldName, value) {
  }

  Upserter.prototype.updateSublists = function(sublistsData) {
  }

  Upserter.prototype.populateSublist = function(sublistData) {
  }

  Upserter.prototype.populateSublistItemFields = function(sublistItemData) {
  }

  Upserter.prototype.setSublistItemField = function(sublistItem, sublistItemFieldName, value) {
  }

  Upserter.prototype.pushRecordToRecordList = function(recordData, record, exception) {
    recordListElement = new global.UpsertRecordListElement(recordData, record, exception);
    this.recordList.push(recordListElement);
  }

  Upserter.prototype.submitRecordList = function() {
    for(index in this.recordList) {
      record = this.recordList[index].record;

      try {
        result = this.submitRecord(record);
        this.addResultToRecord(record, result);
      } catch(exception) {
        result = this.common.formatException(exception);
        this.addResultToRecord(record, result, true);
      }
    }
  }

  Upserter.prototype.submitRecord = function(record) {
    return nlapiSubmitRecord(record);
  }

  Upserter.prototype.addResultToRecord = function(recordListElement, result, exception) {
    eception = exception || false;

    recordListElement.result    = result;
    recordListElement.exception = exception;
  }

  Upserter.prototype.buildReplyList = function() {
    for(index in this.recordList) {
      recordListElement = this.recordList[index];
      this.addFormattedReply(recordListElement);
    }
  }

  Upserter.prototype.addFormattedReply = function(recordListElement) {
    data      = recordListElement.recordData;
    result    = recordListElement.result;
    exception = recordListElement.exception;

    formattedReply = this.common.formatReply(data, result, exception);
    this.replyList.push(formattedReply);
  }

  Upserter.prototype.reply = function() {
    return this.replyList;
  }

  return Upserter;
})();

this.UpsertRecordListElement = (function() {

  function UpsertRecordListElement(recordData, record, exception) {
    this.recordData = recordData;
    this.record     = record;
    this.result     = null;
    this.exception  = exception || false;

    this.isException = function() {
      return this.exception == true;
    }

    if(this.isException()) {
      this.result = this.record;
    }
  }

  return UpsertRecordListElement;
})();

var postHandler = function(request) {
  var upserter = new Upserter();
  upserter.loadRecords();
  return recordUpserter.reply();
}
