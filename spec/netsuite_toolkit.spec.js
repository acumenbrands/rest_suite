require('./spec_helper.js');

describe("NetsuiteToolkit", function() {

  beforeEach(function() {
    global.nlapiInitializeRecord = function() {}
    global.nlapiLoadRecord       = function() {}
    global.nlapiDeleteRecord     = function() {}
    global.nlapiTransformRecord  = function() {}
    global.nlapiSubmitRecord     = function() {}
    global.nlapiSearchRecord     = function() {}
    global.nlobjSearchFilter     = function() {}
    global.nlobjSearchColumn     = function() {}
  });

  describe('initializeRecord()', function() {

    beforeEach(function() {
      this.fake_record = {};
      this.record_type = 'fakerecordtype';
      spyOn(global, 'nlapiInitializeRecord').andReturn(this.fake_record);
      this.init        = function() { return NetsuiteToolkit.initializeRecord(this.record_type) }
      this.result      = this.init();
    });

    it('should call nlapiInitializeRecord() with a given record_type', function() {
      expect(global.nlapiInitializeRecord).toHaveBeenCalledWith(this.record_type);
    });

    it('should return the raw results of the nlapiInitializeRecord() call', function() {
      expect(this.result).toEqual(this.fake_record);
    });

  });

  describe('loadRecord()', function() {

    beforeEach(function() {
      this.fake_record = {};
      this.record_type = 'fakerecordtype';
      this.internal_id = '12345';
      spyOn(global, 'nlapiLoadRecord').andReturn(this.fake_record);
      this.load = function() { return NetsuiteToolkit.loadRecord(this.record_type,
                                                                 this.internal_id) }
      this.result = this.load();
    });

    it('should call nlapiLoadRecord() with a given record_type and internal_id', function() {
      expect(global.nlapiLoadRecord).toHaveBeenCalledWith(this.record_type, this.internal_id);
    });

    it('should return the raw results of the nlapiLoadRecord() call', function() {
      expect(this.result).toEqual(this.fake_record);
    });

  });

  describe('deleteRecord()', function() {});

  describe('transformRecord()', function() {

    beforeEach(function() {
      this.source_type = 'salesorder';
      this.result_type = 'invoice';
      this.internalid  = '12345';
      this.values      = {'stuff': 'junk'};
      spyOn(global, 'nlapiTransformRecord');
      NetsuiteToolkit.transformRecord(this.source_type, this.internalid,
                                      this.result_type, this.values);
    });
  
    it('should call nlapiTransformRecord', function() {
      expect(global.nlapiTransformRecord).toHaveBeenCalledWith(this.source_type, this.internalid,
                                                               this.result_type, this.values);
    });

  });

  describe('submitRecord()', function() {

    beforeEach(function() {
      this.fake_id = '12345';
      this.record_type = 'fakerecordtype';
      this.fake_record = {};
      spyOn(global, 'nlapiSubmitRecord').andReturn(this.fake_id);
      this.submit = function() { return NetsuiteToolkit.submitRecord(this.fake_record) }
      this.result = this.submit();
    });

    it('should call nlapiSubmitRecord() with a given record_type and record', function() {
      expect(global.nlapiSubmitRecord).toHaveBeenCalledWith(this.fake_record, false, false);
    });

    it('should return the raw results of the nlapiSubmitRecord() call', function() {
      expect(this.result).toEqual(this.fake_id);
    });

  });

  describe('setFieldValue()', function() {

    beforeEach(function() {
      this.record = {};
      this.record.setFieldValue = function() {};
      this.field_name = 'customfieldname';
      this.value = 'foo';
      spyOn(this.record, 'setFieldValue');
      NetsuiteToolkit.setFieldValue(this.record, this.field_name, this.value);
    });

    it('should call setFieldValue on record with a given field name and value', function() {
      expect(this.record.setFieldValue).toHaveBeenCalledWith(this.field_name, this.value);
    });

  });

  describe('getLineItemCount()', function() {
    beforeEach(function() {
      this.record = {};
      this.record.getLineItemCount = function() {};
      this.sublist_name = 'fakesublist';
      this.count = 16;
      spyOn(this.record, 'getLineItemCount').andReturn(this.count);
      this.result = NetsuiteToolkit.getLineItemCount(this.record, this.sublist_name);
    });

    it('should call getLineItemCount with a given sublist name', function() {
      expect(this.record.getLineItemCount).toHaveBeenCalledWith(this.sublist_name);
    });

    it('should return the result of getLineItemCount', function() {
      expect(this.result).toEqual(this.count);
    });

  });

  describe('getLineItemValue()', function() {

    beforeEach(function() {
      this.record                  = {};
      this.record.getLineItemValue = function() {};
      this.sublist_name            = 'fakesublist';
      this.index                   = 7;
      this.field_name              = 'fakefield';
      this.fake_value              = 'schwa';
      spyOn(this.record, 'getLineItemValue').andReturn(this.fake_value);
      this.result = NetsuiteToolkit.getLineItemValue(this.record, this.sublist_name,
                                                     this.index, this.field_name);
    });

    it('should call getLineItemValue on record', function() {
      expect(this.record.getLineItemValue).toHaveBeenCalledWith(this.sublist_name, this.index,
                                                                this.field_name);
    });

    it('should return the results of getLineItemValue', function() {
      expect(this.result).toEqual(this.fake_value);
    });

  });

  describe('setLineItemValue()', function() {

    beforeEach(function() {
      this.record                  = {};
      this.record.setLineItemValue = function() {};
      this.sublist_name            = 'fakesublist';
      this.index                   = 42;
      this.field_name              = 'fakefield';
      this.value                   = 'fakevalue';
      spyOn(this.record, 'setLineItemValue');
      NetsuiteToolkit.setLineItemValue(this.record, this.sublist_name, this.index, 
                                       this.field_name, this.value);

    });

    it('should call setLineItemValue on record', function() {
      expect(this.record.setLineItemValue).toHaveBeenCalledWith(this.sublist_name, this.index, 
                                                                this.field_name, this.value);
    });

  });

  describe('insertLineItem()', function() {

    beforeEach(function() {
      this.index  = 16;
      this.field_name = 'somefield';
      this.record = {};
      this.record.insertLineItem = function() {}
      spyOn(this.record, 'insertLineItem');
      NetsuiteToolkit.insertLineItem(this.record, this.field_name, this.index);
    });

    it('should call insertLineItem on a given record', function() {
      expect(this.record.insertLineItem).toHaveBeenCalledWith(this.field_name, this.index);
    });

  });

  describe('removeLineItem()', function() {

    beforeEach(function() {
      this.record                = {};
      this.record.removeLineItem = function() {};
      this.sublist_name          = 'fakesublist';
      this.index                 = 13;
      spyOn(this.record, 'removeLineItem');
      NetsuiteToolkit.removeLineItem(this.record, this.sublist_name, this.index);
    });

    it('should call removeLineItem on record', function() {
      expect(this.record.removeLineItem).toHaveBeenCalledWith(this.sublist_name, this.index);
    });

  });

  describe('searchFilter()', function() {

    beforeEach(function() {
      this.field  = 'fieldname';
      this.join   = 'anotherrecord';
      this.value1 = 'comparison!';
      this.value2 = 'somethingelse';
      this.search_filter = {};
      spyOn(global, 'nlobjSearchFilter').andReturn(this.search_filter);
      this.result = NetsuiteToolkit.searchFilter(this.field, this.join,
                                                 this.value1, this.value2);
    });

    it('should call nlobjSearchFilter', function() {
      expect(global.nlobjSearchFilter).toHaveBeenCalledWith(this.field, this.join,
                                                           this.value1, this.value2);
    });

    it('should return the object returned by nlobjSearchFilter', function() {
      expect(this.result).toEqual(this.search_filter);
    });

  });

  describe('searchColumn()', function() {

    beforeEach(function() {
      this.name          = 'fieldname';
      this.join          = 'anotherrecord';
      this.summary       = 'This is the summary';
      this.search_column = {};
      spyOn(global, 'nlobjSearchColumn').andReturn(this.search_column);
      this.result = NetsuiteToolkit.searchColumn(this.name, this.join, this.summary);
    });

    it('should call nlobjSearchColumn', function() {
      expect(global.nlobjSearchColumn).toHaveBeenCalledWith(this.name, this.join, this.summary);
    });

    it('should return the object returned by nlobjSearchColumn', function() {
      expect(this.result).toEqual(this.search_column);
    });

  });

  describe('searchRecord()', function() {

    beforeEach(function() {
      this.record_type    = 'salesorder';
      this.search_id      = '13';
      this.search_filters = [{'filter': 'stuf'}, {'anotherfilter': 'otherstuff'}];
      this.search_columns = [{'column': 'join'}];
      this.fake_search_results = [{}, {}, {}];
      spyOn(global, 'nlapiSearchRecord').andReturn(this.fake_search_results);
      this.result = NetsuiteToolkit.searchRecord(this.record_type, this.search_id,
                                                 this.search_filters, this.search_columns);
    });

    it('should call nlapiSearchRecord', function() {
      expect(global.nlapiSearchRecord).toHaveBeenCalledWith(this.record_type, this.search_id,
                                                            this.search_filters,
                                                            this.search_columns);
    });

    it('should return the object returned by nlapiSearchRecord', function() {
      expect(this.result).toEqual(this.fake_search_results);
    });

  });

  describe('getIdFromRecord()', function() {

    beforeEach(function() {
      this.id           = '12345';
      this.record       = {};
      this.record.getId = function() {}
      spyOn(this.record, 'getId').andReturn(this.id);
      this.result = NetsuiteToolkit.getIdFromRecord(this.record);
    });

    it('should call getId() on the given record', function() {
      expect(this.record.getId).toHaveBeenCalled();
    });

    it('should return the value returned by getId()', function() {
      expect(this.result).toEqual(this.id);
    });

  });

  describe('formatReply()', function() {

    beforeEach(function() {
      this.params             = {'dosomething': 'please'};
      this.result             = {'imanobject': 'withdata'};
      this.formattedException = {'exception': 'something broke'};
      spyOn(NetsuiteToolkit, 'formatException').andReturn(this.formattedException);
    });

    describe('no exception is passed', function() {

      beforeEach(function() {
        this.replyWithoutError = NetsuiteToolkit.formatReply(this.params, this.result);
      });

      it("should set the params", function() {
        expect(this.replyWithoutError['params']).toEqual(this.params);
      });

      it("should set the result", function() {
        expect(this.replyWithoutError['result']).toEqual(this.result);
      });

      it("should set success to true", function() {
        expect(this.replyWithoutError['success']).toEqual(true);
      });


    });

    describe('an exception is passed', function() {

      beforeEach(function() {
        this.exception = new Error('zomg');
        this.replyWithError = NetsuiteToolkit.formatReply(this.params, this.result, this.exception);
      });

      it('should call formatException()', function() {
        expect(NetsuiteToolkit.formatException).toHaveBeenCalledWith(this.exception);
      })

      it("should set the params", function() {
        expect(this.replyWithError['params']).toEqual(this.params);
      });

      it("should set the result", function() {
        expect(this.replyWithError['result']).toEqual(this.result);
      });

      it("should set success to false" ,function() {
        expect(this.replyWithError['success']).toEqual(false);
      });

      it("should set the exception", function() {
        expect(this.replyWithError['exception']).toEqual(this.formattedException);
      });

    });

  });

  describe('formatException()', function() {
    beforeEach(function() {
      this.exception = new Error('holy crap');
      Error.prototype.getStackTrace = function() {};
      spyOn(Error.prototype, 'getStackTrace').andReturn("This is a stack trace.");
      this.formattedException = NetsuiteToolkit.formatException(this.exception)
    });

    it("should populate the message field", function() {
      expect(this.formattedException['message']).toEqual(this.exception.message);
    });

    it("should populate the trace field", function() {
      expect(this.formattedException['trace']).toEqual(this.exception.getStackTrace());
    });
  });

  describe('RecordProcessor', function() {

    describe('updateLiterals(fieldData)', function() {

      beforeEach(function() {
        this.record    = {};
        this.fieldData = {
          'custfield': 'somevalue',
          'foo':       'bar'
        };
        this.call_count = Object.keys(this.fieldData).length;
        this.first_call = ['custfield', 'somevalue'];
        this.last_call  = ['foo', 'bar'];
        this.args = [[this.record, 'custfield', 'somevalue'], [this.record, 'foo', 'bar']];
        spyOn(NetsuiteToolkit, 'setFieldValue');
        NetsuiteToolkit.RecordProcessor.updateLiterals(this.record, this.fieldData);
      });

      it('should call setLiteral for each element of fieldData', function() {
        expect(NetsuiteToolkit.setFieldValue.callCount).toEqual(this.call_count);
      });

      // NOTE (JamesChristie+nilmethod) This test assumes order of object fields is
      //   enforced by nodejs. There is no gurantee that Netsuite does this.
      it('should call setLiteral with the data for custfield', function() {
        expect(NetsuiteToolkit.setFieldValue.argsForCall).toEqual(this.args);
      });

    });

  });

  describe('SublistProcessor', function() {

    beforeEach(function() {
      this.record           = {'stuff': 'junk'};
      this.name             = 'arbitrary_sublist';
      this.indexed_create   = {'index': '42', 'data': {}};
      this.unindexed_create = {'data': {}};
      this.indexed_update   = {'index': '42', 'data': {}};
      this.matched_update   = {'match': 'item', 'data': {}};
      this.invalid_update   = {'data': {}};
      this.indexed_excise   = {'index': '42', 'data': {}};
      this.matched_excise   = {'match': 'item', 'data': {}};
      this.invalid_excise   = {};

      this.sublist_data = {
        'name': this.name,
        'create': [
          this.indexed_create,
          this.unindexed_create
        ],
        'update': [
          this.indexed_update,
          this.matched_update,
          this.invalid_update
        ],
        'excise': [
          this.indexed_excise,
          this.matched_excise,
          this.invalid_excise
        ]
      };

      this.processor = new NetsuiteToolkit.SublistProcessor(this.record, this.sublist_data);
    });

    describe('exceptions', function() {

      it('should define an exception for line items not matched', function() {
        expect(NetsuiteToolkit.SublistProcessor.UnableToMatch instanceof Error).toEqual(true);
      });

      it('should define an exception for malformed request data', function() {
        expect(NetsuiteToolkit.SublistProcessor.MalformedData instanceof Error).toEqual(true);
      });

    });

    describe('constructor', function() {

      describe('valid data is given', function() {

        it('should populate the record', function() {
          expect(this.processor.record).toEqual(this.record);
        });

        it('should populate the create_list', function() {
          expect(this.processor.create_list).toEqual(this.sublist_data['create'])
        });

        it('should populate the update_list', function() {
          expect(this.processor.update_list).toEqual(this.sublist_data['update'])
        });

        it('should populate the excision_list', function() {
          expect(this.processor.excise_list).toEqual(this.sublist_data['excise'])
        });

        it('should populate the sublist_name' , function() {
          expect(this.processor.sublist_name).toEqual(this.sublist_data['name']);
        });

      });

      describe('no data is given', function() {

        beforeEach(function() {
          this.blank_sublist_data = {};
          this.blank_processor    = new NetsuiteToolkit.SublistProcessor(this.record,
                                                                         this.blank_sublist_data);
        });

        it('should provide an empty create_list', function() {
          expect(this.blank_processor.create_list).toEqual([]);
        });

        it('should provide an empty update_list', function() {
          expect(this.blank_processor.update_list).toEqual([]);
        });

        it('should provide an empty excision_list', function() {
          expect(this.blank_processor.excise_list).toEqual([]);
        });

      });

    });

    describe('execute()', function() {

      beforeEach(function() {
        spyOn(this.processor, 'processCreations');
        spyOn(this.processor, 'processUpdates');
        spyOn(this.processor, 'processExcisions');
        this.processor.execute();
      });

      it('should call processCreations', function() {
        expect(this.processor.processCreations).toHaveBeenCalled();
      });

      it('should call processUpdates',function() {
        expect(this.processor.processUpdates).toHaveBeenCalled();
      });

      it('should call processExcisions', function() {
        expect(this.processor.processExcisions).toHaveBeenCalled();
      });

    });

    describe('processCreations()', function() {
      beforeEach(function() {
        this.calls = [[this.indexed_create], [this.unindexed_create]];
        spyOn(this.processor, 'createLineItem');
        this.processor.processCreations();
      });

      it('should call createLineItem for each element of create_list', function() {
        expect(this.processor.createLineItem.argsForCall).toEqual(this.calls);
      });
    });

    describe('processUpdates()', function() {

      beforeEach(function() {
        this.calls = [[this.indexed_update], [this.matched_update], [this.invalid_update]];
        spyOn(this.processor, 'updateLineItem');
        this.processor.processUpdates();
      });

      it('should call updateLineItem for each element of update_list', function() {
       expect(this.processor.updateLineItem.argsForCall).toEqual(this.calls);
      }); 

    });

    describe('processExcisions()', function() {

      beforeEach(function() {
        this.calls = [[this.indexed_excise], [this.matched_excise], [this.invalid_excise]];
        spyOn(this.processor, 'exciseLineItem');
        this.processor.processExcisions();
      });

      it('should call exciseLineItem for each element of excise_list', function() {
       expect(this.processor.exciseLineItem.argsForCall).toEqual(this.calls);
      }); 

    });

    describe('createLineItem()', function() {

      beforeEach(function() {
        spyOn(NetsuiteToolkit, 'insertLineItem');
        spyOn(this.processor, 'updateLineItemFields');
      });

      describe('an index is given', function() {

        beforeEach(function() {
          this.index = this.indexed_create['index'];
          this.data  = this.indexed_create['data'];
          this.processor.createLineItem(this.indexed_create);
        });

        it('should call insertLineItem with the given index', function() {
          expect(NetsuiteToolkit.insertLineItem).toHaveBeenCalledWith(this.record, this.name,
                                                                      this.index);
        });

        it('should call updateLineItemFields with the name, index, and data', function() {
          expect(this.processor.updateLineItemFields).toHaveBeenCalledWith(this.index, this.data);
        });

      });

      describe('no index is given', function() {

        beforeEach(function() {
          this.index = 14;
          this.data  = this.unindexed_create['data'];
          spyOn(NetsuiteToolkit, 'getLineItemCount').andReturn(this.index);
          this.processor.createLineItem(this.unindexed_create);
        })

        it('should call getLineItemCount with sublist_name', function() {
          expect(NetsuiteToolkit.getLineItemCount).toHaveBeenCalledWith(this.record, this.name);
        });

        it('should call insertLineItem with the returned index', function() {
          expect(NetsuiteToolkit.insertLineItem).toHaveBeenCalledWith(this.record, this.name,
                                                                      this.index);
        });

        it('should call updateLineItemFields with the name, index, and data', function() {
          expect(this.processor.updateLineItemFields).toHaveBeenCalledWith(this.index, this.data);
        });

      });

    });

    describe('updateLineItem()', function() {

      beforeEach(function() {
        this.index = 42;
        this.data  = {'foo': 'bar'};
        this.match = 'matchdata';
        spyOn(this.processor, 'updateLineItemFields');
      });

      describe('an index is given', function() {

        beforeEach(function() {
          this.update_request = {'index': this.index, 'data': this.data};
          this.processor.updateLineItem(this.update_request);
        });

        it('should call updateLineItemFields with a given index and data', function() {
          expect(this.processor.updateLineItemFields).toHaveBeenCalledWith(this.index, this.data);
        });

      });

      describe('a match field is given', function() {

        beforeEach(function() {
          this.found_index = 24;
          spyOn(this.processor, 'matchLineItemByField').andReturn(this.found_index);
          this.found_update_request = {'data': this.data, 'match': this.match};
          this.processor.updateLineItem(this.found_update_request);
        });

        it('should call matchLineItemByField with a given match field and data', function() {
          expect(this.processor.matchLineItemByField).toHaveBeenCalledWith(this.match, this.data);
        });

        it('should call updateLineItemFields with a given index and data', function() {
          expect(this.processor.updateLineItemFields).toHaveBeenCalledWith(this.found_index, 
                                                                           this.data);
        });

      });

      describe('both an index and match field are given', function() {

        beforeEach(function() {
          this.match_index_request = {
            'index': this.index, 
            'match': this.match, 
            'data': this.data
          };

          spyOn(this.processor, 'matchLineItemByField');
          this.processor.updateLineItem(this.match_index_request);
        });

        it('should not call matchLineItemByField', function() {
          expect(this.processor.matchLineItemByField).not.toHaveBeenCalled();
        });

        it('should call updateLineItemFields with a given index and data', function() {
          expect(this.processor.updateLineItemFields).toHaveBeenCalledWith(this.index, this.data);
        });

      });

      describe('neither an index or match field are given', function() {

        beforeEach(function() {
          this.broken_request = {'foo': 'bar'}
          this.update_call = function() {
            this.processor.updateLineItem(this.broken_request);
          }.bind(this);
        });

        it('should throw NetsuiteToolkit.SublistProcessor.UnableToMatch', function() {
          expect(this.update_call).toThrow(NetsuiteToolkit.SublistProcessor.UnableToMatch);
        });

      });

    });

    describe('exciseLineItem()', function() {

      beforeEach(function() {
        this.index = 42;
        this.data  = {'foo': 'bar'};
        this.match = 'matchdata';
        spyOn(NetsuiteToolkit, 'removeLineItem');
      });

      describe('an index is given', function() {

        beforeEach(function() {
          this.excise_request = {'index': this.index, 'data': this.data};
          this.processor.exciseLineItem(this.excise_request);
        });

        it('should call removeLineItem with a given index and data', function() {
          expect(NetsuiteToolkit.removeLineItem).toHaveBeenCalledWith(this.processor.record,
                                                                      this.processor.sublist_name,
                                                                      this.index);
        });

      });

      describe('a match field is given', function() {

        beforeEach(function() {
          this.found_index = 24;
          spyOn(this.processor, 'matchLineItemByField').andReturn(this.found_index);
          this.found_excise_request = {'data': this.data, 'match': this.match};
          this.processor.exciseLineItem(this.found_excise_request);
        });

        it('should call matchLineItemByField with a given match field and data', function() {
          expect(this.processor.matchLineItemByField).toHaveBeenCalledWith(this.match, this.data);
        });

        it('should call removeLineItem with a given index and data', function() {
          expect(NetsuiteToolkit.removeLineItem).toHaveBeenCalledWith(this.processor.record,
                                                                      this.processor.sublist_name,
                                                                      this.found_index);
        });

      });

      describe('both an index and match field are given', function() {

        beforeEach(function() {
          this.match_index_request = {
            'index': this.index, 
            'match': this.match, 
            'data': this.data
          };

          spyOn(this.processor, 'matchLineItemByField');
          this.processor.exciseLineItem(this.match_index_request);
        });

        it('should not call matchLineItemByField', function() {
          expect(this.processor.matchLineItemByField).not.toHaveBeenCalled();
        });

        it('should call removeLineItem with a given index and data', function() {
          expect(NetsuiteToolkit.removeLineItem).toHaveBeenCalledWith(this.processor.record,
                                                                      this.processor.sublist_name,
                                                                      this.index);
        });

      });

      describe('neither an index or match field are given', function() {

        beforeEach(function() {
          this.broken_request = {'foo': 'bar'}
          this.update_call = function() {
            this.processor.exciseLineItem(this.broken_request);
          }.bind(this);
        });

        it('should throw NetsuiteToolkit.SublistProcessor.UnableToMatch', function() {
          expect(this.update_call).toThrow(NetsuiteToolkit.SublistProcessor.UnableToMatch);
        });

      });

    });

    describe('updateLineItemFields()', function() {

      beforeEach(function() {
        this.index = 7;
        this.data  = {
          'field1': 'value1',
          'field2': 'value2'
        };
        this.calls = [
          [this.record, this.name, this.index, 'field1', 'value1'],
          [this.record, this.name, this.index, 'field2', 'value2']
        ];
        spyOn(NetsuiteToolkit, 'setLineItemValue');
        this.processor.updateLineItemFields(this.index, this.data);
      });

      it('should call NetsuiteToolkit.setLineItemValue for each element of the data', function() {
        expect(NetsuiteToolkit.setLineItemValue.argsForCall).toEqual(this.calls);
      });

    });

    describe('matchLineItemByField()', function() {

      beforeEach(function() {
        this.match_field = 'jedi';
        this.data        = {'jedi': 'Yoda'};
        spyOn(NetsuiteToolkit, 'getLineItemCount').andReturn(16);
      });

      describe('when the field data is matched', function() {

        beforeEach(function() {
          this.index = 1;
          spyOn(this.processor, 'compareLineItemValue').andReturn(true);
          this.result = this.processor.matchLineItemByField(this.match_field, this.data);
        });

        it('should return the index based on the field matched', function() {
          expect(this.result).toEqual(this.index);
        });

      });

      describe('when the field data is not matched', function() {

        beforeEach(function() {
          this.call = function() {
            this.processor.matchLineItemByField(this.match_field, this.data);
          }.bind(this);
          spyOn(this.processor, 'compareLineItemValue').andReturn(false);
        });

        it('should throw NetsuiteToolkit.SublistProcessor.UnableToMatch error', function() {
          expect(this.call).toThrow(NetsuiteToolkit.SublistProcessor.UnableToMatch);
        });

      });
    });

    describe('compareLineItemValue()', function() {

      beforeEach(function() {
        this.index = 1;
        this.match_field = 'planet';
        this.match_value = 'venus';
      });
      
      describe('when the field has a matching value', function() {

        beforeEach(function() {
          spyOn(NetsuiteToolkit, 'getLineItemValue').andReturn(this.match_value);
          this.result = this.processor.compareLineItemValue(this.index, this.match_field,
                                                            this.match_value);
        });

        it('returns a true value', function() {
          expect(this.result).toEqual(true);
        });

      });


      describe('when the field does not have a matching value', function() {

        beforeEach(function() {
          this.non_matching_value = 'not venus';
          spyOn(NetsuiteToolkit, 'getLineItemValue').andReturn(this.non_matching_value);
          this.result = this.processor.compareLineItemValue(this.index, this.match_field,
                                                            this.match_value);
        });

        it('returns a false value', function() {
          expect(this.result).toEqual(false);
        });

      });

    });

  });

});
