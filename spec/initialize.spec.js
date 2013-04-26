require('./spec_helper.js');

describe('Initializer', function() {

  var initializer;
  var record_type = 'salesorder';
  var params = {
    'record_type': record_type
  };
  var blank_record = {
    'record_type': record_type
  };
  global.nlapiInitializeRecord = function () {};

  beforeEach(function() {
    initializer = new Initializer(params);
  });

  describe('init()', function() {

    it('should set the params', function() {
      expect(initializer.params).toEqual(params);
    });

    it('should set the record type', function(){
      expect(initializer.record_type).toEqual(params['record_type']);
    });

    it('should initialize initialized_record to null', function() {
      expect(initializer.initialized_record).toEqual(null);
    });

    it('should initialize exception to null', function() {
      expect(initializer.exception).toEqual(null);
    })

  });

  describe('initializeRecord()', function() {

    describe('ideal operation', function() {

      beforeEach(function() {
        spyOn(NetsuiteToolkit, 'initializeRecord').andReturn(blank_record);
        initializer.initializeRecord();
      });

      it('should call initialize record from the NetsuiteToolkit', function() {
        expect(NetsuiteToolkit.initializeRecord).toHaveBeenCalledWith(record_type);
      });

      it('should update the initializedRecord field with the new record', function() {
        expect(initializer.initialized_record).toEqual(blank_record);
      });

    });

    describe('an exception occurs', function() {

      beforeEach(function() {
        this.exception = new Error('ZOMG');
        spyOn(NetsuiteToolkit, 'initializeRecord').andThrow(this.exception);
        initializer.initializeRecord();
      })

      it('should not change initialized_record from null', function() {
        expect(initializer.initialized_record).toEqual(null);
      })

      it('should set the exception to the thrown error', function() {
        expect(initializer.exception).toEqual(this.exception);
      })

    });

  });

  describe('generateReply()', function() {

    beforeEach(function() {
      this.fake_reply                = {};
      initializer.initialized_record = blank_record;
      initializer.exception          = {};
      spyOn(NetsuiteToolkit, 'formatReply').andReturn(this.fake_reply);
      this.result = initializer.generateReply();
    });

    it('should call formatReply on NetsuiteToolkit', function() {
      expect(NetsuiteToolkit.formatReply).toHaveBeenCalledWith(initializer.params,
                                                               initializer.initialized_record,
                                                               initializer.exception)
    });

    it('should return the results of formatReply', function() {
      expect(this.result).toEqual(this.fake_reply);
    });

  });

});
