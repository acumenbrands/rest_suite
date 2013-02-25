this.Loader = (function() {
  function Loader(recordType, idList) {
    this.recordType = recordType;
    this.idList     = idList;
    this.resultList = [];
    this.replyList  = [];

    this.common = new CommonObject;
  };

  Loader.prototype.loadRecords = function() {
    for(index=0;index<this.idList.length;index++) {
      recordId = this.idList[index];

      try {
        record = this.getRecordFromNetsuite(recordId);
        this.processResult(record);
      } catch(exception) {
        this.processResult(null, exception);
      }
    }
  }

  Loader.prototype.getRecordFromNetsuite = function(recordId) {
    return nlapiLoadRecord(this.recordType, recordId);
  }

  Loader.prototype.processResult = function(result, exception) {
    this.resultList.push(result);
    this.addFormattedReply(result, exception);
  }

  Loader.prototype.getParams = function(id) {
    return {
      'recordType': this.recordType,
      'id':         id
    };
  }

  Loader.prototype.addFormattedReply = function (result, exception) {
    params = this.getParams();
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
