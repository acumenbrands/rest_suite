var Deleter;

this.Deleter = (function() {
  function Deleter(recordType, idList) {
    this.recordType = recordType;
    this.idList     = idList;
    this.resultList = [];
    this.replyList  = [];

    this.common = new CommonObject;
  };

  Deleter.prototype.deleteRecords = function() {
    for(index=0; index<this.idList.length; index++) {
      var recordType = this.recordType;
      var recordId   = this.idList[index];
      var record     = null;

      try {
        record = nlapiDeleteRecord(recordType, recordId);
        this.addFormattedReply(recordId, record);
      } catch(exception) {
        record = this.common.formatException(exception);
        this.addFormattedReply(recordId, null, record);
      }

      this.resultList.push(record);
    }
  }

  Deleter.prototype.addFormattedReply = function (params, result, exception) {
    var reply = this.common.formatReply(params, result, exception);
    this.replyList.push(reply);
  }

  Deleter.prototype.reply = function() {
    return this.replyList;
  }

  return Deleter;
})();

var postHandler = function(request) {
  var deleter = new Deleter(request['record_type'], request['id_list']);
  deleter.deleteRecords();
  return recordDeleter.reply();
}
