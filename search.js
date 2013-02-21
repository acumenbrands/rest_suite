this.Searcher = (function() {

  function Searcher(recordType, batchSize, lowerBound, searchFilters, searchColumns) {
    this.common        = new CommonObject();
    this.recordType    = recordType;
    this.rawBatchSize  = batchSize;
    this.lowerBound    = lowerBound;
    this.rawSearchFilters = searchFilters;
    this.rawSearchColumns = searchColumns;
    this.searchFilters = [];
    this.searchColumns = [];
    this.results       = [];

    intBatchSize = parseInt(this.rawBatchSize);
    if((intBatchSize % 1000) != 0) {
      intBatchSize = intBatchSize + (1000 - (intBatchSize % 1000));
    }
    this.batchSize = intBatchSize;

    this.createFilters();
    this.createColumns();
  }

  Searcher.prototype.createFilters = function() {
  }

  Searcher.prototype.getSearchFilterObject = function() {
  }

  Searcher.prototype.createColumns = function() {
  }

  Searcher.prototype.getSearchColumnObject = function() {
  }

  Searcher.prototype.setSortColumn = function() {
  }

  Searcher.prototype.executeSearch = function() {
  }

  Searcher.prototype.searchIteration = function() {
  }

  Searcher.prototype.isExecutionDone = function() {
  }

  Searcher.prototype.getSearchResults = function() {
  }

  Searcher.prototype.updateBoundAndFilter = function(resultsBlock) {
  }

  Searcher.prototype.extractLowerBound = function(resultsBlock) {
  }

  Searcher.prototype.appendResults = function(resultsBlock) {
  }

  Searcher.prototype.getParams = function() {
    params = {};
    params['recordType']    = this.recordType;
    params['batchSize']     = this.rawBatchSize;
    params['lowerBound']    = this.lowerBound;
    params['searchFilters'] = this.rawSearchFilters;
    params['searchColumns'] = this.rawSearchColumns;
    return params;
  }

  Searcher.prototype.reply = function() {
  }

  return Searcher;

})();

var postHandler = function() {
  var searcher = new Searcher(request['recordType'], request['batchSize'], request['lowerBound'],
                              request['searchFilters'], request['searchColumns']);
  searcher.executeSearch();
  return searcher.reply();
}
