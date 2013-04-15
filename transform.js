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

  Transformer.prototype.transformSingleRecord = function() {
  }

  Transformer.prototype.updateTransformedRecord = function() {
  }

  Transformer.prototype.updateLiteralFields = function() {
  }

  Transformer.prototype.setSingleLiterlaField = function() {
  }

  Transformer.prototype.filterSublists = function() {
  }

  Transformer.prototype.filterSingleSublist = function() {
  }

  Transformer.prototype.setSublistItemFields = function() {
  }

  Transformer.prototype.setSingleSublistItemField = function() {
  }

  Transformer.prototype.removeSublistItems = function() {
  }

  Transformer.prototype.removeSingleSublistItem = function() {
  }

  Transformer.prototype.writeTransformedRecord = function() {
  }

  Transformer.prototype.appendResults = function() {
  }

  Transformer.prototype.getParams = function() {
  }

  Transformer.prototype.reply = function() {
  }

  return Transformer;

})();

var postHandler = function(request) {
}
