require('./spec_helper.js');

describe('Loader', function() {

  var loader;
  var fakeRecord   = {};
  var request_list = [
    {
      'record_type': 'salesorder',
      'internalid':  '12345'
    },
    {
      'record_type': 'inventoryitem',
      'internalid':  '12345'
    },
    {
      'record_type': 'giftcertificate',
      'internalid':  '67890'
    }
  ];
  var params = {
    'request_list': request_list
  }

  beforeEach(function() {
    loader = new Loader(params);
    global.nlapiLoadRecord = function() {};
    spyOn(global, 'nlapiLoadRecord').andReturn(fakeRecord);
  });

  describe('consturctor', function() {

    it('should set the params', function() {
      expect(loader.params).toEqual(params);
    });

    it('initializes result_list to an empty array', function() {
      expect(loader.result_list).toEqual([]);
    });

    it('initializes exception to null', function() {
      expect(loader.exception).toEqual(null);
    });

  });

  describe('loadRecords()', function() {

    // NOTE (JamesChristie) this block ensures the calls are tested by value and 
    //    not reference
    beforeEach(function() {
      this.first_param  = {'first': 'value'};
      this.second_param = {'second': 'value'};
      this.third_param  = {'third': 'value'};
      loader.params     = [this.first_param, this.second_param, this.third_param];
    });

    describe('no error is thrown', function() {

      beforeEach(function() {
        this.calls = [[this.first_param], [this.second_param], [this.third_param]];
        spyOn(loader, 'executeLoadRequest');
        loader.loadRecords();
      });

      it('should call executeLoadRequest() with each element of params', function() {
        expect(loader.executeLoadRequest.argsForCall).toEqual(this.calls);
      });

    });

    describe('and error is thrown', function() {

      beforeEach(function() {
        this.exception = new Error('eep!');
        spyOn(loader, 'executeLoadRequest').andThrow(this.exception);
        loader.loadRecords();
      });

      it('should set the exception field on loader to the thrown exception', function() {
        expect(loader.exception).toEqual(this.exception);
      });

    });

  });

  describe('executeLoadRequest()', function() {

    beforeEach(function() {
      this.fake_type   = 'recordtype';
      this.fake_id     = '7';
      this.params      = {
        'record_type': this.fake_type,
        'internalid':  this.fake_id
      };
      this.fake_result = {'thisis': 'aresult'};
      this.fake_loader = {};
      this.fake_loader.execute = function() {}
      spyOn(loader, 'accumulateResult');
      spyOn(global, 'LoadRequest').andReturn(this.fake_loader);
      spyOn(this.fake_loader, 'execute').andReturn(this.fake_result);
      loader.executeLoadRequest(this.params);
    });

    it('should initialize a new LoadRequest instance', function(){
      expect(global.LoadRequest).toHaveBeenCalledWith(this.fake_type, this.fake_id);
    });

    it('should call execute() on the LoadRequest instance', function() {
      expect(this.fake_loader.execute).toHaveBeenCalled();
    });

    it('should call accumulateResult() with the results of execute()', function() {
      expect(loader.accumulateResult).toHaveBeenCalledWith(this.fake_result);
    });

  });

  describe('accumulateResult()', function() {

    beforeEach(function() {
      this.result = {};
      spyOn(loader.result_list, 'push');
      loader.accumulateResult(this.result);
    });

    it('should should call result_list.push with a given result', function() {
      expect(loader.result_list.push).toHaveBeenCalledWith(this.result);
    });

  });

  describe('generateReply()', function() {

    beforeEach(function() {
      loader.exception = new Error('zomg');
      this.formatted_reply = {'thisis': 'areply'};
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.formatted_reply);
      this.result = loader.generateReply();
    });

    it('should call NetsuiteToolkit.formatReply', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(loader.params, loader.result_list,
                                                               loader.exception);
    });

    it('should return the results for formatReply', function() {
      expect(this.result).toEqual(this.formatted_reply);
    });

  });

});

describe('LoadRequest', function() {

  var load_request;
  var record_type = 'salesorder';
  var internalid = '12345';

  beforeEach(function() {
    load_request = new LoadRequest(record_type, internalid);
  });

  describe('consturctor', function() {

    it('should set the record type', function() {
      expect(load_request.record_type).toEqual(record_type);
    });

    it('should set the internalid', function() {
      expect(load_request.internalid).toEqual(internalid);
    });

    it('should initialize record to null', function() {
      expect(load_request.record).toEqual(null);
    });

    it('should initialize exception to null', function() {
      expect(load_request.exception).toEqual(null);
    });

  });

  describe('loadRecord()', function() {

    beforeEach(function() {
      this.fake_record = {};
      spyOn(NetsuiteToolkit, 'loadRecord').andReturn(this.fake_record);
      load_request.loadRecord();
    });

    it('should call loadRecord on NetsuiteToolkit', function() {
      expect(NetsuiteToolkit.loadRecord).toHaveBeenCalledWith(load_request.record_type,
                                                              load_request.internalid);
    });

    it('should set the record to the return value of loadRecord', function() {
      expect(load_request.record).toEqual(this.fake_record);
    });

  });

  describe('execute()', function() {

    beforeEach(function() {
      this.reply = {};
      spyOn(load_request, 'loadRecord');
      spyOn(load_request, 'generateReply').andReturn(this.reply);
      this.result = load_request.execute();
    });

    it('should call loadRecord()', function() {
      expect(load_request.loadRecord).toHaveBeenCalled();
    });

    it('should call generateReply()', function() {
      expect(load_request.generateReply).toHaveBeenCalled();
    });

    it('should return results from generateReply()', function() {
      expect(this.result).toEqual(this.reply);
    });
    
  });

  describe('generateParams()', function() {

    beforeEach(function() {
      this.params_hash = {
        'internalid':  load_request.internalid,
        'record_type': load_request.record_type
      };
      this.result = load_request.generateParams();
    });

    it('should return a hash of params', function() {
      expect(this.result).toEqual(this.params_hash);
    });

  });

  describe('generateReply()', function() {

    beforeEach(function() {
      load_request.record    = {'id': '7'};
      load_request.exception = new Error('go away');
      this.params            = {'internalid': '7'};
      this.reply             = {'params': 'i hate you'};
      spyOn(load_request, 'generateParams').andReturn(this.params);
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.reply);
      this.result = load_request.generateReply();
    });

    it('should call generateParams', function() {
      expect(load_request.generateParams).toHaveBeenCalled();
    })

    it('should call NetsuiteToolkit.formatReply()', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(this.params, load_request.record,
                                                               load_request.exception);
    });

    it('should return a normally formatted response', function() {
      expect(this.result).toEqual(this.reply);
    });

  });

});
