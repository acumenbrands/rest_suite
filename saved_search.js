this.SavedSearch = (function() {

  function SavedSearch(recordType, searchId, lowerBound, batchSize) {
    batchSize = parseInt(batchSize);
    remainder = batchSize % 1000;
    if(remainder > 0) { batchSize = batchSize + (1000 - remainder); };

    this.common             = new CommonObject();
    this.recordType         = recordType;
    this.searchId           = searchId;
    this.lowerBound         = lowerBound;
    this.originalLowerBound = lowerBound;
    this.batchSize          = batchSize;
    this.searchFilters      = [];
    this.searchColumns      = [];
    this.results            = [];

    this.createSearchFilter();
    this.createSearchColumn();
  }

  SavedSearch.prototype.createSearchFilter = function() {
    this.searchFilters = []
    filter = nlobjSearchFilter('internalidnumber', null,
                               'greaterthan', this.lowerBound);
    this.searchFilters.push(filter);
  }

  SavedSearch.prototype.createSearchColumn = function() {
    this.searchColumns = [];
    column = nlobjSearchColumn('internalid', null);
    column.setSort();
    this.searchColumns.push(column);
  }

  SavedSearch.prototype.getParams = function() {
    return {
      'recordType': this.recordType,
      'searchId':   this.searchId,
      'batchSize':  this.batchSize,
      'lowerBound': this.originalLowerBound
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
    if(!resultsBlock) { return true; };
    allResultsFound = resultsBlock.length != 1000;
    batchSizeMet    = this.results.length >= this.batchSize;
    return allResultsFound || batchSizeMet;
  }

  SavedSearch.prototype.reply = function() {
    return this.common.formatReply(this.getParams(), this.results);
  }

  return SavedSearch;

})();

var postHandler = function() {
  var savedSearch = new SavedSearch(recordType, searchId, lowerBound, batchSize);
  savedSearch.executeSearch();
  return savedSearch.reply();
}
