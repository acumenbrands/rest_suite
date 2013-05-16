/**
 * Loader Class
 * @class Loader
 * @param {object} request The body of the HTTP Post request from the client
 * @return {Loader} A new instance of Loader
 */
this.Loader = (function() {
  
  /** @constructor */
  function Loader(request) {
    this.params      = request;
    this.result_list = [];
    this.exception   = null;
  };

  /** 
   * Iterate through the supplied parameters and load their related 
   * records from NetSuite. Populate result_list or exception accordingly.
   * 
   * @method
   * @memberof Loader
   * @return {null}
   */
  Loader.prototype.loadRecords = function() {
    try {
      for(index in this.params) {
        load_params = this.params[index];
        this.executeLoadRequest(load_params);
      }
    } catch(exception) {
      this.exception = exception;
    }
  }

  /**
   * Instantiate a new LoadRequest given load parameters and accumulate its result
   * on result_list.
   * 
   * @method
   * @memberof Loader
   * @param {object} Data representing load request parameters
   * @return {null}
   */
  Loader.prototype.executeLoadRequest = function(load_params) {
    load_request = new LoadRequest(load_params['record_type'], load_params['internalid']);
    this.accumulateResult(load_request.execute());
  }

  /**
   * Push a result onto the result_list.
   * 
   * @method
   * @memberof Loader
   * @return {null}
   */
  Loader.prototype.accumulateResult = function(result) {
    this.result_list.push(result);
  }
  
  /**
   * Generate and return Loader reply for the requestor.
   * 
   * @method
   * @memberof Loader
   * @return {object} A formatted reply object from NetsuiteToolkit
   */
  Loader.prototype.generateReply = function() {
    return NetsuiteToolkit.formatReply(this.params, this.result_list, this.exception);
  }

  return Loader;
})();

/**
 * LoadRequest Class
 * @class LoadRequest
 * @param {string} record_type the String representing a NetSuite record type
 * @param {string} internalid the String representing a NetSuite internal id
 * @return {LoadRequest} A new instance of LoadRequest
 */
this.LoadRequest = (function() {

  /** @constructor */
  function LoadRequest(record_type, internalid) {
    this.record_type = record_type;
    this.internalid  = internalid;
    this.record      = null;
    this.exception   = null;
  }

  /**
   * Load a record for a LoadRequest and generate a reply for it.
   *
   * @method
   * @memberof LoadRequest
   * @return {null}
   */
  LoadRequest.prototype.execute = function() {
    this.loadRecord();
    return this.generateReply();
  }


  /**
   * Load a record for a LoadRequest and catch any exceptions.
   * 
   * @method
   * @memberof LoadRequest
   * @return {null}
   */
  LoadRequest.prototype.loadRecord = function() {
    try {
      this.record = NetsuiteToolkit.loadRecord(this.record_type, this.internalid);
    } catch(exception) {
      this.exception = exception;
    }
  }
  
  /**
   * Set parameters for a LoadRequest.
   * 
   * @method
   * @memberof LoadRequest
   * @return {object} The parameter object
   */
  LoadRequest.prototype.generateParams = function() {
    params = {
      'internalid':  this.internalid,
      'record_type': this.record_type
    };
    return params;
  }

  /**
   * Generate a LoadRequest reply for the requestor.
   * 
   * @method
   * @memberof LoadRequest
   * @return {object} A formatted reply object from NetsuiteToolkit
   */
  LoadRequest.prototype.generateReply = function() {
    params = this.generateParams();
    return NetsuiteToolkit.formatReply(params, this.record, this.exception);
  }

  return LoadRequest;
})();

/** @namespace global */

/**
 * The script function that Netsuite will call to execute the Loader process
 * 
 * @method
 * @param {object} request The HTTP request body
 * @memberof global
 * @return {object} The formatted results of the request
 */
var loadPostHandler = function(request) {
  loader = new Loader(request);
  loader.loadRecords();
  return loader.generateReply();
}
