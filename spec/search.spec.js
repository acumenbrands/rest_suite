require('./spec_helper.js');

describe("Searcher", function() {

  var searcher;
  var netsuiteSearchColumnObject;
  var recordType     = 'inventoryitem';
  var batchSize      = '5000';
  var lowerBound     = '17384';
  var search_results = [{}, {}];
  var searchFilters  = [
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
    },
    {
      'name': 'financial', // This is gibberish, but illustrative of the structure.
      'join': 'tranid'
    }
  ];

  beforeEach(function() {
    netsuiteSearchFilterObject = jasmine.createSpyObj('filter', ['setFormula']);
    netsuiteSearchColumnObject = jasmine.createSpyObj('column', ['setSort']);
    spyOn(NetsuiteToolkit, 'searchFilter').andReturn(netsuiteSearchFilterObject);
    spyOn(NetsuiteToolkit, 'searchColumn').andReturn(netsuiteSearchColumnObject);
    searcher   = new Searcher(recordType, batchSize, lowerBound, searchFilters, searchColumns);
    sortColumn = searchColumns[0];
  });

  describe('#init(recordType, batchSize, lowerBound, searchFilters, searchColumns', function() {

    beforeEach(function() {
      spyOn(Searcher.prototype, 'createSearchFilters');
      spyOn(Searcher.prototype, 'generateLowerBoundFilter');
      spyOn(Searcher.prototype, 'createSearchColumns');
      spyOn(Searcher.prototype, 'generateSortColumn');
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

    it("should set the SEARCH_FILTER_FORMULA_KEY", function() {
      expect(searcher.SEARCH_FILTER_FORMULA_KEY).toBeDefined();
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

    it("should set the SEARCH_FORMULA_FIELD_KEY", function() {
      expect(searcher.SEARCH_FORMULA_FIELD_KEY).toBeDefined();
    });

    it("should set the SEARCH_FORMULA_VALUES_KEY", function() {
      expect(searcher.SEARCH_FORMULA_VALUES_KEY).toBeDefined();
    });

    it("should set the SEARCH_FORMULA_COMPARISON_KEY", function() {
      expect(searcher.SEARCH_FORMULA_COMPARISON_KEY).toBeDefined();
    });

    it("should set the SEARCH_FORMULA_JOIN_KEY", function() {
      expect(searcher.SEARCH_FORMULA_JOIN_KEY).toBeDefined();
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

    it("should set the lowerBoundFilterIndex to 0", function() {
      expect(this.newSearcher.lowerBoundFilterIndex).toEqual(0);
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

    it("should call generateLowerBoundFilter", function() {
      expect(this.newSearcher.generateLowerBoundFilter).toHaveBeenCalled();
    });

    it("should call createColumns", function() {
      expect(this.newSearcher.createSearchColumns).toHaveBeenCalled();
    });

    it("should call generateSortColumn", function() {
      expect(this.newSearcher.generateSortColumn).toHaveBeenCalled();
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
    });

    describe('basic operation', function() {

      beforeEach(function() {
        searcher.createSearchFilters();
      });

      it("should call getSearchFilterObject for each search filter", function() {
        expect(searcher.getSearchFilterObject.callCount).toEqual(2);
      });

      it("should append the filter objects to searchFilters", function() {
        expect(searcher.searchFilters).toEqual(this.mockFilterObjects);
      });

      it("should set the lowerBoundFilterIndex to the filter count", function() {
        expect(searcher.lowerBoundFilterIndex).toEqual(searcher.searchFilters.length);
      });

    });

    describe('a formula key is present', function() {

      beforeEach(function() {
        spyOn(searcher, 'generateFormula').andReturn('foo');
        spyOn(searcher, 'setFormula');
        searcher.rawSearchFilters = [{ 'formula': {} }];
        searcher.createSearchFilters();
      });

      it("should call generateFormula", function() {
        expect(searcher.generateFormula).toHaveBeenCalledWith({});
      });

      it("should call set formula with the filter and generated formula", function() {
        expect(searcher.setFormula).toHaveBeenCalledWith({}, 'foo');
      });

    });

  });

  describe('#generateFormula(formulaData)', function() {

    beforeEach(function() {
      spyOn(searcher, 'buildFormulaSegment').andReturn('*');
      this.formulaData      = {
        'field':      'email',
        'values':     ['1', '2'],
        'comparison': 'IS',
        'join':       'OR'
      };
      this.formulaString = "CASE WHEN (* OR *) THEN 1 ELSE 0 END";
      this.generatedFormula = searcher.generateFormula(this.formulaData);
    });

    it("should call buildFormulaSegment for each value", function() {
      expect(searcher.buildFormulaSegment.callCount).toEqual(this.formulaData['values'].length);
    });

    it("should call buildFormulaSegment with the correct arguments", function() {
      expect(searcher.buildFormulaSegment.mostRecentCall.args).toEqual(['email', 'IS', '2']);
    });

    it("should produce a validly formatted search string", function() {
      expect(this.generatedFormula).toEqual(this.formulaString);
    });

  });

  describe('#buildFormulaSegment(field, comparison, value)', function() {

    beforeEach(function() {
      this.segmentString   = "{field} IS 'schwa'";
      this.generatedString = searcher.buildFormulaSegment('field', 'IS', 'schwa');
    });

    it("should produce a valid formula segment", function() {
      expect(this.generatedString).toEqual(this.segmentString);
    });

  });

  describe('#setFormula', function() {

    beforeEach(function() {
      searcher.setFormula(netsuiteSearchFilterObject, 'foo');
    });

    it("should call setFormula on the search filter object", function() {
      expect(netsuiteSearchFilterObject.setFormula).toHaveBeenCalledWith('foo');
    });

  });

  describe('#generateLowerBoundFilter', function() {

    beforeEach(function() {
      this.searchFilterData = {};
      this.searchFilterData[searcher.SEARCH_FILTER_NAME_KEY]     = 'internalidnumber';
      this.searchFilterData[searcher.SEARCH_FILTER_OPERATOR_KEY] = 'greaterthan';
      this.searchFilterData[searcher.SEARCH_FILTER_VALUE_KEY]    = searcher.lowerBound;
      searcher.lowerBoundFilterIndex = 1;
      searcher.lowerBound = lowerBound;
    });

    describe('no lower bound filter exists', function() {

      beforeEach(function() {
        searcher.searchFilters = [{}];
        spyOn(searcher, 'getSearchFilterObject').andReturn(netsuiteSearchFilterObject);
        searcher.generateLowerBoundFilter();
      });
      
      it("should call getSearchFilterObject with the current lowerBound", function() {
        expect(searcher.getSearchFilterObject).toHaveBeenCalledWith(this.searchFilterData);
      });

      it("should append the lowerBound filter to the searchFilters", function() {
        expect(searcher.searchFilters).toEqual([{}, netsuiteSearchFilterObject]);
      });

    });

    describe('a lower bound filter already exists', function() {

      beforeEach(function() {
        searcher.searchFilters = ([{}, netsuiteSearchFilterObject]);
        spyOn(searcher, 'getSearchFilterObject').andReturn({});
        searcher.generateLowerBoundFilter();
      });

      it("should not add extra filters to the searchFilters field", function() {
        expect(searcher.searchFilters).toEqual([{}, {}]);
      });

    });

  });

  describe('#getSearchFilterObject(searchFilterData)', function() {

    beforeEach(function() {
      this.searchFilterData = searchFilters[0];
      searcher.getSearchFilterObject(this.searchFilterData);
    });

    it("should call NetsuiteToolkit.searchFilter", function() {
      name     = this.searchFilterData[searcher.SEARCH_FILTER_NAME_KEY];
      operator = this.searchFilterData[searcher.SEARCH_FILTER_OPERATOR_KEY];
      value    = this.searchFilterData[searcher.SEARCH_FILTER_VALUE_KEY];
      expect(NetsuiteToolkit.searchFilter).toHaveBeenCalledWith(name, null, operator, value);
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

  });

  describe('#generateSortColumn', function() {

    beforeEach(function() {
      searcher.searchColumns = [];
      searcher.generateSortColumn();
    });

    it("should call getSearchColumnObject with the id sort data", function() {
      expect(NetsuiteToolkit.searchColumn).toHaveBeenCalledWith('internalid', null);
    });

    it("should call setSort on the search column", function() {
      expect(netsuiteSearchColumnObject.setSort).toHaveBeenCalled();
    });

    it("should append the new column to the searchColumns list", function() {
      expect(searcher.searchColumns).toEqual([netsuiteSearchColumnObject]);
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
      expect(NetsuiteToolkit.searchColumn).toHaveBeenCalledWith(this.name, this.join);
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

    describe('execution halts after #searchIteration returns true', function() {

      beforeEach(function() {
        spyOn(searcher, 'searchIteration').andCallFake(function() {
          if(searcher.searchIteration.callCount == 3) {
            return true;
          } else {
            return false;
          }
        });
        searcher.executeSearch();
      });

      it("should call searchIteration three times", function() {
        expect(searcher.searchIteration.callCount).toEqual(3);
      });

    });

    describe('an exception occurs', function() {

      beforeEach(function() {
        global.exception = new Error("An error occured");
        this.formattedException = {'exception': this.exception};
        spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.formattedException);
        spyOn(searcher, 'searchIteration').andCallFake(function() {
            throw global.exception;
        });
        searcher.executeSearch();
      });

      it("should call NetsuiteToolkit.formatReply", function() {
        expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(null, null, global.exception);
      });

      it("should set the results to the formatted exception", function() {
        expect(searcher.results).toEqual(this.formattedException);
      });

    });

  });

  describe('#searchIteration', function() {

    beforeEach(function() {
      this.resultsBlock = [{}];
      spyOn(searcher, 'getSearchResults').andReturn(this.resultsBlock);
      spyOn(searcher, 'updateBoundAndFilter');
      spyOn(searcher, 'appendResults');
    });

    describe('isExecutionDone returns false', function() {

      beforeEach(function() {
        spyOn(searcher, 'isExecutionDone').andReturn(false);
        this.returnValue = searcher.searchIteration();
      });

      it("should call getSearchResults", function() {
        expect(searcher.getSearchResults).toHaveBeenCalled();
      });

      it("should call isExecutionDone", function() {
        expect(searcher.isExecutionDone).toHaveBeenCalledWith(this.resultsBlock);
      });

      it("should call updateBoundAndFilter", function() {
        expect(searcher.updateBoundAndFilter).toHaveBeenCalledWith(this.resultsBlock);
      });

      it("should call appendResults", function() {
        expect(searcher.appendResults).toHaveBeenCalledWith(this.resultsBlock);
      });

      it("should return false", function() {
        expect(this.returnValue).toEqual(false);
      });

    });

    describe('isExecutionDone returns true', function() {

      beforeEach(function() {
        spyOn(searcher, 'isExecutionDone').andReturn(true);
        this.returnValue = searcher.searchIteration();
      });

      it("should call getSearchResults", function() {
        expect(searcher.getSearchResults).toHaveBeenCalled();
      });

      it("should call isExecutionDone", function() {
        expect(searcher.isExecutionDone).toHaveBeenCalledWith(this.resultsBlock);
      });

      it("should not call updateBoundAndFilter", function() {
        expect(searcher.updateBoundAndFilter.callCount).toEqual(0);
      });

      it("should call appendResults", function() {
        expect(searcher.appendResults).toHaveBeenCalledWith(this.resultsBlock);
      });

      it("should return false", function() {
        expect(this.returnValue).toEqual(true);
      });

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

    describe('all cases', function() {

      beforeEach(function() {
        spyOn(NetsuiteToolkit, 'searchRecord').andReturn(search_results);
        searcher.getSearchResults();
      });

      it("should call NetsuiteToolkit.searchRecord", function() {
        expect(NetsuiteToolkit.searchRecord).toHaveBeenCalledWith(searcher.recordType, null,
                                                                  searcher.searchFilters,
                                                                  searcher.searchColumns);
      });

    });

    describe('search provides an array', function() {

      beforeEach(function() {
        spyOn(NetsuiteToolkit, 'searchRecord').andReturn(search_results);
        searcher.getSearchResults();
      });

      it('should return an array of the results', function() {
        expect(searcher.getSearchResults()).toEqual(search_results);
      });

    });

    describe('search returns null', function() {

      beforeEach(function() {
        global.nlapiSearchRecord = function() {}
        spyOn(NetsuiteToolkit, 'searchRecord').andReturn(null);
        searcher.getSearchResults();
      });

      it('should return an empty array', function() {
        expect(searcher.getSearchResults()).toEqual([]);
      });

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
      expect(this.params['record_type']).toEqual(recordType);
    });

    it("should populate the batchSize", function() {
      expect(this.params['batch_size']).toEqual(batchSize);
    });

    it("should populate the lowerBound", function() {
      expect(this.params['lower_bound']).toEqual(lowerBound);
    });

    it("should populate the searchFilters", function() {
      expect(this.params['search_filters']).toEqual(searchFilters);
    });

    it("should populate the searchColumns", function() {
      expect(this.params['search_columns']).toEqual(searchColumns);
    });

  });

  describe('#reply', function() {

    beforeEach(function() {
      spyOn(NetsuiteToolkit, 'formatReply');
      searcher.reply();
    });

    it("call NetsuiteToolkit.formatReply", function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(searcher.getParams(),
                                                               searcher.results);
    });

  });

});
