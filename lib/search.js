/**
 * Searcher Class
 * @class Searcher
 * @param {string} recordType    The string representing the record type
 * @param {string} batchSize     The string representing the batch size
 * @param {string} lowerBound    The string representing the lower bound internalid
 * @param {array}  searchFilters The array containing search filter params
 * @param {array}  searchColumns The array containing search column params
 * @return {Upserter} A new instance of Searcher
 */
this.Searcher = (function() {

  /** @constructor */
  function Searcher(recordType, batchSize, lowerBound, searchFilters, searchColumns) {
    this.SEARCH_FILTER_NAME_KEY     = 'name';
    this.SEARCH_FILTER_OPERATOR_KEY = 'operator';
    this.SEARCH_FILTER_VALUE_KEY    = 'value';
    this.SEARCH_FILTER_JOIN_KEY     = 'join';
    this.SEARCH_FILTER_FORMULA_KEY  = 'formula';

    this.SEARCH_COLUMN_NAME_KEY = 'name';
    this.SEARCH_COLUMN_JOIN_KEY = 'join';
    this.SEARCH_COLUMN_SORT_KEY = 'sort';

    this.SEARCH_FORMULA_FIELD_KEY      = 'field';
    this.SEARCH_FORMULA_VALUES_KEY     = 'values';
    this.SEARCH_FORMULA_COMPARISON_KEY = 'comparison';
    this.SEARCH_FORMULA_JOIN_KEY       = 'join';

    this.recordType            = recordType;
    this.originalBatchSize     = batchSize;
    this.originalLowerBound    = lowerBound;
    this.lowerBound            = lowerBound;
    this.lowerBoundFilterIndex = 0;
    this.rawSearchFilters      = searchFilters;
    this.rawSearchColumns      = searchColumns;
    this.searchFilters         = [];
    this.searchColumns         = [];
    this.results               = [];

    intBatchSize = parseInt(this.originalBatchSize);
    if((intBatchSize % 1000) != 0) {
      intBatchSize = intBatchSize + (1000 - (intBatchSize % 1000));
    }
    this.batchSize = intBatchSize;

    this.createSearchFilters();
    this.generateLowerBoundFilter();
    this.createSearchColumns();
    this.generateSortColumn();
  }

  /**
   * Iterates over `rawSearchFilters` calling generating an nlobjSearchFilter
   * from each
   *
   * @method
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.createSearchFilters = function() {
    for(index in this.rawSearchFilters) {
      searchFilterData   = this.rawSearchFilters[index];
      searchFilterObject = this.getSearchFilterObject(searchFilterData);

      if(searchFilterData.hasOwnProperty(this.SEARCH_FILTER_FORMULA_KEY)) {
        formulaData = searchFilterData[this.SEARCH_FILTER_FORMULA_KEY];
        formula = this.generateFormula(formulaData);
        this.setFormula(searchFilterObject, formula);
      }

      this.searchFilters.push(searchFilterObject);
    }
    this.lowerBoundFilterIndex = this.searchFilters.length;
  }

  /**
   * Generates a SQL function filter from the given params
   *
   * @method
   * @param {object} formulaData The object repesenting the formula params
   * @memberof Searcher
   * @return {String} The string representing the SQL function
   */
  Searcher.prototype.generateFormula = function(formulaData) {
    field      = formulaData[this.SEARCH_FORMULA_FIELD_KEY];
    values     = formulaData[this.SEARCH_FORMULA_VALUES_KEY];
    comparison = formulaData[this.SEARCH_FORMULA_COMPARISON_KEY];
    join       = formulaData[this.SEARCH_FORMULA_JOIN_KEY];

    formula  = "CASE WHEN (";
    segments = [];
    for(index in values) {
      value = values[index];
      formulaSegment = this.buildFormulaSegment(field, comparison, value);
      segments.push(formulaSegment);
    }
    formula += segments.join(' ' + join + ' ');
    formula += ") THEN 1 ELSE 0 END";

    return formula;
  }

  /**
   * Generates a single comparison segment for a SQL formula
   *
   * @method
   * @param {string} field      The String repesenting the field
   * @param {string} comparison The String repesenting the comparison operator
   * @param {string} value      The String repesenting the value
   * @memberof Searcher
   * @return {String} The string representing the SQL function
   */
  Searcher.prototype.buildFormulaSegment = function(field, comparison, value) {
    return "{" + field + "} " + comparison + " '" + value + "'";
  }

  /**
   * Assigns a given SQL formula to a search filter
   *
   * @method
   * @param {nlobjSearchFilter} searchFilterObject An nlobjSearchFilter instance
   * @param {string}            formulaString      The String representing the SQL formula
   * @memberof Searcher
   * @return {String} The string representing the SQL function
   */
  Searcher.prototype.setFormula = function(searchFilterObject, formulaString) {
    searchFilterObject.setFormula(formulaString);
  }

  /**
   * Generates an nlobjSearchFilter to start the search at the lower bound,
   * then assigns that filter to the list of all filters
   *
   * @method
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.generateLowerBoundFilter = function() {
    searchFilterData = {};
    searchFilterData[this.SEARCH_FILTER_NAME_KEY]     = 'internalidnumber';
    searchFilterData[this.SEARCH_FILTER_OPERATOR_KEY] = 'greaterthan';
    searchFilterData[this.SEARCH_FILTER_VALUE_KEY]    = this.lowerBound;

    lowerBoundFilterObject = this.getSearchFilterObject(searchFilterData)
    this.searchFilters[this.lowerBoundFilterIndex] = lowerBoundFilterObject;
  }

  /**
   * Generates an nlobjSearchFilter with the given params
   *
   * @method
   * @param {object} searchFilterData The object representing the search filter params
   * @memberof Searcher
   * @return {nlobjSearchFilter} The generated search filter
   */
  Searcher.prototype.getSearchFilterObject = function(searchFilterData) {
    name     = searchFilterData[this.SEARCH_FILTER_NAME_KEY];
    operator = searchFilterData[this.SEARCH_FILTER_OPERATOR_KEY];
    value    = searchFilterData[this.SEARCH_FILTER_VALUE_KEY];
    join     = searchFilterData[this.SEARCH_FILTER_JOIN_KEY] || null;

    filter = NetsuiteToolkit.searchFilter(name, join, operator, value);
    return filter;
  }

  /**
   * Generates an nlobjSearchColumn for each set of params in rawSearchColumns
   * and appends the generated filters to the search column list
   *
   * @method
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.createSearchColumns = function() {
    for(index in this.rawSearchColumns) {
      searchColumnData   = this.rawSearchColumns[index];
      searchColumnObject = this.getSearchColumnObject(searchColumnData);
      this.searchColumns.push(searchColumnObject);
    }
  }

  /**
   * Generates a search column to sort by internalid and appends it to the
   * list of all search columns
   *
   * @method
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.generateSortColumn = function() {
    sortColumn = NetsuiteToolkit.searchColumn('internalid', null);
    sortColumn.setSort();
    this.searchColumns.push(sortColumn);
  }

  /**
   * Generates an nlobjSearchColumn with the given params
   *
   * @method
   * @param {object} searchColumnData The object representing the search column params
   * @memberof Searcher
   * @return {nlobjSearchColumn} The generated search column
   */
  Searcher.prototype.getSearchColumnObject = function(searchColumnData) {
    name = searchColumnData[this.SEARCH_COLUMN_NAME_KEY];
    join = searchColumnData[this.SEARCH_COLUMN_JOIN_KEY];
    column = NetsuiteToolkit.searchColumn(name, join);
    return column;
  }

  /**
   * Sets the sort mastering of the given column
   *
   * @method
   * @param {nlobjSearchcolumn} A search column
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.setSortColumn = function(sortColumnObject) {
    sortColumnObject.setSort();
  }

  /**
   * Loop to orchestrate the entire search process
   *
   * @method
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.executeSearch = function() {
    while(true) {
      try {
        done = this.searchIteration();
        if(done) { break; }
      } catch(exception) {
        formattedException = NetsuiteToolkit.formatReply(null, null, exception);
        this.results = formattedException;
        break;
      }
    }
  }

  /**
   * Requests a block of results from Netsuite, updates the context and
   * accumulates the results to the result list
   *
   * @method
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.searchIteration = function() {
    resultsBlock = this.getSearchResults();
    this.appendResults(resultsBlock);
    done = this.isExecutionDone(resultsBlock);

    if(!done) {
      this.updateBoundAndFilter(resultsBlock);
    }

    return done;
  }

  /**
   * Requests a block of results from Netsuite, updates the context and
   *
   * @method
   * @param {Array} resultsBlock The array containing a set of results from Netsuite
   * @memberof Searcher
   * @return {boolean} The boolean representing successful completion
   */
  Searcher.prototype.isExecutionDone = function(resultsBlock) {
    if(!resultsBlock) { return true }
    allResultsFound = resultsBlock.length != 1000;
    batchSizeMet    = this.results.length >= this.batchSize;
    return allResultsFound || batchSizeMet;
  }

  /**
   * Fetches a new set of results from Netsuite and accumulates them onto the result list
   *
   * @method
   * @memberof Searcher
   * @return {Array} The array of results fetched from Netsuite
   */
  Searcher.prototype.getSearchResults = function() {
    results = NetsuiteToolkit.searchRecord(this.recordType, null,
                                           this.searchFilters,
                                           this.searchColumns);
    results = [].concat(results);
    results = results.filter(function(result) { return(result != null) });
    return results;
  }

  /**
   * Updates the context of the search iteration using the given result set
   *
   * @method
   * @param {Array} resultsBlock The array containing a set of results from Netsuite
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.updateBoundAndFilter = function(resultsBlock) {
    newLowerBound   = this.extractLowerBound(resultsBlock);
    this.lowerBound = newLowerBound;
    this.generateLowerBoundFilter();
  }

  /**
   * Retrieves the list of the last record from the given result set
   *
   * @method
   * @param {Array} resultsBlock The array containing a set of results from Netsuite
   * @memberof Searcher
   * @return {Number} The number representing the id of the last-fetched record
   */
  Searcher.prototype.extractLowerBound = function(resultsBlock) {
    resultRow = resultsBlock[resultsBlock.length - 1];
    return resultRow.getId();
  }

  /**
   * Concatenates the given result set onto the result list
   *
   * @method
   * @param {Array} resultsBlock The array containing a set of results from Netsuite
   * @memberof Searcher
   * @return {null}
   */
  Searcher.prototype.appendResults = function(resultsBlock) {
    this.results = this.results.concat(resultsBlock);
  }

  /**
   * Generates a list of params given in the HTTP request
   *
   * @method
   * @memberof Searcher
   * @return {object} The object representing the params from the HTTP request
   */
  Searcher.prototype.getParams = function() {
    params = {};
    params['record_type']    = this.recordType;
    params['batch_size']     = this.originalBatchSize;
    params['lower_bound']    = this.originalLowerBound;
    params['search_filters'] = this.rawSearchFilters;
    params['search_columns'] = this.rawSearchColumns;
    return params;
  }

  /**
   * Generates a formatted reply containing the results of the search execution
   *
   * @method
   * @memberof Searcher
   * @return {object} The object representing formatted reply
   */
  Searcher.prototype.reply = function() {
    return NetsuiteToolkit.formatReply(this.getParams(), this.results);
  }

  return Searcher;

})();

/** @namespace global */

/**
 * The script function that Netsuite will call to execute the Search process
 * 
 * @method
 * @param {object} request The object representing the HTTP request body
 * @memberof global
 * @return {object} The formatted results of the request
 */
var searchPostHandler = function(request) {
  searcher = new Searcher(request['record_type'], request['batch_size'], request['lower_bound'],
                          request['search_filters'], request['search_columns']);
  searcher.executeSearch();
  return searcher.reply();
}
