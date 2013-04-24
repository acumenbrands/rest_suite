this.Upserter = (function() {

  function Upserter(request) {
    this.params      = request;
    this.record_type = request['record_type'];
    this.record_data = request['record_data'];
    this.reply_list  = [];
    
    // NOTE(JamesChristie+nilmethod) this is clunky; we should refactor and
    //   rename CommonObject.
    this.common      = new CommonObject; 
  }

  Upserter.prototype.initializeRecord = function(record_type) {
    return nlapiInitializeRecord(record_type);
  }

  Upserter.prototype.loadRecord = function(record_type, internal_id) {
    return nlapiLoadRecord(record_type, internal_id);
  }

  Upserter.prototype.setLiteralField = function(record, field_name, value) {
    record.setFieldValue(field_name, value);
  }

  Upserter.prototype.getLineItemCount = function(record, sublist_name) {
    return record.getLineItemCount(sublist_name);
  }

  Upserter.prototype.getLineItemValue = function(record, sublist_name, index, field_name) {
    record.getLineItemValue(sublist_name, index, field_name);
  }

  Upserter.prototype.setLineItemValue = function(record, sublist_name, index, field_name, value) {
    record.setLineItemValue(sublist_name, index, field_name, value);
  }

  Upserter.prototype.submitRecord = function(record_type, record) {
    return nlapiSubmitRecord(record_type, record);
  }

  Upserter.prototype.reply = function() {
    return this.common.formatReply(this.params, this.replyList);
  }

  return Upserter;
})();

var postHandler = function(request) {
}
