this.Transformer = (function() {

  function Transformer(initialRecordType, resultRecordType, recordData) {
    this.RECORD_DATA_KEY    = 'record_data';
    this.SUBLIST_KEY        = 'sublist_data';
    this.SUBLIST_MATCH_KEY  = 'match_field';
    this.SUBLIST_DELETE_KEY = 'delete';
    this.SUBLIST_DATA_KEY   = 'item_data';

    this.initialRecordType = initialRecordType;
    this.resultRecordType  = resultRecordType;
    this.recordData        = recordData;

    this.loadedRecordList      = [];
    this.transformedRecordList = [];
    this.replyList             = [];
  }

  Transformer.prototype.loadRecordsFromNetsuite = function() {
  }

  Transformer.prototype.loadSingleRecord = function(recordId) {
    nlapiLoadRecord(this.initialRecordType, recordId);
  }

  Transformer.prototype.transformRecordList = function() {
  }

  Transformer.prototype.transformSingleRecord = function(recordId) {
    nlapiTransformRecord(this.initialRecordType, recordId, this.resultRecordType);
  }

  Transformer.prototype.updateTransformedRecord = function() {
  }

  Transformer.prototype.updateLiteralFields = function() {
  }

  Transformer.prototype.setSingleLiteralField = function(record, fieldName, value) {
    record.setFieldValue(fieldName, value);
  }

  Transformer.prototype.filterSublists = function() {
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

  Transformer.prototype.appendResults = function() {
  }

  Transformer.prototype.getParams = function() {
    return {
      'initial_record_type': this.initialRecordType,
      'result_record_type':  this.resultRecordType,
      'record_data':         this.recordData
    };
  }

  Transformer.prototype.reply = function() {
  }

  return Transformer;

})();

var postHandler = function(request) {
}
