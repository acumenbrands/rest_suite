this.Searcher = (function() {

  function Searcher(recordType, batchSize, lowerBound, searchFilters, searchColumns) {
    this.SEARCH_FILTER_NAME_KEY     = 'name';
    this.SEARCH_FILTER_OPERATOR_KEY = 'operator';
    this.SEARCH_FILTER_VALUE_KEY    = 'value';
    this.SEARCH_COLUMN_NAME_KEY     = 'name';
    this.SEARCH_COLUMN_JOIN_KEY     = 'join';
    this.SEARCH_COLUMN_SORT_KEY     = 'sort';

    this.common        = new CommonObject();
    this.recordType    = recordType;
    this.rawBatchSize  = batchSize;
    this.lowerBound    = lowerBound;
    this.lowerBoundFilter = {};
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
  }

  Searcher.prototype.searchIteration = function() {
  }

  Searcher.prototype.isExecutionDone = function() {
  }

  Searcher.prototype.getSearchResults = function() {
    return nlapiSearchRecord(this.recordType, null, this.searchFilters, this.searchColumns);
  }

  Searcher.prototype.updateBoundAndFilter = function(resultsBlock) {
  }

  Searcher.prototype.extractLowerBound = function(resultsBlock) {
  }

  Searcher.prototype.appendResults = function(resultsBlock) {
    this.results = this.results.concat(resultsBlock);
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
    this.common.formatReply(this.getParams(), this.results);
  }

  return Searcher;

})();

var postHandler = function() {
  var searcher = new Searcher(request['recordType'], request['batchSize'], request['lowerBound'],
                              request['searchFilters'], request['searchColumns']);
  searcher.executeSearch();
  return searcher.reply();
}
