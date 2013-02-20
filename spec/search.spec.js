require('./spec_helper.js');

describe("Searcher", function() {

  var searcher;
  var recordType    = 'inventoryitem';
  var batchSize     = '5000';
  var lowerBound    = '17384';
  var searchFilters = {};
  var searchColumns = {};

  beforeEach(function() {
    searcher = new Searcher(recordType, batchSize, lowerBound, searchFilters, searchColumns);
  });

  describe('#init(recordType, batchSize, lowerBound, searchFilters, searchColumns', function() {

    beforeEach(function() {
      spyOn(Searcher.prototype, 'createFilters');
      spyOn(Searcher.prototype, 'createColumns');
      this.newSearcher = new Searcher(recordType, batchSize, lowerBound,
                                      searchFilters, searchColumns);
    });

    it("should set the common object", function() {
      expect(this.newSearcher.common).toEqual(new CommonObject());
    });

    it("should set the recordType", function() {
      expect(this.newSearcher.recordType).toEqual(recordType);
    });

    it("should set the rawBatchSize", function() {
      expect(this.newSearcher.rawBatchSize).toEqual(batchSize);
    });

    it("should set the batchSize to an integer", function() {
      expect(this.newSearcher.batchSize).toEqual(parseInt(intBatchSize));
    });

    it("should set the lowerBound to an integer", function() {
      expect(this.newSearcher.lowerBound).toEqual(lowerBound);
    });

    it("should set the rawSearchFilters", function() {
      expect(this.newSearcher.rawSearchFilters).toEqual(searchFilters);
    });

    it("should set the searchFilters to an empty list", function() {
      expect(this.newSearcher.searchFilters).toEqual([]);
    });

    it("should set the rawSearchColumns", function() {
      expect(this.newSearcher.rawSearchColumns).toEqual(searchColumns);
    });

    it("should set the searchColumns to an empty list", function() {
      expect(this.newSearcher.searchColumns).toEqual([]);
    });

    it("should set the results to an empty list", function() {
      expect(this.newSearcher.results).toEqual([]);
    });

    it("should call createFilters", function() {
      expect(this.newSearcher.createFilters).toHaveBeenCalled();
    });

    it("should call createColumns", function() {
      expect(this.newSearcher.createColumns).toHaveBeenCalled();
    });

    describe('a batch size that is not a multiple of one thousand is given', function() {

      beforeEach(function() {
        this.batchSize = '4323';
        this.newSearcher = new Searcher(recordType, this.batchSize, lowerBound,
                                        searchFilters, searchColumns);
      });

      it("should round the batchSize up to the next multiple of one thousand", function() {
        expect(this.newSearcher.batchSize).toEqual(5000);
      });

    });

  });

  describe('#createFilters', function() {
  });

  describe('#getSearchFilterObject', function() {
  });

  describe('#createColumns', function() {
  });

  describe('#getSearchColumnObject', function() {
  });

  describe('#setSortColumn', function() {
  });

  describe('#executeSearch', function() {
  });

  describe('#searchIteration', function() {
  });

  describe('#isExecutionDone', function() {
  });

  describe('#getSearchResults', function() {
  });

  describe('#updateBoundAndFilter(resultsBlock)', function() {
  });

  describe('#extractLowerBound(resultsBlock)', function() {
  });

  describe('#appendResults(resultsBlock)', function() {
  });

  describe('#getParams', function() {
  });

  describe('#reply', function() {
  });

});
