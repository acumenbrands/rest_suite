require('./spec_helper.js');

describe('Upserter', function() {

  var upserter;
  var record_with_sublists = {
  };
  var record_without_sublists = {
  };
  var record_data = [
    record_without_sublists,
    record_with_sublists
  ];
  var request = {
    'record_data': record_data
  };

  beforeEach(function() {
    upserter = new Upserter(request);
    global.nlapiInitializeRecord = function() {}
    global.nlapiLoadRecord       = function() {}
  });

  // constructor
  describe('Upserter(request)', function() {

    it('should set the params', function() {
      expect(upserter.params).toEqual(request);
    });

    it('should set the record_data', function() {
      expect(upserter.record_data).toEqual(request['record_data']);
    });

    it('should initialize the reply_list as an empty Array', function() {
      expect(upserter.reply_list).toEqual([]); 
    });

    it('should initialize the exception to null', function() {
      expect(upserter.exception).toEqual(null);
    });

  });

  describe('upsertRecords()', function() {

    beforeEach(function() {
      this.upsert_one = {'upsert': 'one'};
      this.upsert_two = {'upsert': 'two'};
      upserter.record_data = [this.upsert_one, this.upsert_two];
      this.calls = [[this.upsert_one], [this.upsert_two]];
      spyOn(upserter, 'executeUpsertRequest');
      upserter.upsertRecords();
    });

    it('should call executeUpsertRequest for each element of record_data', function() {
      expect(upserter.executeUpsertRequest.argsForCall).toEqual(this.calls);
    });

  });

  describe('executeUpsertRequest()', function() {

    beforeEach(function() {
      this.request_data   = {'request': 'stuff'};
      this.reply          = {'it': 'worked'};
      this.upsert_request = {};
      this.upsert_request.execute       = function() {}
      this.upsert_request.generateReply = function() {}
      spyOn(global, 'UpsertRequest').andReturn(this.upsert_request);
      spyOn(this.upsert_request, 'execute');
      spyOn(this.upsert_request, 'generateReply').andReturn(this.reply);
      spyOn(upserter, 'accumulateResult');
      upserter.executeUpsertRequest(this.request_data);
    });

    it('should call the constructor on UpsertRequest', function() {
      expect(global.UpsertRequest).toHaveBeenCalledWith(this.request_data);
    });

    it('should call execute on the newly created instance of UpsertRequest', function() {
      expect(this.upsert_request.execute).toHaveBeenCalled();
    });

    it('should call generateReply on the UpsertRequest instance', function() {
      expect(this.upsert_request.generateReply).toHaveBeenCalled();
    });

    it('should call accumulateResult with the results of generateReply', function() {
      expect(upserter.accumulateResult).toHaveBeenCalledWith(this.reply);
    });

  });

  describe('accumulateResult()', function() {

    beforeEach(function() {
      this.formatted_reply = {'reply': 'body'};
      spyOn(upserter.reply_list, 'push');
      upserter.accumulateResult(this.formatted_reply);
    });

    it('should call concat on reply_list', function() {
      expect(upserter.reply_list.push).toHaveBeenCalledWith(this.formatted_reply);
    });

  });

  describe('generateReply()', function() {

    beforeEach(function() {
      this.fake_reply = {};
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.fake_reply);
      this.result = upserter.generateReply();
    });

    it('should call formatReply on NetsuiteToolkit', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(upserter.params, upserter.replyList);
    });

    it('should return the output of formatreply', function() {
      expect(this.result).toEqual(this.fake_reply);
    });

  });

});

describe('UpsertRequest', function() {

  var upsert_request;
  var internalid  = '123456789';
  var record_type = 'salesorder';
  var literal_fields = {
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
    'record_type':    record_type,
    'literal_fields': literal_fields,
    'sublists':       sublists
  };
  var record_data_with_id = {
    'internalid':     internalid,
    'record_type':    record_type,
    'literal_fields': literal_fields,
    'sublists':       sublists
  };

  beforeEach(function() {
    upsert_request = new UpsertRequest(record_data);
  });

  describe('constructor()', function() {

    it('should populate the params with the record_data', function() {
      expect(upsert_request.params).toEqual(record_data);
    });

    it('record_id should not have a value', function() {
      expect(upsert_request.internalid).toEqual(null);
    });

    it('should populate the record_type', function() {
      expect(upsert_request.record_type).toEqual(record_type);
    });

    it('should populate the literal_field_data', function() {
      expect(upsert_request.literal_field_data).toEqual(literal_fields);
    });

    it('should populate the sublist_data', function() {
      expect(upsert_request.sublist_data).toEqual(sublists);
    });

    it('should initialize record to null', function() {
      expect(upsert_request.record).toEqual(null);
    });

    it('should initialize written_id to null', function() {
      expect(upsert_request.written_id).toEqual(null);
    });

    describe('an id is present', function() {

      beforeEach(function() {
        this.upsert_request_with_id = new UpsertRequest(record_data_with_id);
      });

      it('internalid should have a value', function() {
        expect(this.upsert_request_with_id.internalid).toEqual(internalid);
      });

    });

  });

  describe('execute()', function() {

    beforeEach(function() {
      this.new_id = 17;
      this.record = {'this is': 'a record'};
      spyOn(upsert_request, 'loadOrInitializeRecord').andReturn(this.record);
      spyOn(NetsuiteToolkit.RecordProcessor, 'updateLiterals');
      spyOn(upsert_request, 'processSublists');
      spyOn(NetsuiteToolkit, 'submitRecord').andReturn(this.new_id);
      upsert_request.execute();
    });

    it('should call loadOrInitializeRecord', function() {
      expect(upsert_request.loadOrInitializeRecord).toHaveBeenCalled();
    });

    it('should call NetsuiteToolkit.RecordProcessor.updateLiterals', function() {
      expect(NetsuiteToolkit.RecordProcessor.updateLiterals).toHaveBeenCalledWith(
        upsert_request.record,
        upsert_request.literal_field_data
      );
    });

    it('should call processSublists', function() {
      expect(upsert_request.processSublists).toHaveBeenCalled();
    });

    it('should call NetsuiteToolkit.submitRecord with the now mutated record', function() {
      expect(NetsuiteToolkit.submitRecord).toHaveBeenCalledWith(upsert_request.record);
    });

    it('should set written_id to the return value of NetsuiteToolkit.submitRecord', function() {
      expect(upsert_request.written_id).toEqual(this.new_id);
    });

  });

  describe('loadOrInitializeRecord()', function() {

    describe('an internalid is present', function() {

      beforeEach(function() {
        upsert_request.internalid = internalid;
        spyOn(NetsuiteToolkit, 'loadRecord');
        upsert_request.loadOrInitializeRecord();
      });

      it('should call NetsuiteToolkit.loadRecord', function() {
        expect(NetsuiteToolkit.loadRecord).toHaveBeenCalledWith(upsert_request.record_type,
                                                                upsert_request.internalid);
      });

    });

    describe('an internalid is not present', function() {

      beforeEach(function() {
        spyOn(NetsuiteToolkit, 'createRecord');
        upsert_request.loadOrInitializeRecord();
      });

      it('should call NetsuiteToolkit.initializeRecord', function() {
        expect(NetsuiteToolkit.createRecord).toHaveBeenCalledWith(upsert_request.record_type);
      });

    });

  });

  describe('processSublists()', function() {

    beforeEach(function() {
      this.calls = [
        [sublist_one],
        [sublist_two]
      ];
      spyOn(upsert_request, 'executeSublistProcessor');
      upsert_request.processSublists();
    });

    it('should call executeSublistProcessor for each element of sublist_data', function() {
      expect(upsert_request.executeSublistProcessor.argsForCall).toEqual(this.calls);
    });

  });

  describe('executeSublistProcessor()', function() {

    beforeEach(function() {
      this.fake_processor = {};
      this.fake_processor.execute = function() {}
      spyOn(NetsuiteToolkit, 'SublistProcessor').andReturn(this.fake_processor);
      spyOn(this.fake_processor, 'execute');
      upsert_request.executeSublistProcessor(sublist_one);
    });
  
    it('should call the constructor of NetsuiteToolkit.SublistProcessor', function() {
      expect(NetsuiteToolkit.SublistProcessor).toHaveBeenCalledWith(upsert_request.record,
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
      this.result = upsert_request.generateReply();
    });

    it('should call formatReply on NetsuiteToolkit', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(upsert_request.params,
                                                               upsert_request.written_id);
    });

    it('should return the output of formatreply', function() {
      expect(this.result).toEqual(this.fake_reply);
    });

  });

});
