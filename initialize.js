var Initializer;

this.Initializer = (function() {
  function Initializer(recordType) {
    this.recordType        = recordType;
    this.initializedRecord = null;
  }

  Initializer.prototype.initializeRecord = function() {
    this.initializedRecord = nlapiInitializeRecord(this.recordType);
  }

  Initializer.prototype.reply = function() {
    return this.initializedRecord;
  }

  return Initializer;
})();
