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
    this.replyList          = [];

    intBatchSize = parseInt(this.originalBatchSize);
    if((intBatchSize % 1000) != 0) {
      intBatchSize = intBatchSize + (1000 - (intBatchSize % 1000));
    }
    this.batchSize = intBatchSize;

    this.createSearchFilters();
    this.generateLowerBoundFilter();
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
    searchFilterData[this.SEARCH_FILTER_NAME_KEY]     = 'internalidnumber';
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
    filter = new nlobjSearchFilter(name, null, operator, value);
    return filter;
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
    column = new nlobjSearchColumn(name, join);
    return column;
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
        formattedException = this.common.formatException(exception);
        this.results = formattedException;
        this.replyList.push(formattedException);
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
    this.replyList.push(this.common.formatReply(this.getParams(), resultsBlock));
  }

  Searcher.prototype.getParams = function() {
    params = {};
    params['record_type']    = this.recordType;
    params['batch_size']     = this.originalBatchSize;
    params['lower_bound']    = this.originalLowerBound;
    params['search_filters'] = this.rawSearchFilters;
    params['search_columns'] = this.rawSearchColumns;
    return params;
  }

  Searcher.prototype.reply = function() {
    return this.replyList;
  }

  return Searcher;

})();

var postHandler = function(request) {
  var searcher = new Searcher(request['record_type'], request['batch_size'], request['lower_bound'],
                              request['search_filters'], request['search_columns']);
  searcher.executeSearch();
  return searcher.reply();
}
