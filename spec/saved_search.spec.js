require('./spec_helper.js');

describe("SavedSearch", function() {

  var savedSearch;
  var recordType = 'inventoryitem';
  var searchId   = '12345';
  var lowerBound = '1000';
  var batchSize  = '10000';

  var searchFilter = jasmine.createSpyObj('nlobjSearchFilter', ['foo']);
  var searchColumn = jasmine.createSpyObj('nlobjSearchColumn', ['setSort']);

  beforeEach(function() {
    savedSearch = new SavedSearch(recordType, searchId, lowerBound, batchSize);
    global.nlapiSearchRecord = function() {};
    spyOn(global, 'nlapiSearchRecord').andReturn(new Array(1000));
    global.nlapiSearchFilter = function() {};
    spyOn(global, 'nlapiSearchFilter').andReturn(searchFilter);
    global.nlapiSearchColumn = function() {};
    spyOn(global, 'nlapiSearchColumn').andReturn(searchcolumn);
  });

  describe('#init(recordType, searchId, lowerBound, batchSize)', function() {

    beforeEach(function() {
      spyOn(savedSearch, 'createSearchFilter');
      spyOn(savedSearch, 'createSearchColumn');
    });
    
    it("should set the record type", function() {
      expect(savedSearch.recordType).toEqual(recordType);
    });

    it("should set the search id", function() {
      expect(savedSearch.searchId).toEqual(searchId);
    });

    it("should call createSearchFilter", function() {
      expect(savedSearch.createSearchFilter).toHaveBeenCalledWith(savedSearch.lowerBound);
    });

    it("should populate the search filters", function() {
      expect(savedSearch.searchFilters[0] instanceof nlobjSearchFilter).toEqual(true);
    });

    it("should create a new search column", function() {
      expect(savedSearch.createSearchColumn).toHaveBeenCalled();
    });

    it("should set the sort mode on the newly created search column", function() {
      expect(savedSearch.searchColumns[0].setSort).toHaveBeenCalled();
    });

    it("should populate the search columns", function() {
      expect(savedSearch.searchColumns[0] instanceof nlobjSearchColumn).toEqual(true);
    });

    it("should set the lower bound", function() {
      expect(savedSearch.lowerBound).toEqual(lowerBound);
    });

    it("should set the batch size", function() {
      expect(savedSearch.batchSize).toEqual(batchSize);
    });

    it("should set the results to an empty list", function() {
      expect(savedSearch.results).toEqual([]);
    });

    describe('a batch size that is not a multiple of one thousand', function() {

      beforeEach(function() {
        this.batchSize   = '1500';
        this.savedSearch = new SavedSearch(recordType, searchId, lowerBound, this.batchSize);
      });

      it("should set the batch size to the next-highest multiple of one thousand", function() {
        expect(this.savedSearch.batchSize).toEqual(2000);
      });

    });

  });

  describe('#createSearchFilter(lowerBound)', function() {

    beforeEach(function() {
      savedSearch.createSearchFilter(lowerBound);
    });

    it("should create a new search filter with the given params", function() {
      expect(nlobjSearchFilter.nlobjSearchFilter).toHaveBeenCalledWith('internalidnumber', null,
                                                                       'greaterthan', lowerBound);
    });

  });

  describe('#createSearchColumn', function() {

    beforeEach(function() {
      savedSearch.createSearchColumn();
    });

    it("should create a new search column with the given params", function() {
      expect(nlobjSearchcolumn.nlobjSearchColumn).toHaveBeenCalledWith('internaid', null);
    });

  });

  describe('#getSearchFilter', function() {

    beforeEach(function() {
      this.filter = savedSearch.getSearchFilter();
    });

    it("should return the first element of the search filters", function() {
      expect(this.filter).toEqual(savedSearch.searchFilters[0]);
    });

  });

  describe('#getParams', function() {

    beforeEach(function() {
      this.params = savedSearch.getParams();
    });

    it("should populate the value for recordType", function() {
      expect(this.params['recordType']).toEqual(savedSearch.recordType);
    });

    it("should populate the value for recordId", function() {
      expect(this.params['recordId']).toEqual(savedSearch.recordId);
    });

    it("should populate the value for batchSize", function() {
      expect(this.params['batchSize']).toEqual(savedSearch.batchSize);
    });

    it("should populate the value for lowerBound", function() {
      expect(this.params['lowerBound']).toEqual(savedSearch.lowerBound);
    });

  });

  describe('#executeSearch', function() {

    beforeEach(function() {
      this.loopCount = savedSearch.batchSize / 1000;
      spyOn(savedSearch, 'getSearchResults');
      spyOn(savedSearch, 'extractLowerBound');
      spyOn(savedSearch, 'updateBoundAndFilter');
      spyOn(savedSearch.common, 'formatReply');
      savedSearch.executeSearch();
    });

    it("should call getSearchResults for each 1k record slice of the batchs size", function() {
      expect(savedSearch.getSearchResults.callCount).toEqual(this.loopCount);
    });

    it("should accumulate search results", function() {
      expect(savedSearch.results).toEqual(Array(savedSearch.batchSize));
    });

    it("should call extractLowerBound for each 1k record slive of the batch size", function() {
      expect(savedSearch.extractLowerBound.callCount).toEqual(this.loopCount);
    });

    it("should call updateBoundAndFilter with the last record id fetched", function() {
      expect(savedSearch.updateBoundAndFilter.callCount).toEqual(this.loopCount);
    });

    it("should call formatReply on CommobObject", function() {
      expect(savedSearch.common.formatReply).toHaveBeenCalledWith(savedSearch.getParams(),
                                                                  savedSearch.results)
    });

  });

  describe('#extractLowerBound(resultRow)', function() {
    
    it("should call getId on the resultRow", function() {
      expect(this.resultRow.getId).toHaveBeenCalled();
    });

    it("should return the lowerBound", function() {
      expect(this.bound).toEqual(this.recordId);
    });

  });

  describe('#updateBoundAndFilter(newLowerBound)', function() {

    beforeEach(function() {
      this.newLowerBound = '12345678';
      savedSearch.updateBoundAndFilter(this.newLowerBound);
    });

    it("should set the lowerBound", function() {
      expect(savedSearch.lowerBound).toEqual(this.newLowerBound);
    });

    it("should create a new search filter with the new lower bound", function() {
      expect(nlobjSearchFilter.nlobjSearchFilter).toHaveBeenCalledWith('internalidnumber', null,
                                                                       'greaterthan',
                                                                       this.newLowerBound);
    });

    it("should populate the search filters", function() {
      expect(savedSearch.searchFilters[0] instanceof nlobjSearchFilter).toEqual(true);
    });

  });

  describe('#getSearchResults', function() {

    beforeEach(function() {
      savedSearch.getSearchResults();
    });

    it("should call nlapiSearchRecord", function() {
      expect(global.nlapiSearchRecord).toHaveBeenCalledWith(savedSearch.recordType,
                                                            savedSearch.searchId,
                                                            savedSearch.searchFilters,
                                                            savedSearch.searchColumns);
    });

  });

});
