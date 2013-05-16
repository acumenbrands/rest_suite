/**
 * Deleter Class
 * @class Deleter
 * @param {object} request The body of the HTTP Post request from the client
 * @return {Deleter} A new instance of Deleter
 */
this.Deleter = (function() {
  
  /** @constructor */
  function Deleter(request) {
    this.params      = request;
    this.result_list = [];
    this.exception   = null;
  };

  /** 
   * Iterate through the supplied parameters and load their related 
   * records from NetSuite. Populate result_list or exception accordingly.
   * 
   * @method
   * @memberof Deleter
   * @return {null}
   */
  Deleter.prototype.deleteRecords = function() {
    try {
      for(index in this.params) {
        delete_params = this.params[index];
        this.executeDeleteRequest(delete_params);
      }
    } catch(exception) {
      this.exception = exception;
    }
  }

  /**
   * Instantiate a new DeleteRequest given load parameters and accumulate its result
   * on result_list.
   * 
   * @method
   * @memberof Deleter
   * @param {object} Data representing load request parameters
   * @return {null}
   */
  Deleter.prototype.executeDeleteRequest = function(delete_params) {
    delete_request = new DeleteRequest(delete_params['record_type'], delete_params['internalid']);
    this.accumulateResult(delete_request.execute());
  }

  /**
   * Push a result onto the result_list.
   * 
   * @method
   * @memberof Deleter
   * @return {null}
   */
  Deleter.prototype.accumulateResult = function(result) {
    this.result_list.push(result);
  }
  
  /**
   * Generate and return Deleter reply for the requestor.
   * 
   * @method
   * @memberof Deleter
   * @return {object} A formatted reply object from NetsuiteToolkit
   */
  Deleter.prototype.generateReply = function() {
    return NetsuiteToolkit.formatReply(this.params, this.result_list, this.exception);
  }

  return Deleter;
})();

/**
 * DeleteRequest Class
 * @class DeleteRequest
 * @param {string} record_type the String representing a NetSuite record type
 * @param {string} internalid the String representing a NetSuite internal id
 * @return {DeleteRequest} A new instance of DeleteRequest
 */
this.DeleteRequest = (function() {

  /** @constructor */
  function DeleteRequest(record_type, internalid) {
    this.record_type = record_type;
    this.internalid  = internalid;
    this.result      = null;
    this.exception   = null;
  }

  /**
   * Load a record for a DeleteRequest and generate a reply for it.
   *
   * @method
   * @memberof DeleteRequest
   * @return {null}
   */
  DeleteRequest.prototype.execute = function() {
    this.deleteRecord();
    return this.generateReply();
  }


  /**
   * Load a record for a DeleteRequest and catch any exceptions.
   * 
   * @method
   * @memberof DeleteRequest
   * @return {null}
   */
  DeleteRequest.prototype.deleteRecord = function() {
    try {
      this.result = NetsuiteToolkit.deleteRecord(this.record_type, this.internalid);
    } catch(exception) {
      this.exception = exception;
    }
  }
  
  /**
   * Set parameters for a DeleteRequest.
   * 
   * @method
   * @memberof DeleteRequest
   * @return {object} The parameter object
   */
  DeleteRequest.prototype.generateParams = function() {
    params = {
      'internalid':  this.internalid,
      'record_type': this.record_type
    };
    return params;
  }

  /**
   * Generate a DeleteRequest reply for the requestor.
   * 
   * @method
   * @memberof DeleteRequest
   * @return {object} A formatted reply object from NetsuiteToolkit
   */
  DeleteRequest.prototype.generateReply = function() {
    params = this.generateParams();
    return NetsuiteToolkit.formatReply(params, this.result, this.exception);
  }

  return DeleteRequest;
})();

/** @namespace global */

/**
 * The script function that Netsuite will call to execute the Deleter process
 * 
 * @method
 * @param {object} request The object representing the HTTP request body
 * @memberof global
 * @return {object} The formatted results of the request
 */
var deletePostHandler = function(request) {
  deleter = new Deleter(request);
  deleter.deleteRecords();
  return deleter.generateReply();
}
