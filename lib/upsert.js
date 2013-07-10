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
    this.exception   = null;
  }

  /**
   * Iterates over `record_data` calling `executeUpsertRequest` on each item
   *
   * @method
   * @memberof Upserter
   * @return {null}
   */
  Upserter.prototype.upsertRecords = function() {
    for(index in this.record_data) {
      request_data = this.record_data[index];
      this.executeUpsertRequest(request_data);
    }
  }

  /**
   * Initializes and executes an `UpsertRequest` calling `accumulateResult()`
   *
   * @method
   * @memberof Upserter
   * @param {object} An individual item's records
   * @return {null}
   */
  Upserter.prototype.executeUpsertRequest = function(request_data) {
    upsert_request = new UpsertRequest(request_data);
    upsert_request.execute();
    this.accumulateResult(upsert_request.generateReply());
  }

  /**
   * Pushes the result onto the `reply_list` array
   *
   * @method
   * @memberof Upserter
   * @return {null}
   */
  Upserter.prototype.accumulateResult = function(result) {
    this.reply_list.push(result);
  }

  /**
   * Generate a body for the reply to the client's request.
   *
   * @method
   * @memberof Upserter
   * @return {object} The object containing a formatted summary of the results of the request
   */
  Upserter.prototype.generateReply = function() {
    return NetsuiteToolkit.formatReply(this.params, this.replyList);
  }

  return Upserter;
})();

/**
 * UpsertRequest Class
 * @class UpsertRequest
 * @param {object} record_data The data from a client request
 * @return {Loader} A new instance of UpsertRequest
 */
this.UpsertRequest = (function() {

  /** @constructor */
  function UpsertRequest(record_data) {
    this.params     = record_data;
    this.record     = null;
    this.written_id = null;

    this.internalid         = record_data['internalid'] || null;
    this.record_type        = record_data['record_type'];
    this.literal_field_data = record_data['literal_fields'];
    this.sublist_data       = record_data['sublists'];
  }

  /**
   * Performs the UpsertRequest
   *
   * @method
   * @memberof UpsertRequest
   * @return {null}
   */
  UpsertRequest.prototype.execute = function() {
    this.record = this.loadOrInitializeRecord();
    NetsuiteToolkit.RecordProcessor.updateLiterals(this.record, this.literal_field_data);
    this.processSublists();
    this.written_id = NetsuiteToolkit.submitRecord(this.record);
  }

  /**
   * Finds or creates a new record based on the presence of `internalid`
   * 
   * @method
   * @memberof UpsertRequest
   * @return {null}
   */
  UpsertRequest.prototype.loadOrInitializeRecord = function() {
    if(this.internalid) {
      this.record = NetsuiteToolkit.loadRecord(this.record_type, this.internalid);
    } else {
      this.record = NetsuiteToolkit.createRecord(this.record_type);
    }
  }

  /**
   * Iterates through given sublists calling `executeSublistProcessor()`
   * 
   * @method
   * @memberof UpsertRequest
   * @return {null}
   */
  UpsertRequest.prototype.processSublists = function() {
    for(index in this.sublist_data) {
      sublist = this.sublist_data[index];
      this.executeSublistProcessor(sublist);
    }
  }

  /**
   * Initializes and calls `execute()` on the `NetsuiteToolkit.SublistProcessor()`
   * 
   * @method
   * @memberof UpsertRequest
   * @return {null}
   */
  UpsertRequest.prototype.executeSublistProcessor = function(sublist_data) {
    sublist_processor = new NetsuiteToolkit.SublistProcessor(this.record, sublist_data);
    sublist_processor.execute();
  }

  /**
   * Calls `NetsuiteToolkit.formatReply()` passing it `params` and `written_id`
   * 
   * @method
   * @memberof UpsertRequest
   * @return {object} Formatted reply
   */
  UpsertRequest.prototype.generateReply = function() {
    return NetsuiteToolkit.formatReply(this.params, this.written_id);
  }

  return UpsertRequest;
})();

/** @namespace global */

/**
 * The script function that Netsuite will call to execute the Upserter process
 * 
 * @method
 * @param {object} request The object representing the body of the HTTP request
 * @memberof global
 * @return {object} The formatted results of the request
 */
var upsertPostHandler = function(request) {
  upserter = new Upserter(request);
  upserter.upsertRecords();
  return upserter.generateReply();
}
