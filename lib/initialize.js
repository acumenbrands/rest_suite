/**
 * Initializer Class
 * @class Initializer
 * @param {object} request The body of the HTTP Post request from the client
 * @return {Initializer} A new instance of Initializer
 */
this.Initializer = (function() {

  /* @consturctor */
  function Initializer(request) {
    this.params             = request;
    this.record_type        = request['record_type'];
    this.initialized_record = null;
    this.exception          = null;
  }

  /**
   * Request the NetsuiteToolkit to return a new, blank record.
   *
   * @method
   * @memberof Initializer
   * @return {null}
   */
  Initializer.prototype.initializeRecord = function() {
    try {
      this.initialized_record = NetsuiteToolkit.createRecord(this.record_type);
    } catch(exception) {
      this.exception = exception;
    }
  }

  /**
   * Return a formatted reply object generate by NetsuiteToolkit
   *
   * @method
   * @memberof Initializer
   * @return {object} The object containing the formatted reply data
   */
  Initializer.prototype.generateReply = function() {
    return NetsuiteToolkit.formatReply(this.params, this.initialized_record, this.exception);
  }

  return Initializer;
})();

/** @namespace global */

/**
 * Request the NetsuiteToolkit to return a new, blank record.
 *
 * @method
 * @param {string} record_type The String representing the record type to be initialized
 * @memberof Initializer
 * @return {null}
 */
var initializePostHandler = function(request) {
  initializer = new Initializer(request);
  initializer.initializeRecord();
  return initializer.generateReply();
}
