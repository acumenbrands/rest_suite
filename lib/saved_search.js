/**
 * SavedSearch Class
 * @class SavedSearch
 * @param {string} searchId   The string representing the search id
 * @param {string} recordType The string representing the record type
 * @param {string} lowerBound The string representing the lower bound id
 * @param {string} batchSize  The string representing the batch size
 * @return {Upserter} A new instance of SavedSearch
 */
this.SavedSearch = (function() {

  /** @constructor */
  function SavedSearch(recordType, searchId, lowerBound, batchSize) {
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

  /**
   * Generates a new nlobjSearchFilter instance and adds it to the
   * list of search filters
   *
   * @method
   * @memberof SavedSearch
   * @return {null}
   */
  SavedSearch.prototype.createSearchFilter = function() {
    this.searchFilters = []
    filter = NetsuiteToolkit.searchFilter('internalidnumber', null,
                                          'greaterthan', this.lowerBound);
    this.searchFilters.push(filter);
  }

  /**
   * Generates a new nlobjSearchColumn instance and adds it to the
   * list of search columns
   *
   * @method
   * @memberof SavedSearch
   * @return {null}
   */
  SavedSearch.prototype.createSearchColumn = function() {
    this.searchColumns = [];
    column = NetsuiteToolkit.searchColumn('internalid', null);
    column.setSort();
    this.searchColumns.push(column);
  }

  /**
   * Generates aan object containind the search params from the client
   *
   * @method
   * @memberof SavedSearch
   * @return {object} The object representing the request parameters from the client
   */
  SavedSearch.prototype.getParams = function() {
    return {
      'record_type': this.recordType,
      'search_id':   this.searchId,
      'batch_size':  this.originalBatchSize,
      'lower_bound': this.originalLowerBound
    }
  }

  /**
   * Procedural method that orchestrates the execution of the search
   *
   * @method
   * @memberof SavedSearch
   * @return {null}
   */
  SavedSearch.prototype.executeSearch = function() {
    while(true) {
      try {
        resultsBlock = this.searchIteration();
        if(this.isExecutionDone(resultsBlock)) { break; }
      } catch(exception) {
        this.results = NetsuiteToolkit.formatException(exception);
        break;
      }
    }
  }

  /**
   * Performs a single iteration of the search loop, updating the context
   * and accumulating results returned from the search
   *
   * @method
   * @memberof SavedSearch
   * @return {Array} The Array containing the search result objects
   */
  SavedSearch.prototype.searchIteration = function() {
    resultsBlock = this.getSearchResults();
    this.updateBoundAndFilter(resultsBlock);
    this.appendResults(resultsBlock);
    return resultsBlock;
  }

  /**
   * Request search results from NetSuite using the given context
   *
   * @method
   * @memberof SavedSearch
   * @return {Array} The Array containing the search result objects
   */
  SavedSearch.prototype.getSearchResults = function() {
    return NetsuiteToolkit.searchRecord(this.recordType, this.searchId,
                                        this.searchFilters, this.searchColumns);
  }

  /**
   * Update the context for the next iteration of the search using
   * the given results block fetched from NetSuite
   *
   * @method
   * @memberof SavedSearch
   * @return {null}
   */
  SavedSearch.prototype.updateBoundAndFilter = function(resultsBlock) {
    newLowerBound = this.extractLowerBound(resultsBlock);
    this.lowerBound = newLowerBound;
    this.createSearchFilter();
  }

  /**
   * Update the context for the next iteration of the search using
   * the given results block fetched from NetSuite
   *
   * @method
   * @memberof SavedSearch
   * @return {null}
   */
  SavedSearch.prototype.extractLowerBound = function(resultsBlock) {
    resultRow = resultsBlock[resultsBlock.length - 1];
    return resultRow.getId();
  }

  /**
   * Accumulates the given results block onto the result list
   *
   * @method
   * @memberof SavedSearch
   * @return {null}
   */
  SavedSearch.prototype.appendResults = function(resultsBlock) {
    this.results = this.results.concat(resultsBlock);
  }

  /**
   * Determines if another iteration of searching is required based on
   * the count of accumulated results versus the batch size or a check
   * to determine if Netsuite has reached the end of the requested
   * dataset
   *
   * @method
   * @memberof SavedSearch
   * @return {boolean} The boolean representing successful completion
   */
  SavedSearch.prototype.isExecutionDone = function(resultsBlock) {
    if(!resultsBlock) { return true }
    allResultsFound = resultsBlock.length != 1000;
    batchSizeMet    = this.results.length >= this.batchSize;
    return allResultsFound || batchSizeMet;
  }

  /**
   * Generates a formatted reply containing the results of the search
   *
   * @method
   * @memberof SavedSearch
   * @return {object} The object representing the formatted reply
   */
  SavedSearch.prototype.reply = function() {
    return NetsuiteToolkit.formatReply(this.getParams(), this.results);
  }

  return SavedSearch;

})();

/** @namespace global */

/**
 * The script function that Netsuite will call to execute the SavedSearch process
 * 
 * @method
 * @param {object} request The object representing the HTTP request body
 * @memberof global
 * @return {object} The formatted results of the request
 */
var savedSearchPostHandler = function(request) {
  var savedSearch = new SavedSearch(request['record_type'], request['search_id'],
                                    request['lower_bound'], request['batch_size']);
  savedSearch.executeSearch();
  return savedSearch.reply();
}
