//NOTE (nilmethod) document the glue method that NetSuite will host

/**
 * Upserter Class
 * @class Upserter
 * @param {object} request The body of the HTTP Post request from the client
 * @return {Upserter} A new instance of Upserter
 */
this.Upserter = (function() {

  /** @constructor */
  function Upserter(request) {
    this.params      = request;
    this.record_data = request['record_data'];
    this.reply_list  = [];
  }

  /**
   * Generate a body for the reply to the client's request.
   *
   * @method
   * @memberof Upserter
   * @return {object} The object containing a formatted summary of the results of the request
   */
  Upserter.prototype.reply = function() {
    return NetsuiteToolkit.formatReply(this.params, this.replyList);
  }

  return Upserter;
})();

var postHandler = function(request) {
}
