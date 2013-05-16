require('./spec_helper.js');

describe('Deleter', function() {

  var deleter;
  var fakeRecordId = '12345';
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
    deleter = new Deleter(params);
    spyOn(NetsuiteToolkit, 'deleteRecord').andReturn(fakeRecordId);
  });

  describe('consturctor', function() {

    it('should set the params', function() {
      expect(deleter.params).toEqual(params);
    });

    it('initializes result_list to an empty array', function() {
      expect(deleter.result_list).toEqual([]);
    });

    it('initializes exception to null', function() {
      expect(deleter.exception).toEqual(null);
    });

  });

  describe('deleteRecords()', function() {

    // NOTE (JamesChristie) this block ensures the calls are tested by value and 
    //    not reference
    beforeEach(function() {
      this.first_param  = {'first': 'value'};
      this.second_param = {'second': 'value'};
      this.third_param  = {'third': 'value'};
      deleter.params     = [this.first_param, this.second_param, this.third_param];
    });

    describe('no error is thrown', function() {

      beforeEach(function() {
        this.calls = [[this.first_param], [this.second_param], [this.third_param]];
        spyOn(deleter, 'executeDeleteRequest');
        deleter.deleteRecords();
      });

      it('should call executeDeleteRequest() with each element of params', function() {
        expect(deleter.executeDeleteRequest.argsForCall).toEqual(this.calls);
      });

    });

    describe('and error is thrown', function() {

      beforeEach(function() {
        this.exception = new Error('eep!');
        spyOn(deleter, 'executeDeleteRequest').andThrow(this.exception);
        deleter.deleteRecords();
      });

      it('should set the exception field on deleter to the thrown exception', function() {
        expect(deleter.exception).toEqual(this.exception);
      });

    });

  });

  describe('executeDeleteRequest()', function() {

    beforeEach(function() {
      this.fake_type   = 'recordtype';
      this.fake_id     = '7';
      this.params      = {
        'record_type': this.fake_type,
        'internalid':  this.fake_id
      };
      this.fake_result = '12345';
      this.fake_deleter = {};
      this.fake_deleter.execute = function() {}
      spyOn(deleter, 'accumulateResult');
      spyOn(global, 'DeleteRequest').andReturn(this.fake_deleter);
      spyOn(this.fake_deleter, 'execute').andReturn(this.fake_result);
      deleter.executeDeleteRequest(this.params);
    });

    it('should initialize a new DeleteRequest instance', function(){
      expect(global.DeleteRequest).toHaveBeenCalledWith(this.fake_type, this.fake_id);
    });

    it('should call execute() on the DeleteRequest instance', function() {
      expect(this.fake_deleter.execute).toHaveBeenCalled();
    });

    it('should call accumulateResult() with the results of execute()', function() {
      expect(deleter.accumulateResult).toHaveBeenCalledWith(this.fake_result);
    });

  });

  describe('accumulateResult()', function() {

    beforeEach(function() {
      this.result = {};
      spyOn(deleter.result_list, 'push');
      deleter.accumulateResult(this.result);
    });

    it('should should call result_list.push with a given result', function() {
      expect(deleter.result_list.push).toHaveBeenCalledWith(this.result);
    });

  });

  describe('generateReply()', function() {

    beforeEach(function() {
      deleter.exception = new Error('zomg');
      this.formatted_reply = {'thisis': 'areply'};
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.formatted_reply);
      this.result = deleter.generateReply();
    });

    it('should call NetsuiteToolkit.formatReply', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(deleter.params, deleter.result_list,
                                                               deleter.exception);
    });

    it('should return the results for formatReply', function() {
      expect(this.result).toEqual(this.formatted_reply);
    });

  });

});

describe('DeleteRequest', function() {

  var delete_request;
  var record_type = 'salesorder';
  var internalid = '12345';

  beforeEach(function() {
    delete_request = new DeleteRequest(record_type, internalid);
  });

  describe('consturctor', function() {

    it('should set the record type', function() {
      expect(delete_request.record_type).toEqual(record_type);
    });

    it('should set the internalid', function() {
      expect(delete_request.internalid).toEqual(internalid);
    });

    it('should initialize result to null', function() {
      expect(delete_request.result).toEqual(null);
    });

    it('should initialize exception to null', function() {
      expect(delete_request.exception).toEqual(null);
    });

  });

  describe('execute()', function() {

    beforeEach(function() {
      spyOn(delete_request, 'deleteRecord');
      spyOn(delete_request, 'generateReply').andReturn(internalid);
      this.result = delete_request.execute();
    });

    it('should call deleteRecord()', function() {
      expect(delete_request.deleteRecord).toHaveBeenCalled();
    });

    it('should call generateReply()', function() {
      expect(delete_request.generateReply).toHaveBeenCalled();
    });

    it('should return results from generateReply()', function() {
      expect(this.result).toEqual(internalid);
    });
    
  });

  describe('deleteRecord()', function() {

    beforeEach(function() {
      this.fake_record = {};
      spyOn(NetsuiteToolkit, 'deleteRecord').andReturn(this.fake_record);
      delete_request.deleteRecord();
    });

    it('should call deleteRecord on NetsuiteToolkit', function() {
      expect(NetsuiteToolkit.deleteRecord).toHaveBeenCalledWith(delete_request.record_type,
                                                                delete_request.internalid);
    });

    it('should set the record to the return value of deleteRecord', function() {
      expect(delete_request.result).toEqual(this.fake_record);
    });

  });

  describe('generateParams()', function() {

    beforeEach(function() {
      this.params_hash = {
        'internalid':  delete_request.internalid,
        'record_type': delete_request.record_type
      };
      this.result = delete_request.generateParams();
    });

    it('should return a hash of params', function() {
      expect(this.result).toEqual(this.params_hash);
    });

  });

  describe('generateReply()', function() {

    beforeEach(function() {
      delete_request.result    = {'id': '7'};
      delete_request.exception = new Error('go away');
      this.params            = {'internalid': '7'};
      this.reply             = {'params': 'i hate you'};
      spyOn(delete_request, 'generateParams').andReturn(this.params);
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.reply);
      this.result = delete_request.generateReply();
    });

    it('should call generateParams', function() {
      expect(delete_request.generateParams).toHaveBeenCalled();
    })

    it('should call NetsuiteToolkit.formatReply()', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(this.params, delete_request.result,
                                                               delete_request.exception);
    });

    it('should return a normally formatted response', function() {
      expect(this.result).toEqual(this.reply);
    });

  });

});
