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
      recordType = this.recordType;
      recordId   = this.idList[index];
      record     = null;
      params     = this.formatParams(recordId);

      try {
        record = nlapiLoadRecord(recordType, recordId);
        this.addFormattedReply(params, record);
      } catch(exception) {
        record = this.common.formatException(exception);
        this.addFormattedReply(recordId, null, record);
      }

      this.resultList.push(record);
    }
  }

  Loader.prototype.formatParams = function(id) {
    return {
      'recordType': this.recordType,
      'id':         id
    };
  }

  Loader.prototype.addFormattedReply = function (params, result, exception) {
    reply = this.common.formatReply(params, result, exception);
    this.replyList.push(reply);
  }

  Loader.prototype.reply = function() {
    return this.replyList;
  }

  return Loader;
})();

var postHandler = function(request) {
  loader = new Loader(request['record_type'], request['id_list']);
  loader.loadRecords();
  return recordLoader.reply();
}
