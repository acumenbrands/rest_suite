var no_internalid_given_error = "No internal id was supplied, cannot source " +
                                "record for transformation";

/**
 * Transformer Class
 * @class Transformer
 * @param {object} request The body of the HTTP Post request from the client
 * @return {Transformer} A new instance of Transformer
 */
this.Transformer = (function() {

  /** @constructor */
  function Transformer(request) {
    this.params      = request;
    this.record_data = request['record_data'];
    this.reply_list  = [];
    this.exception   = null;
  }

  /** 
   * Iterates over each record calling `executeTransformRequest()`
   * 
   * @method
   * @memberof Transformer
   * @return {null}
   */
  Transformer.prototype.transformRecords = function() {
    for(index in this.record_data) {
      request_data = this.record_data[index];
      this.executeTransformRequest(request_data);
    }
  }

  /** 
   * Executes a new TransformRequest, accumulating the result
   * 
   * @method 
   * @memberof Transformer
   * @param {object} The request data
   * @return {null}
   */
  Transformer.prototype.executeTransformRequest = function(request_data) {
    transform_request = new TransformRequest(request_data);
    transform_request.execute();
    this.accumulateResult(transform_request.generateReply());
  }

  /** 
   * Adds a result to the `reply_list`
   * 
   * @method 
   * @memberof Transformer
   * @param {object} The result
   * @return {null}
   */
  Transformer.prototype.accumulateResult = function(result) {
    this.reply_list.push(result);
  }

  /** 
   * Wrapper for `NetsuiteToolkit.formatReply()`
   * 
   * @method 
   * @memberof Transformer
   * @return {object} The formatted reply from Netsuite
   */
  Transformer.prototype.generateReply = function() {
    return NetsuiteToolkit.formatReply(this.params, this.replyList);
  }

  return Transformer;
})();

/**
 * TransformRequest Class
 * @class TransformRequest
 * @param {object} the required information to transform a record
 * @return {TransformRequest} A new instance of TransformRequest
 */
this.TransformRequest = (function() {

  /** @constructor */
  function TransformRequest(record_data) {
    this.params     = record_data;
    this.record     = null;
    this.written_id = null;

    this.internalid         = record_data['internalid'] || null;
    this.source_type        = record_data['source_type'];
    this.result_type        = record_data['result_type'];
    this.transform_values   = record_data['transform_values'];
    this.literal_field_data = record_data['literal_fields'];
    this.sublist_data       = record_data['sublists'];
  }

  /** 
   * Transform a record for TransformRequest, alters its data
   * using the given data and submits it for writing.
   * 
   * @method 
   * @memberof TransformRequest
   * @return {null}
   */
  TransformRequest.prototype.execute = function() {
    if(!this.internalid) { throw TransformRequest.NoInternalIdGiven; }

    this.record = NetsuiteToolkit.transformRecord(this.source_type, this.internalid,
                                                  this.result_type, this.transform_values);
    NetsuiteToolkit.RecordProcessor.updateLiterals(this.record, this.literal_field_data);
    this.processSublists();
    this.written_id = NetsuiteToolkit.submitRecord(this.record);
  }

  /**
   * Iterate over the list of sublist operations and call `executeSublistProcessor()`
   * for each
   * 
   * @method 
   * @memberof TransformRequest
   * @return {null}
   */
  TransformRequest.prototype.processSublists = function() {
    for(index in this.sublist_data) {
      sublist = this.sublist_data[index];
      this.executeSublistProcessor(sublist);
    }
  }

  /**
   * Initialize a new `NetsuiteToolkit.SublistProcessor` using the given
   * sublist data and execute it
   * 
   * @method 
   * @memberof TransformRequest
   * @return {null}
   */
  TransformRequest.prototype.executeSublistProcessor = function(sublist_data) {
    sublist_processor = new NetsuiteToolkit.SublistProcessor(this.record, sublist_data);
    sublist_processor.execute();
  }

  /** 
   * Wrapper for `NetsuiteToolkit.formatReply()`
   * 
   * @method 
   * @memberof Transformer
   * @return {object} The formatted reply from Netsuite
   */
  TransformRequest.prototype.generateReply = function() {
    return NetsuiteToolkit.formatReply(this.params, this.written_id);
  }

  return TransformRequest;
})();

this.TransformRequest.NoInternalIdGiven = new Error(no_internalid_given_error);

/** @namespace global */

/**
 * The script function that Netsuite will call to execute the Transformer process
 * 
 * @method
 * @param {object} request The object representing the HTTP request body
 * @memberof global
 * @return {object} The formatted results of the request
 */
var transformPostHandler = function(request) {
  transformer = new Transformer(request);
  transformer.transformRecord();
  return transformer.generateReply();
}
