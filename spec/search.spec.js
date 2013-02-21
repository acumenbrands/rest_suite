require('./spec_helper.js');

describe("Searcher", function() {

  var searcher;
  var netsuiteSearchColumnObject;
  var recordType    = 'inventoryitem';
  var batchSize     = '5000';
  var lowerBound    = '17384';
  var searchFilters = [
    {
      'name':     'displayname',
      'value':    'VENDOR-STYLE-SIZE',
      'operator': 'is'
    },
    {
      'name':     'upccode',
      'value':    ['123456789012', '098765432109'],
      'operator': 'anyof'
    }
  ];
  var searchColumns = [
    {
      'name': 'custitem22',
      'sort': 'true'
    },
    {
      'name': 'financial', // This is gibberish, but illustrative of the structure.
      'join': 'tranid'
    }
  ];

  beforeEach(function() {
    netsuiteSearchFilterObject = jasmine.createSpyObj('filter', ['foo']);
    netsuiteSearchColumnObject = jasmine.createSpyObj('column', ['setSort']);
    global.nlobjSearchFilter = function() {};
    spyOn(global, 'nlobjSearchFilter').andReturn(netsuiteSearchFilterObject);
    global.nlobjSearchColumn = function() {};
    spyOn(global, 'nlobjSearchColumn').andReturn(netsuiteSearchColumnObject);
    global.nlapiSearchRecord = function() {};
    spyOn(global, 'nlapiSearchRecord').andReturn([{}]);
    searcher   = new Searcher(recordType, batchSize, lowerBound, searchFilters, searchColumns);
    sortColumn = searchColumns[0];
  });

  describe('#init(recordType, batchSize, lowerBound, searchFilters, searchColumns', function() {

    beforeEach(function() {
      spyOn(Searcher.prototype, 'createSearchFilters');
      spyOn(Searcher.prototype, 'createSearchColumns');
      this.newSearcher = new Searcher(recordType, batchSize, lowerBound,
                                      searchFilters, searchColumns);
    });

    it("should set the SEARCH_FILTER_NAME_KEY", function() {
      expect(searcher.SEARCH_FILTER_NAME_KEY).toBeDefined();
    });

    it("should set the SEARCH_FILTER_OPERATOR_KEY", function() {
      expect(searcher.SEARCH_FILTER_OPERATOR_KEY).toBeDefined();
    });

    it("should set the SEARCH_FILTER_VALUE_KEY", function() {
      expect(searcher.SEARCH_FILTER_VALUE_KEY).toBeDefined();
    });

    it("should set the SEARCH_COLUMN_NAME_KEY", function() {
      expect(searcher.SEARCH_COLUMN_NAME_KEY).toBeDefined();
    });

    it("should set the SEARCH_COLUMN_JOIN_KEY", function() {
      expect(searcher.SEARCH_COLUMN_JOIN_KEY).toBeDefined();
    });

    it("should set the SEARCH_COLUMN_SORT_KEY", function() {
      expect(searcher.SEARCH_COLUMN_SORT_KEY).toBeDefined();
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
      expect(this.newSearcher.createSearchFilters).toHaveBeenCalled();
    });

    it("should call createColumns", function() {
      expect(this.newSearcher.createSearchColumns).toHaveBeenCalled();
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

  describe('#createSearchFilters', function() {

    beforeEach(function() {
      searcher.searchFilters = [];
      this.mockFilterObjects = [{}, {}];
      spyOn(searcher, 'getSearchFilterObject').andReturn({});
      searcher.createSearchFilters();
    });

    it("should call getSearchFilterObject for each search filter", function() {
      expect(searcher.getSearchFilterObject.callCount).toEqual(2);
    });

    it("should append the filter objects to searchFilters", function() {
      expect(searcher.searchFilters).toEqual(this.mockFilterObjects);
    });

  });

  describe('#getSearchFilterObject(searchFilterData)', function() {

    beforeEach(function() {
      this.searchFilterData = searchFilters[0];
      searcher.getSearchFilterObject(this.searchFilterData);
    });

    it("should call nlobjSearchFilter", function() {
      name     = this.searchFilterData[searcher.SEARCH_FILTER_NAME_KEY];
      operator = this.searchFilterData[searcher.SEARCH_FILTER_OPERATOR_KEY];
      value    = this.searchFilterData[searcher.SEARCH_FILTER_VALUE_KEY];
      expect(global.nlobjSearchFilter).toHaveBeenCalledWith(name, null, operator, value);
    });

  });

  describe('#createSearchColumns', function() {

    beforeEach(function() {
      searcher.searchColumns = [];
      this.mockColumnObjects = [netsuiteSearchColumnObject, netsuiteSearchColumnObject];
      spyOn(searcher, 'getSearchColumnObject').andReturn(netsuiteSearchColumnObject);
      spyOn(searcher, 'setSortColumn');
      searcher.createSearchColumns();
    });

    it("should call getSearchColumnObject for each search column", function() {
      expect(searcher.getSearchColumnObject.callCount).toEqual(2);
    });

    it("should append the filter objects to searchColumns", function() {
      expect(searcher.searchColumns).toEqual(this.mockColumnObjects);
    });

    it("should call setSortColumn for the column with sort: true", function() {
      expect(searcher.setSortColumn).toHaveBeenCalledWith(netsuiteSearchColumnObject);
    });

  });

  describe('#getSearchColumnObject(searchColumnData)', function() {

    beforeEach(function() {
      this.searchColumnData = searchColumns[1];
      searcher.getSearchColumnObject(this.searchColumnData);
    });

    it("should call nlobjSearchColumn", function() {
      name = this.searchColumnData[searcher.SEARCH_COLUMN_NAME_KEY];
      join = this.searchColumnData[searcher.SEARCH_COLUMN_JOIN_KEY];
      expect(global.nlobjSearchColumn).toHaveBeenCalledWith(name, join);
    });

  });

  describe('#setSortColumn(sortColumnObject)', function() {

    beforeEach(function() {
      sortColumn.setSort = function() {};
      spyOn(sortColumn, 'setSort');
      searcher.setSortColumn(sortColumn)
    });

    it("should call setSort() on the selected column", function() {
      expect(sortColumn.setSort).toHaveBeenCalled();
    });

  });

  describe('#executeSearch', function() {

    describe('normal operation', function() {
    });

    describe('an exception occurs', function() {
    });

  });

  describe('#searchIteration', function() {
  });

  describe('#isExecutionDone', function() {
  });

  describe('#getSearchResults', function() {

    beforeEach(function() {
      searcher.getSearchResults();
    });

    it("should call nlapiSearchRecord", function() {
      expect(global.nlapiSearchRecord).toHaveBeenCalledWith(searcher.recordType, null,
                                                            searcher.searchFilters,
                                                            searcher.searchColumns);
    });

  });

  describe('#updateBoundAndFilter(resultsBlock)', function() {
  });

  describe('#extractLowerBound(resultsBlock)', function() {
  });

  describe('#appendResults(resultsBlock)', function() {

    beforeEach(function() {
      searcher.results = [{}];
      searcher.appendResults([{}]);
    });

    it("should add the given resultsBlock to the results field", function() {
      expect(searcher.results).toEqual([{}, {}]);
    });

  });

  describe('#getParams', function() {

    beforeEach(function() {
      this.params = searcher.getParams();
    });

    it("should populate the recordType", function() {
      expect(this.params['recordType']).toEqual(recordType);
    });

    it("should populate the batchSize", function() {
      expect(this.params['batchSize']).toEqual(batchSize);
    });

    it("should populate the lowerBound", function() {
      expect(this.params['lowerBound']).toEqual(lowerBound);
    });

    it("should populate the searchFilters", function() {
      expect(this.params['searchFilters']).toEqual(searchFilters);
    });

    it("should populate the searchColumns", function() {
      expect(this.params['searchColumns']).toEqual(searchColumns);
    });

  });

  describe('#reply', function() {

    beforeEach(function() {
      spyOn(searcher.common, 'formatReply');
      this.reply = searcher.reply();
    });

    it("should call formatReply on CommonObject", function() {
      expect(searcher.common.formatReply).toHaveBeenCalledWith(searcher.getParams(),
                                                               searcher.results);
    });

  });

});
