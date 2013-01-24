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
        record = formatException(exception);
        this.addFormattedReply(recordId, null, record);
      }

      this.resultList.push(record);
    }
  }

  RecordLoader.prototype.addFormattedReply = function (params, result, exception) {
    var reply = formatReply(params, result, exception);
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

var formatReply = function(params, result, exception) {
  exception = exception || false;

  var reply = {};

  reply['params']  = params;
  reply['result']  = result;

  if(exception) {
    reply['exception'] = exception
    reply['success']   = false
  } else {
    reply['exception'] = null
    reply['success']   = true;
  }

  return reply; 
}

var formatException = function(exception) {
  var formattedException = {};

  formattedException['message'] = exception.message;

  try {
    formattedException['trace'] = exception.getStackTrace();
  } catch(stack_fetch_error) {
    formattedException['trace'] = stack_fetch_error.message;
  }

  return formattedException;
}
