require('./spec_helper.js');

describe('Upserter', function() {

  var upserter;
  var record_data = {};
  var request = {
    'record_type': 'salesorder',
    'record_data': record_data
  };

  beforeEach(function() {
    upserter = new Upserter(request);
    global.nlapiInitializeRecord = function() {}
    global.nlapiLoadRecord       = function() {}
  });

  // constructor
  describe('Upserter(request)', function() {

    beforeEach(function() {
      this.new_upserter = new Upserter(request);
    });

    it('should set the params', function() {
      expect(this.new_upserter.params).toEqual(request);
    });

    it('should set the record_data', function() {
      expect(this.new_upserter.record_data).toEqual(request['record_data']);
    });

    it('should initialize the reply_list as an empty Array', function() {
      expect(this.new_upserter.reply_list).toEqual([]); 
    });

  });

  describe('reply', function() {

    beforeEach(function() {
      this.fake_reply = {};
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.fake_reply);
      this.result = upserter.reply();
    });

    it('should call formatReply on CommonObject', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(upserter.params, upserter.replyList);
    });

    it('should return the output of formatreply', function() {
      expect(this.result).toEqual(this.fake_reply);
    });

  });
});
