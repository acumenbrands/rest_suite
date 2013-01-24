var RecordLoader;

this.RecordLoader = (function() {
  /**************************************************************
   * Description: Retrieves a single record based on query fields
   * Params:
   *              recordType: String matching a record type
   *              idList:     Array of Strings matching the internal
   *                          ids of multiple records
   *
   * Return:      
   **************************************************************/
  function RecordLoader(recordType, idList) {
    this.recordType = recordType;
    this.idList     = idList;
    this.resultList = [];
    this.replyList  = [];

    this.common = new CommonObject;
  };

  RecordLoader.prototype.loadRecords = function() {
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

  RecordLoader.prototype.addFormattedReply = function (params, result, exception) {
    var reply = this.common.formatReply(params, result, exception);
    this.replyList.push(reply);
  }

  RecordLoader.prototype.reply = function() {
    return this.replyList;
  }

  return RecordLoader;
})();

var postHandler = function(request) {
  /*
   * Description: Method to handle requests over POST
   * Params:
   *              request: Request object from the REST client
   *
   * Return:      JSON response
   */
  var recordLoader = new RecordLoader(request['record_type'], request['id_list']);

  recordLoader.loadRecords();
  
  return recordLoader.reply();
}
