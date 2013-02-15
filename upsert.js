this.Upserter = (function() {

  function Upserter(recordType, recordData) {
    this.RECORD_DATA_KEY      = 'record_data';
    this.DO_SOURCING_KEY      = 'do_sourcing';
    this.IGNORE_MANDATORY_KEY = 'ignore_mandatory';

    this.SUBLIST_KEY          = 'sublist_data';
    this.SUBLIST_MATCH_KEY    = 'match_field';
    this.SUBLIST_DELETE_KEY   = 'delete';
    this.SUBLIST_DATA_KEY     = 'item_data';

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
    try {
      fieldData = recordData[this.RECORD_DATA_KEY];

      for(fieldName in fieldData) {
        if(fieldName == 'id') { continue; }
        value = fieldData[fieldName];
        this.setRecordField(record, fieldName, value);
      }

      if(recordData.hasOwnProperty(this.SUBLIST_KEY)) {
        sublistData = recordData[this.SUBLIST_KEY];
        this.updateSublists(record, sublistData);
      }
    } catch(exception) {
      record = this.common.formatException(exception);
    }
  }

  Upserter.prototype.setRecordField = function(record, fieldName, value) {
    record.setFieldValue(fieldName, value);
  }

  Upserter.prototype.updateSublists = function(record, sublistsData) {
    for(sublistName in sublistsData) {
      this.populateSublist(record, sublistName, sublistsData[sublistName]);
    }
  }

  Upserter.prototype.populateSublist = function(record, sublistData) {
  }

  Upserter.prototype.matchSublistItem = function(record, sublistName, sublistItemData,
                                                 matchField, matchValue) {
    for(index=1; index<record.getLineItemCount(sublistName)+1; index++) {
      checkValue = record.getLineItemValue(sublistName, matchField, index);
      if(checkValue == matchValue) {
        return index;
      }
    }
    
    return null;
  }

  Upserter.prototype.populateSublistItemFields = function(record, sublistField, sublistItemData,
                                                          index) {
    for(fieldName in sublistItemData) {
      value = sublistItemData[fieldName];
      this.setSublistItemField(record, sublistField, fieldName, index, value);
    }
  }

  Upserter.prototype.setSublistItemField = function(record, sublistField, sublistItemFieldName,
                                                    index, value) {
    record.setLineItemValue(sublistField, sublistItemFieldName, index, value);
  }

  Upserter.prototype.deleteSublistItem = function(record, sublistFieldName, index) {
    record.removeLineItem(sublistFieldName, index);
  }

  Upserter.prototype.pushRecordToRecordList = function(recordData, record, exception) {
    recordListElement = new global.UpsertRecordListElement(recordData, record, exception);
    this.recordList.push(recordListElement);
  }

  Upserter.prototype.submitRecordList = function() {
    for(index in this.recordList) {
      recordListElement = this.recordList[index];
      if(recordListElement.isException()) { continue; }

      record = recordListElement.record;

      try {
        result = this.submitRecord(record);
        this.addResultToRecord(recordListElement, result);
      } catch(exception) {
        result = this.common.formatException(exception);
        this.addResultToRecord(recordListElement, result, true);
      }
    }
  }

  Upserter.prototype.submitRecord = function(record) {
    return nlapiSubmitRecord(record);
  }

  Upserter.prototype.addResultToRecord = function(recordListElement, result, exception) {
    eception = exception || false;

    if(exception) {
      recordListElement.makeException(result);
    } else {
      recordListElement.result = result;
    }
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

    this.makeException = function(formattedException) {
      this.exception = true;
      this.result    = formattedException;
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
