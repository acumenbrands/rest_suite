this.SavedSearch = (function() {

  function SavedSearch(recordType, searchId, lowerBound, batchSize) {
  }

  SavedSearch.prototype.createSearchFilter = function(lowerBound) {
  }

  SavedSearch.prototype.createSearchColumn = function() {
  }

  SavedSearch.prototype.getSearchResults = function() {
  }

  SavedSearch.prototype.getParams = function() {
  }

  SavedSearch.prototype.executeSearch = function() {
  }

  SavedSearch.prototype.extractLowerBound = function() {
  }

  SavedSearch.prototype.updateBoundAndFilter = function() {
  }

  SavedSearch.prototype.getSearchResults = function() {
  }

  return SavedSearch;

})();

var postHandler = function() {
  var savedSearch = new SavedSearch(recordType, searchId, lowerBound, batchSize);
  savedSearch.executeSearch();
  return savedSearch.reply();
}
