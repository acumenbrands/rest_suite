require('./spec_helper.js');

describe('Transformer', function() {

  var transformer;
  var record_with_sublists = {};
  var record_without_sublists = {};
  var record_data = [
    record_without_sublists,
    record_with_sublists
  ];
  var request = {
    'record_data': record_data
  };

  beforeEach(function() {
    transformer = new Transformer(request);
  });

  // constructor
  describe('Transformer(request)', function() {

    it('should set the params', function() {
      expect(transformer.params).toEqual(request);
    });

    it('should set the record_data', function() {
      expect(transformer.record_data).toEqual(request['record_data']);
    });

    it('should initialize the reply_list as an empty Array', function() {
      expect(transformer.reply_list).toEqual([]); 
    });

    it('should initialize the exception to null', function() {
      expect(transformer.exception).toEqual(null);
    });

  });

  describe('transformRecords()', function() {

    beforeEach(function() {
      this.transform_one = {'upsert': 'one'};
      this.transform_two = {'upsert': 'two'};
      transformer.record_data = [this.transform_one, this.transform_two];
      this.calls = [[this.transform_one], [this.transform_two]];
      spyOn(transformer, 'executeTransformRequest');
      transformer.transformRecords();
    });

    it('should call executeTransformRequest for each element of record_data', function() {
      expect(transformer.executeTransformRequest.argsForCall).toEqual(this.calls);
    });

  });

  describe('executeTransformRequest()', function() {

    beforeEach(function() {
      this.request_data   = {'request': 'stuff'};
      this.reply          = {'it': 'worked'};
      this.transform_request = {};
      this.transform_request.execute       = function() {}
      this.transform_request.generateReply = function() {}
      spyOn(global, 'TransformRequest').andReturn(this.transform_request);
      spyOn(this.transform_request, 'execute');
      spyOn(this.transform_request, 'generateReply').andReturn(this.reply);
      spyOn(transformer, 'accumulateResult');
      transformer.executeTransformRequest(this.request_data);
    });

    it('should call the constructor on TransformRequest', function() {
      expect(global.TransformRequest).toHaveBeenCalledWith(this.request_data);
    });

    it('should call execute on the newly created instance of TransformRequest', function() {
      expect(this.transform_request.execute).toHaveBeenCalled();
    });

    it('should call generateReply on the TransformRequest instance', function() {
      expect(this.transform_request.generateReply).toHaveBeenCalled();
    });

    it('should call accumulateResult with the results of generateReply', function() {
      expect(transformer.accumulateResult).toHaveBeenCalledWith(this.reply);
    });

  });

  describe('accumulateResult()', function() {

    beforeEach(function() {
      this.formatted_reply = {'reply': 'body'};
      spyOn(transformer.reply_list, 'push');
      transformer.accumulateResult(this.formatted_reply);
    });

    it('should call concat on reply_list', function() {
      expect(transformer.reply_list.push).toHaveBeenCalledWith(this.formatted_reply);
    });

  });

  describe('generateReply()', function() {

    beforeEach(function() {
      this.fake_reply = {};
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.fake_reply);
      this.result = transformer.generateReply();
    });

    it('should call formatReply on NetsuiteToolkit', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(transformer.params,
                                                               transformer.replyList);
    });

    it('should return the output of formatreply', function() {
      expect(this.result).toEqual(this.fake_reply);
    });

  });

});

describe('TransformRequest', function() {

  var transform_request;
  var internalid       = '123456789';
  var source_type      = 'salesorder';
  var result_type      = 'invoice';
  var transform_values = {'fields': 'values'};
  var literal_fields   = {
    'email': 'name@domain.suffix',
    'total': '19.99'
  };
  var sublist_one = { 'stuff': 'junk' };
  var sublist_two = { 'thing': 'sundries' };
  var sublists = [
    sublist_one,
    sublist_two
  ];
  var record_data = {
    'internalid':       internalid,
    'source_type':      source_type,
    'result_type':      result_type,
    'transform_values': transform_values,
    'literal_fields':   literal_fields,
    'sublists':         sublists
  };

  beforeEach(function() {
    transform_request = new TransformRequest(record_data);
  });

  it('should define a NoInternalIdGiven exception', function() {
    expect(TransformRequest.NoInternalIdGiven instanceof Error).toEqual(true);
  });

  describe('constructor()', function() {

    it('should populate the params with the record_data', function() {
      expect(transform_request.params).toEqual(record_data);
    });

    it('should populate the record_id', function() {
      expect(transform_request.internalid).toEqual(internalid);
    });

    it('should populate the source_type', function() {
      expect(transform_request.source_type).toEqual(source_type);
    });

    it('should populate the result_type', function() {
      expect(transform_request.result_type).toEqual(result_type);
    });

    it('should populate the transform_values', function() {
      expect(transform_request.transform_values).toEqual(transform_values);
    });

    it('should populate the literal_field_data', function() {
      expect(transform_request.literal_field_data).toEqual(literal_fields);
    });

    it('should populate the sublist_data', function() {
      expect(transform_request.sublist_data).toEqual(sublists);
    });

    it('should initialize record to null', function() {
      expect(transform_request.record).toEqual(null);
    });

    it('should initialize written_id to null', function() {
      expect(transform_request.written_id).toEqual(null);
    });

  });

  describe('execute()', function() {

    beforeEach(function() {
      this.new_id = 17;
      this.record = {'this is': 'a record'};
      spyOn(NetsuiteToolkit, 'transformRecord').andReturn(this.record);
      spyOn(NetsuiteToolkit.RecordProcessor, 'updateLiterals');
      spyOn(transform_request, 'processSublists');
      spyOn(NetsuiteToolkit, 'submitRecord').andReturn(this.new_id);
      transform_request.execute();
    });

    it('should call NetsuiteToolkit.transformRecord', function() {
      expect(NetsuiteToolkit.transformRecord).toHaveBeenCalledWith(
        transform_request.source_type,
        transform_request.internalid,
        transform_request.result_type,
        transform_request.transform_values
      );
    });

    it('should call NetsuiteToolkit.RecordProcessor.updateLiterals', function() {
      expect(NetsuiteToolkit.RecordProcessor.updateLiterals).toHaveBeenCalledWith(
        transform_request.record,
        transform_request.literal_field_data
      );
    });

    it('should call processSublists', function() {
      expect(transform_request.processSublists).toHaveBeenCalled();
    });

    it('should call NetsuiteToolkit.submitRecord with the now mutated record', function() {
      expect(NetsuiteToolkit.submitRecord).toHaveBeenCalledWith(transform_request.record);
    });

    it('should set written_id to the return value of NetsuiteToolkit.submitRecord', function() {
      expect(transform_request.written_id).toEqual(this.new_id);
    });

    describe('no internalid is present', function() {

      beforeEach(function() {
        transform_request.internalid = null;
        this.call = function() {
          transform_request.execute();
        }
      });

      it('should throw a NoInternalIdGiven exception', function() {
        expect(this.call).toThrow(TransformRequest.NoInternalIdGiven);
      });

    });

  });

  describe('processSublists()', function() {

    beforeEach(function() {
      this.calls = [
        [sublist_one],
        [sublist_two]
      ];
      spyOn(transform_request, 'executeSublistProcessor');
      transform_request.processSublists();
    });

    it('should call executeSublistProcessor for each element of sublist_data', function() {
      expect(transform_request.executeSublistProcessor.argsForCall).toEqual(this.calls);
    });

  });

  describe('executeSublistProcessor()', function() {

    beforeEach(function() {
      this.fake_processor = {};
      this.fake_processor.execute = function() {}
      spyOn(NetsuiteToolkit, 'SublistProcessor').andReturn(this.fake_processor);
      spyOn(this.fake_processor, 'execute');
      transform_request.executeSublistProcessor(sublist_one);
    });
  
    it('should call the constructor of NetsuiteToolkit.SublistProcessor', function() {
      expect(NetsuiteToolkit.SublistProcessor).toHaveBeenCalledWith(transform_request.record,
                                                                    sublist_one);
    });

    it('should call execute on the newly initialized SublistProcessor instance', function() {
      expect(this.fake_processor.execute).toHaveBeenCalled();
    });

  });

  describe('generateReply()', function() {

    beforeEach(function() {
      this.fake_reply = {};
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.fake_reply);
      this.result = transform_request.generateReply();
    });

    it('should call formatReply on NetsuiteToolkit', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(transform_request.params,
                                                               transform_request.written_id);
    });

    it('should return the output of formatreply', function() {
      expect(this.result).toEqual(this.fake_reply);
    });

  });

});
