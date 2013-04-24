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

    it('should set the record_type', function() {
      expect(this.new_upserter.record_type).toEqual(request['record_type']);
    });

    it('should set the record_data', function() {
      expect(this.new_upserter.record_data).toEqual(request['record_data']);
    });

    it('should initialize the reply_list as an empty Array', function() {
      expect(this.new_upserter.reply_list).toEqual([]); 
    });

    it('should initialize the common field as a CommonObject', function() {
      expect(this.new_upserter.common).toEqual(new CommonObject);
    });

  });

  describe('initializeRecord(record_type)', function() {

    beforeEach(function() {
      this.fake_record = {};
      this.record_type = 'fakerecordtype';
      spyOn(global, 'nlapiInitializeRecord').andReturn(this.fake_record);
      this.init        = function() { return upserter.initializeRecord(this.record_type) }
      this.result      = this.init();
    });

    it('should call nlapiInitializeRecord() with a given record_type', function() {
      expect(global.nlapiInitializeRecord).toHaveBeenCalledWith(this.record_type);
    });

    it('should return the raw results of the nlapiInitializeRecord() call', function() {
      expect(this.result).toEqual(this.fake_record);
    });

  });

  describe('loadRecord(record_type, internal_id)', function() {

    beforeEach(function() {
      this.fake_record = {};
      this.record_type = 'fakerecordtype';
      this.internal_id = '12345';
      spyOn(global, 'nlapiLoadRecord').andReturn(this.fake_record);
      this.load = function() { return upserter.loadRecord(this.record_type, this.internal_id) }
      this.result = this.load();
    });

    it('should call nlapiLoadRecord() with a given record_type and internal_id', function() {
      expect(global.nlapiLoadRecord).toHaveBeenCalledWith(this.record_type, this.internal_id);
    });

    it('should return the raw results of the nlapiLoadRecord() call', function() {
      expect(this.result).toEqual(this.fake_record);
    });

  });

  describe('setLiteralField(record, field_name, value)', function() {

    beforeEach(function() {
      this.record = {};
      this.record.setFieldValue = function() {};
      this.field_name = 'customfieldname';
      this.value = 'foo';
      spyOn(this.record, 'setFieldValue');
      upserter.setLiteralField(this.record, this.field_name, this.value);
    });

    it('should call setFieldValue on record with a given field name and value', function() {
      expect(this.record.setFieldValue).toHaveBeenCalledWith(this.field_name, this.value);
    });

  });

  describe('getLineItemCount(record, sublist_name)', function() {

    beforeEach(function() {
      this.record = {};
      this.record.getLineItemCount = function() {};
      this.sublist_name = 'fakesublist';
      this.count = 16;
      spyOn(this.record, 'getLineItemCount').andReturn(this.count);
      this.result = upserter.getLineItemCount(this.record, this.sublist_name);
    });

    it('should call getLineItemCount with a given sublist name', function() {
      expect(this.record.getLineItemCount).toHaveBeenCalledWith(this.sublist_name);
    });

    it('should return the result of getLineItemCount', function() {
      expect(this.result).toEqual(this.count);
    });

  });

  describe('getLineItemValue(record, sublit_name, index, field_name)', function() {

    beforeEach(function() {
      this.record                  = {};
      this.record.getLineItemValue = function() {};
      this.sublist_name            = 'fakesublist';
      this.index                   = 7;
      this.field_name              = 'fakefield';
      this.fake_value              = 'schwa';
      spyOn(this.record, 'getLineItemValue').andReturn(this.fake_value);
      upserter.getLineItemValue(this.record, this.sublist_name, this.index, this.field_name);
    });

    it('should call getLineItemValue on record', function() {
      expect(this.record.getLineItemValue).toHaveBeenCalledWith(this.sublist_name, this.index,
                                                                this.field_name);
    });
    it('should return the results of getLineItemValue', function() {});

  });

  describe('setLineItemValue(record, sublist_name, index, field_name, value)', function() {

    beforeEach(function() {
      this.record                  = {};
      this.record.setLineItemValue = function() {};
      this.sublist_name            = 'fakesublist';
      this.index                   = 42;
      this.field_name              = 'fakefield';
      this.value                   = 'fakevalue';
      spyOn(this.record, 'setLineItemValue');
      upserter.setLineItemValue(this.record, this.sublist_name, this.index, 
                                this.field_name, this.value);

    });

    it('should call setLineItemValue on record', function() {
      expect(this.record.setLineItemValue).toHaveBeenCalledWith(this.sublist_name, this.index, 
                                                                this.field_name, this.value);
    });

  });

  describe('submitRecord(record_type, record)', function() {

    beforeEach(function() {
      this.fake_id = '12345';
      this.record_type = 'fakerecordtype';
      this.fake_record = {};
      spyOn(global, 'nlapiSubmitRecord').andReturn(this.fake_id);
      this.submit = function() { return upserter.submitRecord(this.record_type, this.fake_record) }
      this.result = this.submit();
    });

    it('should call nlapiSubmitRecord() with a given record_type and record', function() {
      expect(global.nlapiSubmitRecord).toHaveBeenCalledWith(this.record_type, this.fake_record);
    });

    it('should return the raw results of the nlapiSubmitRecord() call', function() {
      expect(this.result).toEqual(this.fake_id);
    });

  });

  describe('reply', function() {

    beforeEach(function() {
      this.fake_reply = {};
      spyOn(upserter.common, 'formatReply').andReturn(this.fake_reply);
      this.result = upserter.reply();
    });

    it('should call formatReply on CommonObject', function() {
      expect(upserter.common.formatReply).toHaveBeenCalledWith(upserter.params, upserter.replyList);
    });

    it('should return the output of formatreply', function() {
      expect(this.result).toEqual(this.fake_reply);
    });

  });
});


// [
//   {
//     'literals': {
//       'amount': '3.50'
//     }
//     'sublists': {
//       'item': [
//         {
//           'match_field': 'item',
//           'delete': 'true',
//           'line_item': {
//             'item': '12345',
//             'quantity': '13'
//           }
//         }
//       ]
//     }
//   },
//   {}
// ]
