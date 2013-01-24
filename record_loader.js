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

    this.uniqueIdList = function() {
      var uniquedArray = [];
      var length       = this.idList.length;

      for(var i=0; i<length; i++) {
        for(var j=i+1; j<length; j++) {
          if(this.idList[i] === this.idList[j]) {
            j = ++i;
          }
          uniquedArray.push(this.idList[j]);
        }
      }

      this.idList = uniquedArray;
      return(uniquedArray);
    };

    this.uniqueIdList();
  };

  RecordLoader.prototype.loadRecords = function() {
    for(index=0; index<this.idList.length; index++) {
      recordType = this.recordType;
      recordId   = this.idList[index];

      record = nlapiLoadRecord(recordType, recordId);
      this.resultList.push(record);
    }
  }

  return RecordLoader;
})();

function postHandler(request) {
  /*
   * Description: Method to handle requests over POST
   * Params:
   *              request: Request object from the REST client
   *
   * Return:      JSON response
   */
  try {
    return([true].concat([evalOperation('POST', request['operation'], request)]));
  }
  catch(exception) {
    return([false].concat([formatException(exception)]));
  }
}

