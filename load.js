var Loader;

this.Loader = (function() {
  function Loader(recordType, idList) {
    this.recordType = recordType;
    this.idList     = idList;
    this.resultList = [];
    this.replyList  = [];

    this.common = new CommonObject;
  };

  Loader.prototype.loadRecords = function() {
    for(index=0; index<this.idList.length; index++) {
      var recordType = this.recordType;
      var recordId   = this.idList[index];
      var record     = null;

      try {
        record = nlapiLoadRecord(recordType, recordId);
        this.addFormattedReply(recordId, record);
      } catch(exception) {
        record = this.common.formatException(exception);
        this.addFormattedReply(recordId, null, record);
      }

      this.resultList.push(record);
    }
  }

  Loader.prototype.addFormattedReply = function (params, result, exception) {
    var reply = this.common.formatReply(params, result, exception);
    this.replyList.push(reply);
  }

  Loader.prototype.reply = function() {
    return this.replyList;
  }

  return Loader;
})();

var postHandler = function(request) {
  var loader = new Loader(request['record_type'], request['id_list']);
  loader.loadRecords();
  return recordLoader.reply();
}
