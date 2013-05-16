require('./spec_helper.js');

describe("SavedSearch", function() {

  var savedSearch;
  var recordType = 'inventoryitem';
  var searchId   = '12345';
  var lowerBound = '1000';
  var batchSize  = '2000';

  var searchFilter = jasmine.createSpyObj('searchFilter', ['lowerBound']);
  var searchColumn = jasmine.createSpyObj('searchColumn', ['setSort']);

  beforeEach(function() {
    spyOn(NetsuiteToolkit, 'searchColumn').andReturn(searchColumn);
    spyOn(NetsuiteToolkit, 'searchFilter').andReturn(searchFilter);
    savedSearch = new SavedSearch(recordType, searchId, lowerBound, batchSize);
  });

  describe('#init(recordType, searchId, lowerBound, batchSize)', function() {

    beforeEach(function() {
      spyOn(SavedSearch.prototype, 'createSearchFilter');
      spyOn(SavedSearch.prototype, 'createSearchColumn');
      this.newSavedSearch = new SavedSearch(recordType, searchId, lowerBound, batchSize);
    });
    
    it("should set the record type", function() {
      expect(this.newSavedSearch.recordType).toEqual(recordType);
    });

    it("should set the search id", function() {
      expect(this.newSavedSearch.searchId).toEqual(searchId);
    });

    it("should set the lower bound", function() {
      expect(this.newSavedSearch.lowerBound).toEqual(lowerBound);
    });

    it("should set the original lower bound", function() {
      expect(this.newSavedSearch.originalLowerBound).toEqual(lowerBound);
    });

    it("should set the original batch size", function() {
      expect(this.newSavedSearch.originalBatchSize).toEqual(batchSize);
    });

    it("should set the batch size to an integer", function() {
      expect(this.newSavedSearch.batchSize).toEqual(parseInt(batchSize));
    });

    it("should set the search filters to an empty list", function() {
      expect(this.newSavedSearch.searchFilters).toEqual([]);
    });

    it("should set the search columns to an empty list", function() {
      expect(this.newSavedSearch.searchColumns).toEqual([]);
    });

    it("should set the results to an empty list", function() {
      expect(this.newSavedSearch.results).toEqual([]);
    });

    it("should call createSearchFilter", function() {
      expect(this.newSavedSearch.createSearchFilter).toHaveBeenCalled();
    });

    it("should call createSearchColumn", function() {
      expect(this.newSavedSearch.createSearchColumn).toHaveBeenCalled();
    });

    describe('a batch size that is not a multiple of one thousand', function() {

      beforeEach(function() {
        this.batchSize   = '1376';
        this.searchWithOffBatch = new SavedSearch(recordType, searchId, lowerBound, this.batchSize);
      });

      it("should set the batch size to the next-highest multiple of one thousand", function() {
        expect(this.searchWithOffBatch.batchSize).toEqual(2000);
      });

    });

  });

  describe('#createSearchFilter(lowerBound)', function() {

    beforeEach(function() {
      savedSearch.createSearchFilter(lowerBound);
    });

    it("should create a new search filter with the given params", function() {
      expect(NetsuiteToolkit.searchFilter).toHaveBeenCalledWith('internalidnumber', null,
                                                                'greaterthan', lowerBound);
    });

    it("should populate the search filters", function() {
      expect(savedSearch.searchFilters[0]).toEqual(searchFilter);
    });

    it("should only populate search filters with a single element", function() {
      expect(savedSearch.searchFilters.length).toEqual(1);
    });

  });

  describe('#createSearchColumn', function() {

    beforeEach(function() {
      savedSearch.createSearchColumn();
    });

    it("should create a new search column with the given params", function() {
      expect(NetsuiteToolkit.searchColumn).toHaveBeenCalledWith('internalid', null);
    });

    it("should set the sort mode on the newly created search column", function() {
      expect(savedSearch.searchColumns[0].setSort).toHaveBeenCalled();
    });

    it("should populate the search columns", function() {
      expect(savedSearch.searchColumns[0]).toEqual(searchColumn);
    });

    it("should only populate search columns with a single element", function() {
      expect(savedSearch.searchColumns.length).toEqual(1);
    });

  });

  describe('#getParams', function() {

    beforeEach(function() {
      this.params = savedSearch.getParams();
    });

    it("should populate the value for recordType", function() {
      expect(this.params['record_type']).toEqual(savedSearch.recordType);
    });

    it("should populate the value for recordId", function() {
      expect(this.params['search_id']).toEqual(savedSearch.searchId);
    });

    it("should populate the value for batchSize", function() {
      expect(this.params['batch_size']).toEqual(savedSearch.originalBatchSize);
    });

    it("should populate the value for lowerBound", function() {
      expect(this.params['lower_bound']).toEqual(savedSearch.originalLowerBound);
    });

  });

  describe('#executeSearch', function() {

    beforeEach(function() {
      spyOn(savedSearch, 'searchIteration');
    });

    describe('execution halts after #isExecutionDone returns true', function() {

      beforeEach(function() {
        spyOn(savedSearch, 'isExecutionDone').andCallFake(function() {
          if(savedSearch.isExecutionDone.callCount == 3) {
            return true;
          } else {
            return false;
          }
        });
        savedSearch.executeSearch();
      });

      it("should call searchIteration three times", function() {
        expect(savedSearch.searchIteration.callCount).toEqual(3);
      });

      it("should call isExecutionDone three times", function() {
        expect(savedSearch.isExecutionDone.callCount).toEqual(3);
      });

    });

    describe('an exception occurs', function() {

      beforeEach(function() {
        global.exception = new Error("An error occured");
        this.formattedException = NetsuiteToolkit.formatException(global.exception);
        spyOn(NetsuiteToolkit, 'formatException').andReturn(this.formattedException);
        savedSearch.searchIteration = jasmine.createSpy('zomgspy').andCallFake(function() {
          throw global.exception;
        });
        savedSearch.executeSearch();
      });

      it("should call formatException on CommonObject", function() {
        expect(NetsuiteToolkit.formatException).toHaveBeenCalledWith(global.exception);
      });

      it("should set results to the formatted exception", function() {
        expect(savedSearch.results).toEqual(this.formattedException);
      });

    });

  });

  describe('#searchIteration', function() {

    beforeEach(function() {
      this.resultsBlock = [{}];
      spyOn(savedSearch, 'getSearchResults').andReturn(this.resultsBlock);
      spyOn(savedSearch, 'updateBoundAndFilter');
      spyOn(savedSearch, 'appendResults');
      this.returnValue = savedSearch.searchIteration();
    });

    it("should call getSearchResults", function() {
      expect(savedSearch.getSearchResults).toHaveBeenCalled();
    });

    it("should call updateBoundAndFilter", function() {
      expect(savedSearch.updateBoundAndFilter).toHaveBeenCalledWith(this.resultsBlock);
    });

    it("should call appendResults", function() {
      expect(savedSearch.appendResults).toHaveBeenCalledWith(this.resultsBlock);
    });

    it("should return the resultsBlock", function() {
      expect(this.returnValue).toEqual(this.resultsBlock);
    });

  });

  describe('#getSearchResults', function() {

    beforeEach(function() {
      spyOn(NetsuiteToolkit, 'searchRecord');
      savedSearch.getSearchResults();
    });

    it("should call nlapiSearchRecord", function() {
      expect(NetsuiteToolkit.searchRecord).toHaveBeenCalledWith(savedSearch.recordType,
                                                                savedSearch.searchId,
                                                                savedSearch.searchFilters,
                                                                savedSearch.searchColumns);
    });

  });

  describe('#extractLowerBound(resultsBlock)', function() {

    beforeEach(function() {
      this.newLowerBound = '7890';
      this.resultRow = { getId: function() {} };
      spyOn(this.resultRow, 'getId').andReturn(this.newLowerBound);
      this.resultsBlock = ([{}, {}, {}, {}, this.resultRow]);
      this.recordId = savedSearch.extractLowerBound(this.resultsBlock);
    });
    
    it("should call getId on the resultRow", function() {
      expect(this.resultRow.getId).toHaveBeenCalled();
    });

    it("should return the lowerBound", function() {
      expect(this.newLowerBound).toEqual(this.recordId);
    });

  });

  describe('#updateBoundAndFilter(resultsBlock)', function() {

    beforeEach(function() {
      this.resultsBlock  = [{}, {}, {}, {}, {}];
      this.newLowerBound = '7890';
      spyOn(savedSearch, 'createSearchFilter');
      spyOn(savedSearch, 'extractLowerBound').andReturn(this.newLowerBound);
      savedSearch.updateBoundAndFilter(this.resultsBlock);
    });

    it("should call extractLowerBound", function() {
      expect(savedSearch.extractLowerBound).toHaveBeenCalledWith(this.resultsBlock);
    });

    it("should set the lowerBound", function() {
      expect(savedSearch.lowerBound).toEqual(this.newLowerBound);
    });

    it("should call createSearchFilter", function() {
      expect(savedSearch.createSearchFilter).toHaveBeenCalled();
    });

  });

  describe('#appendResults(resultsBlock)', function() {

    beforeEach(function() {
      savedSearch.results = [{}];
      this.resultsBlock   = [{}];
      savedSearch.appendResults(this.resultsBlock);
    });

    it("should add resultsBlock to results", function() {
      expect(savedSearch.results).toEqual([{}, {}]);
    });

  });

  describe('#isExecutionDone(resultsBlock)', function() {

    it("should be true if resultsBlock is undefined", function() {
      expect(savedSearch.isExecutionDone(null)).toEqual(true);
    });

    it("should be true if resultsBlock is less than one thousand elements", function() {
      resultsBlock = [{}, {}];
      expect(savedSearch.isExecutionDone(resultsBlock)).toEqual(true);
    });

    it("should be true if results has an element count equal to the batch size", function() {
      resultsBlock        = new Array(1000);
      savedSearch.results = new Array(savedSearch.batchSize);
      expect(savedSearch.isExecutionDone(resultsBlock)).toEqual(true);
    });

    it("should be false if resultsBlock length is 1k and results is shorter batch size", function() {
      resultsBlock = new Array(1000);
      savedSearch.results = [];
      expect(savedSearch.isExecutionDone(resultsBlock)).toEqual(false);
    });

  });

  describe('#reply', function() {

    beforeEach(function() {
      spyOn(NetsuiteToolkit, 'formatReply').andCallThrough();
      this.params  = savedSearch.getParams();
      this.value   = savedSearch.results;
      this.reply   = savedSearch.reply(this.params, this.value);
    });

    it("should call NetsuiteToolkit.formatReply", function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(this.params, this.value);
    });

    it("should return the results for formatReply", function() {
      expect(this.reply).toEqual(NetsuiteToolkit.formatReply(this.params, this.value));
    });

  });

});
