this.Transformer = (function() {

  function Transformer(initialRecordType, resultRecordType, recordData) {
    this.RECORD_INTERNAL_ID_KEY = 'id';
    this.RECORD_DATA_KEY        = 'record_data';
    this.RECORD_OBJECT_KEY      = 'record_object';
    this.SUBLIST_KEY            = 'sublist_data';
    this.SUBLIST_MATCH_KEY      = 'match_field';
    this.SUBLIST_DELETE_KEY     = 'delete';
    this.SUBLIST_DATA_KEY       = 'item_data';
    this.TRANSFORMED_RECORD_KEY = 'transformed_record';
    this.SUCCESS_KEY            = 'success';

    this.common = new CommonObject;

    this.initialRecordType  = initialRecordType;
    this.resultRecordType   = resultRecordType;
    this.originalRecordData = recordData;
    this.recordData         = recordData;

    this.loadedRecordList      = [];
    this.transformedRecordList = [];
  }

  Transformer.prototype.loadRecordsFromNetsuite = function() {
    for(index in this.recordData) {
      data = this.recordData[index];
      record = this.loadSingleRecord(data[this.RECORD_INTERNAL_ID_KEY]);
      this.appendRecordToData(data, record);
    }
  }

  Transformer.prototype.loadSingleRecord = function(recordId) {
    nlapiLoadRecord(this.initialRecordType, recordId);
  }

  Transformer.prototype.appendRecordToData = function(recordData, record) {
    recordData[this.RECORD_OBJECT_KEY] = record;
  }

  Transformer.prototype.transformRecordList = function() {
    for(index in this.recordData) {
      data = this.recordData[index];
      recordId = data[this.RECORD_INTERNAL_ID_KEY];
      transformedRecord = this.transformSingleRecord(recordId);
      this.appendTransformedRecordToData(data, transformedRecord);
    }
  }

  Transformer.prototype.appendTransformedRecordToData = function(recordData, transformedRecord) {
    recordData[this.TRANSFORMED_RECORD_KEY] = transformedRecord;
  }

  Transformer.prototype.transformSingleRecord = function(recordId) {
    nlapiTransformRecord(this.initialRecordType, recordId, this.resultRecordType);
  }

  Transformer.prototype.updateTransformedRecord = function(recordData) {
    record = recordData[this.RECORD_OBJECT_KEY];
    literalFieldData = recordData[this.RECORD_DATA_KEY];
    sublistFieldData = recordData[this.SUBLIST_KEY];
    this.updateLiteralFields(record, literalFieldData);
    this.filterSublists(record, sublistFieldData);
  }

  Transformer.prototype.updateLiteralFields = function(record, fieldData) {
    for(fieldName in fieldData) {
      value = fieldData[fieldName];
      this.setSingleLiteralField(record, fieldName, value);
    }
  }

  Transformer.prototype.setSingleLiteralField = function(record, fieldName, value) {
    record.setFieldValue(fieldName, value);
  }

  Transformer.prototype.filterSublists = function(record, sublistsData) {
  }

  Transformer.prototype.filterSingleSublist = function() {
  }

  Transformer.prototype.setSublistItemFields = function() {
  }

  Transformer.prototype.setSingleSublistItemField = function(record, list, field, index, value) {
    record.setLineItemValue(list, field, index, value);
  }

  Transformer.prototype.removeSublistItems = function() {
  }

  Transformer.prototype.removeSingleSublistItem = function() {
  }

  Transformer.prototype.writeTransformedRecord = function(record) {
    nlapiSubmitRecord(record, false, false);
  }

  Transformer.prototype.generateResultList = function() {
  }

  Transformer.prototype.getParams = function() {
    return {
      'initial_record_type': this.initialRecordType,
      'result_record_type':  this.resultRecordType,
      'record_data':         this.originalRecordData
    };
  }

  Transformer.prototype.reply = function() {
    results = this.generateResultList();
    params  = this.getParams();
    return this.common.formatReply(params, results);
  }

  return Transformer;

})();

var postHandler = function(request) {
}
