var Initializer;

this.Initializer = (function() {
  function Initializer(recordType) {
    this.recordType        = recordType;
    this.initializedRecord = null;
    this.exception         = null;

    this.common            = new CommonObject();
  }

  Initializer.prototype.initializeRecord = function() {
    try {
      this.initializedRecord = nlapiInitializeRecord(this.recordType);
    } catch(exception) {
      this.exception = exception;
    }
  }

  Initializer.prototype.reply = function() {
    var reply = this.common.formatReply(this.recordType,
                                        this.initializedRecord,
                                        this.exception);
    return reply;
  }

  return Initializer;
})();

var postHandler = function() {
  initializer = new Initializer(request['record_type']);
  initializer.initializeRecord();
  return initializer.reply();
}
