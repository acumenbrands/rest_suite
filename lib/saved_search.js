this.SavedSearch = (function() {

  function SavedSearch(recordType, searchId, lowerBound, batchSize) {
    this.common             = new CommonObject();
    this.recordType         = recordType;
    this.searchId           = searchId;
    this.lowerBound         = lowerBound;
    this.originalLowerBound = lowerBound;
    this.originalBatchSize  = batchSize;

    intBatchSize = parseInt(batchSize);
    if((intBatchSize % 1000) != 0) {
      intBatchSize = intBatchSize + (1000 - (intBatchSize % 1000));
    }
    this.batchSize = intBatchSize;

    this.searchFilters      = [];
    this.searchColumns      = [];
    this.results            = [];

    this.createSearchFilter();
    this.createSearchColumn();
  }

  SavedSearch.prototype.createSearchFilter = function() {
    this.searchFilters = []
    filter = new nlobjSearchFilter('internalidnumber', null,
                                   'greaterthan', this.lowerBound);
    this.searchFilters.push(filter);
  }

  SavedSearch.prototype.createSearchColumn = function() {
    this.searchColumns = [];
    column = new nlobjSearchColumn('internalid', null);
    column.setSort();
    this.searchColumns.push(column);
  }

  SavedSearch.prototype.getParams = function() {
    return {
      'record_type': this.recordType,
      'search_id':   this.searchId,
      'batch_size':  this.originalBatchSize,
      'lower_bound': this.originalLowerBound
    }
  }

  SavedSearch.prototype.executeSearch = function() {
    while(true) {
      try {
        resultsBlock = this.searchIteration();
        if(this.isExecutionDone(resultsBlock)) { break; }
      } catch(exception) {
        this.results = this.common.formatException(exception);
        break;
      }
    }
  }

  SavedSearch.prototype.searchIteration = function() {
    resultsBlock = this.getSearchResults();
    this.updateBoundAndFilter(resultsBlock);
    this.appendResults(resultsBlock);
    return resultsBlock;
  }

  SavedSearch.prototype.getSearchResults = function() {
    return nlapiSearchRecord(this.recordType, this.searchId,
                             this.searchFilters, this.searchColumns);
  }

  SavedSearch.prototype.updateBoundAndFilter = function(resultsBlock) {
    newLowerBound = this.extractLowerBound(resultsBlock);
    this.lowerBound = newLowerBound;
    this.createSearchFilter();
  }

  SavedSearch.prototype.extractLowerBound = function(resultsBlock) {
    resultRow = resultsBlock[resultsBlock.length - 1];
    return resultRow.getId();
  }

  SavedSearch.prototype.appendResults = function(resultsBlock) {
    this.results = this.results.concat(resultsBlock);
  }

  SavedSearch.prototype.isExecutionDone = function(resultsBlock) {
    if(!resultsBlock) { return true }
    allResultsFound = resultsBlock.length != 1000;
    batchSizeMet    = this.results.length >= this.batchSize;
    return allResultsFound || batchSizeMet;
  }

  SavedSearch.prototype.reply = function() {
    return this.common.formatReply(this.getParams(), this.results);
  }

  return SavedSearch;

})();

var postHandler = function(request) {
  var savedSearch = new SavedSearch(request['record_type'], request['search_id'],
                                    request['lower_bound'], request['batch_size']);
  savedSearch.executeSearch();
  return savedSearch.reply();
}
