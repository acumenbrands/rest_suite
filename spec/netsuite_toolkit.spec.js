require('./spec_helper.js');

describe("NetsuiteToolkit", function() {

  beforeEach(function() {
    global.nlapiInitializeRecord = function() {};
    global.nlapiLoadRecord       = function() {};
    global.nlapiDeleteRecord     = function() {};
    global.nlapiTransformRecord  = function() {};
    global.nlapiSubmitRecord     = function() {};
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

  describe('deleteRecord()', function() {

  });

  describe('transformRecord()', function() {

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
});
