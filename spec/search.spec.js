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

    it("should set the originalBatchSize", function() {
      expect(this.newSearcher.originalBatchSize).toEqual(batchSize);
    });

    it("should set the originalLowerBound", function() {
      expect(this.newSearcher.originalLowerBound).toEqual(lowerBound);
    });

    it("should set the batchSize to an integer", function() {
      expect(this.newSearcher.batchSize).toEqual(parseInt(intBatchSize));
    });

    it("should set the lowerBound to an integer", function() {
      expect(this.newSearcher.lowerBound).toEqual(lowerBound);
    });

    it("should set the lowerBoundFilter to an empty object", function() {
      expect(this.newSearcher.lowerBoundFilter).toEqual({});
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
      spyOn(searcher, 'generateLowerBoundFilter');
      searcher.createSearchFilters();
    });

    it("should call getSearchFilterObject for each search filter", function() {
      expect(searcher.getSearchFilterObject.callCount).toEqual(2);
    });

    it("should append the filter objects to searchFilters", function() {
      expect(searcher.searchFilters).toEqual(this.mockFilterObjects);
    });

    it("should call generateLowerBoundFilter", function() {
      expect(searcher.generateLowerBoundFilter).toHaveBeenCalled();
    });

  });

  describe('#generateLowerBoundFilter', function() {

    beforeEach(function() {
      this.searchFilterData = {};
      this.searchFilterData[searcher.SEARCH_FILTER_NAME_KEY]     = 'id';
      this.searchFilterData[searcher.SEARCH_FILTER_OPERATOR_KEY] = 'greaterthan';
      this.searchFilterData[searcher.SEARCH_FILTER_VALUE_KEY]    = searcher.lowerBound;
      searcher.lowerBound = lowerBound;
      spyOn(searcher, 'getSearchFilterObject').andReturn(netsuiteSearchFilterObject);
    });

    describe('no lower bound filter exists', function() {

      beforeEach(function() {
        searcher.searchFilters = [];
        spyOn(searcher, 'locateSearchFilterIndex').andReturn(-1);
        searcher.generateLowerBoundFilter();
      });
      
      it("should call getSearchFilterObject with the current lowerBound", function() {
        expect(searcher.getSearchFilterObject).toHaveBeenCalledWith(this.searchFilterData);
      });

      it("should set the lowerBoundFilter field", function() {
        expect(searcher.lowerBoundFilter).toEqual(netsuiteSearchFilterObject);
      });

      it("should append the lowerBound filter to the searchFilters", function() {
        expect(searcher.searchFilters).toEqual([netsuiteSearchFilterObject]);
      });

    });

    describe('a lower bound filter already exists', function() {

      beforeEach(function() {
        searcher.searchFilters = ([netsuiteSearchFilterObject]);
        searcher.lowerBoundFilter = null;
        spyOn(searcher, 'locateSearchFilterIndex').andReturn(0);
        searcher.generateLowerBoundFilter();
      });

      it("should set the lowerBoundFilter field", function() {
        expect(searcher.lowerBoundFilter).toEqual(netsuiteSearchFilterObject);
      });

      it("should not add extra filters to the searchFilters field", function() {
        expect(searcher.searchFilters).toEqual([netsuiteSearchFilterObject]);
      });

    });

  });

  describe('#locateSearchFilterIndex', function() {

    beforeEach(function() {
      this.filter = netsuiteSearchFilterObject;
    });

    describe("a matching filter exists", function() {

      beforeEach(function() {
        searcher.searchFilters = [{}, this.filter];
      });

      it("should return the index of the filter", function() {
        expect(searcher.locateSearchFilterIndex(this.filter)).toEqual(1);
      });

    });

    describe("no matching filter exists", function() {

      beforeEach(function() {
        searcher.searchFilters = [];
      });

      it("should return -1", function() {
        expect(searcher.locateSearchFilterIndex(this.filter)).toEqual(-1);
      });

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
      this.name = this.searchColumnData[searcher.SEARCH_COLUMN_NAME_KEY];
      this.join = this.searchColumnData[searcher.SEARCH_COLUMN_JOIN_KEY];
      searcher.getSearchColumnObject(this.searchColumnData);
    });

    it("should call nlobjSearchColumn", function() {
      expect(global.nlobjSearchColumn).toHaveBeenCalledWith(this.name, this.join);
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

    beforeEach(function() {
      this.resultsBlock = [{}];
      spyOn(searcher, 'getSearchResults').andReturn(this.resultsBlock);
      spyOn(searcher, 'updateBoundAndFilter');
      spyOn(searcher, 'appendResults');
      this.returnValue = searcher.searchIteration();
    });

    it("should call getSearchResults", function() {
      expect(searcher.getSearchResults).toHaveBeenCalled();
    });

    it("should call updateBoundAndFilter", function() {
      expect(searcher.updateBoundAndFilter).toHaveBeenCalledWith(this.resultsBlock);
    });

    it("should call appendResults", function() {
      expect(searcher.appendResults).toHaveBeenCalledWith(this.resultsBlock);
    });

    it("should return the resultsBlock", function() {
      expect(this.returnValue).toEqual(this.resultsBlock);
    });

  });

  describe('#isExecutionDone(resultsBlock)', function() {

    it("should be true if resultsBlock is undefined", function() {
      expect(searcher.isExecutionDone(null)).toEqual(true);
    });

    it("should be true if resultsBlock is less than one thousand elements", function() {
      resultsBlock = [{}, {}];
      expect(searcher.isExecutionDone(resultsBlock)).toEqual(true);
    });

    it("should be true if results has an element count equal to the batch size", function() {
      resultsBlock     = new Array(1000);
      searcher.results = new Array(searcher.batchSize);
      expect(searcher.isExecutionDone(resultsBlock)).toEqual(true);
    });

    it("should be false if resultsBlock length is 1k and results is shorter batch size", function() {
      resultsBlock = new Array(1000);
      searcher.results = [];
      expect(searcher.isExecutionDone(resultsBlock)).toEqual(false);
    });

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

    beforeEach(function() {
      this.resultsBlock  = [{}, {}, {}];
      this.newLowerBound = '12345';
      spyOn(searcher, 'extractLowerBound').andReturn(this.newLowerBound);
      spyOn(searcher, 'generateLowerBoundFilter');
      searcher.updateBoundAndFilter(this.resultsBlock);
    });

    it("should call extractLowerBound", function() {
      expect(searcher.extractLowerBound).toHaveBeenCalledWith(this.resultsBlock);
    });

    it("should set the lowerBound", function() {
      expect(searcher.lowerBound).toEqual(this.newLowerBound);
    });

    it("should call generateLowerBoundFilter", function() {
      expect(searcher.generateLowerBoundFilter).toHaveBeenCalled();
    });

  });

  describe('#extractLowerBound(resultsBlock)', function() {

    beforeEach(function() {
      this.newLowerBound = '7890';
      this.resultRow = { getId: function() {} };
      spyOn(this.resultRow, 'getId').andReturn(this.newLowerBound);
      this.resultsBlock = ([{}, {}, {}, {}, this.resultRow]);
      this.recordId = searcher.extractLowerBound(this.resultsBlock);
    });
    
    it("should call getId on the resultRow", function() {
      expect(this.resultRow.getId).toHaveBeenCalled();
    });

    it("should return the lowerBound", function() {
      expect(this.newLowerBound).toEqual(this.recordId);
    });

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
