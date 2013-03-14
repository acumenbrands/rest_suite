this.Searcher = (function() {

  function Searcher(recordType, batchSize, lowerBound, searchFilters, searchColumns) {
    this.SEARCH_FILTER_NAME_KEY     = 'name';
    this.SEARCH_FILTER_OPERATOR_KEY = 'operator';
    this.SEARCH_FILTER_VALUE_KEY    = 'value';
    this.SEARCH_COLUMN_NAME_KEY     = 'name';
    this.SEARCH_COLUMN_JOIN_KEY     = 'join';
    this.SEARCH_COLUMN_SORT_KEY     = 'sort';

    this.common             = new CommonObject();
    this.recordType         = recordType;
    this.originalBatchSize  = batchSize;
    this.originalLowerBound = lowerBound;
    this.lowerBound         = lowerBound;
    this.lowerBoundFilter   = {};
    this.rawSearchFilters   = searchFilters;
    this.rawSearchColumns   = searchColumns;
    this.searchFilters      = [];
    this.searchColumns      = [];
    this.results            = [];

    intBatchSize = parseInt(this.originalBatchSize);
    if((intBatchSize % 1000) != 0) {
      intBatchSize = intBatchSize + (1000 - (intBatchSize % 1000));
    }
    this.batchSize = intBatchSize;

    this.createSearchFilters();
    this.createSearchColumns();
  }

  Searcher.prototype.createSearchFilters = function() {
    for(index in this.rawSearchFilters) {
      searchFilterData   = this.rawSearchFilters[index];
      searchFilterObject = this.getSearchFilterObject(searchFilterData);
      this.searchFilters.push(searchFilterObject);
    }
    this.generateLowerBoundFilter();
  }

  Searcher.prototype.generateLowerBoundFilter = function() {
    searchFilterData = {};
    searchFilterData[this.SEARCH_FILTER_NAME_KEY]     = 'id';
    searchFilterData[this.SEARCH_FILTER_OPERATOR_KEY] = 'greaterthan';
    searchFilterData[this.SEARCH_FILTER_VALUE_KEY]    = this.lowerBound;

    lowerBoundFilterObject = this.getSearchFilterObject(searchFilterData)
    this.lowerBoundFilter = lowerBoundFilterObject;

    filterIndex = this.locateSearchFilterIndex();
    if(filterIndex == -1) {
      this.searchFilters.push(lowerBoundFilterObject);
    } else {
      this.searchFilters[filterIndex] = lowerBoundFilterObject;
    }
  }

  Searcher.prototype.locateSearchFilterIndex = function(searchFilter) { 
    return this.searchFilters.indexOf(searchFilter);
  }

  Searcher.prototype.getSearchFilterObject = function(searchFilterData) {
    name     = searchFilterData[this.SEARCH_FILTER_NAME_KEY];
    operator = searchFilterData[this.SEARCH_FILTER_OPERATOR_KEY];
    value    = searchFilterData[this.SEARCH_FILTER_VALUE_KEY];
    return nlobjSearchFilter(name, null, operator, value);
  }

  Searcher.prototype.createSearchColumns = function() {
    for(index in this.rawSearchColumns) {
      searchColumnData   = this.rawSearchColumns[index];
      searchColumnObject = this.getSearchColumnObject(searchColumnData);
      if(searchColumnData.hasOwnProperty(this.SEARCH_COLUMN_SORT_KEY)) {
        this.setSortColumn(searchColumnObject);
      }
      this.searchColumns.push(searchColumnObject);
    }
  }

  Searcher.prototype.getSearchColumnObject = function(searchColumnData) {
    name = searchColumnData[this.SEARCH_COLUMN_NAME_KEY];
    join = searchColumnData[this.SEARCH_COLUMN_JOIN_KEY];
    return nlobjSearchColumn(name, join);
  }

  Searcher.prototype.setSortColumn = function(sortColumnObject) {
    sortColumnObject.setSort();
  }

  Searcher.prototype.executeSearch = function() {
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

  Searcher.prototype.searchIteration = function() {
    resultsBlock = this.getSearchResults();
    this.updateBoundAndFilter(resultsBlock);
    this.appendResults(resultsBlock);
    return resultsBlock;
  }

  Searcher.prototype.isExecutionDone = function(resultsBlock) {
    if(!resultsBlock) { return true }
    allResultsFound = resultsBlock.length != 1000;
    batchSizeMet    = this.results.length >= this.batchSize;
    return allResultsFound || batchSizeMet;
  }

  Searcher.prototype.getSearchResults = function() {
    return nlapiSearchRecord(this.recordType, null, this.searchFilters, this.searchColumns);
  }

  Searcher.prototype.updateBoundAndFilter = function(resultsBlock) {
    newLowerBound   = this.extractLowerBound(resultsBlock);
    this.lowerBound = newLowerBound;
    this.generateLowerBoundFilter();
  }

  Searcher.prototype.extractLowerBound = function(resultsBlock) {
    resultRow = resultsBlock[resultsBlock.length - 1];
    return resultRow.getId();
  }

  Searcher.prototype.appendResults = function(resultsBlock) {
    this.results = this.results.concat(resultsBlock);
  }

  Searcher.prototype.getParams = function() {
    params = {};
    params['recordType']    = this.recordType;
    params['batchSize']     = this.originalBatchSize;
    params['lowerBound']    = this.originalLowerBound;
    params['searchFilters'] = this.rawSearchFilters;
    params['searchColumns'] = this.rawSearchColumns;
    return params;
  }

  Searcher.prototype.reply = function() {
    this.common.formatReply(this.getParams(), this.results);
  }

  return Searcher;

})();

var postHandler = function(request) {
  var searcher = new Searcher(request['recordType'], request['batchSize'], request['lowerBound'],
                              request['searchFilters'], request['searchColumns']);
  searcher.executeSearch();
  return searcher.reply();
}
