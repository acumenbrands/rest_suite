require('./spec_helper.js');

describe("CommonObject", function() {
  var commonObject;
  var params    = ['12345', '67890'];
  var result    = { 'schwa': 'foo' };
  var exception = new Error("This is an error.");

  beforeEach(function() {
    commonObject = new CommonObject();
  });

  describe('#formatReply', function() {
    beforeEach(function() {
      this.formattedException = commonObject.formatException(exception);
      this.replyWithoutError  = commonObject.formatReply(params, result);
      this.replyWithError     = commonObject.formatReply(params, result,
                                                         this.formattedException);
    });

    it("should set the params", function() {
      expect(this.replyWithoutError['params']).toEqual(params);
      expect(this.replyWithError['params']).toEqual(params);
    });

    it("should correctly set the result", function() {
      expect(this.replyWithoutError['result']).toEqual(result);
      expect(this.replyWithError['result']).toEqual(result);
    });

    it("should set success to true if there is no exception", function() {
      expect(this.replyWithoutError['success']).toEqual(true);
    });

    it("should set success to false if there is an exception" ,function() {
      expect(this.replyWithError['success']).toEqual(false);
    });

    it("should set the exception if there is an exception", function() {
      expect(this.replyWithError['exception']).toEqual(this.formattedException);
    });
  });

  describe('#formatException', function() {
    beforeEach(function() {
      Error.prototype.getStackTrace = function() {};
      spyOn(Error.prototype, 'getStackTrace').andReturn("This is a stack trace.");

      this.formattedException = commonObject.formatException(exception)
    });

    it("should populate the message field", function() {
      expect(this.formattedException['message']).toEqual(exception.message);
    });

    it("should populate the trace field", function() {
      expect(this.formattedException['trace']).toEqual(exception.getStackTrace());
    });
  });
});
