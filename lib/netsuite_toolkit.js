/** @namespace NetsuiteToolkit */
var NetsuiteToolkit              = {};
NetsuiteToolkit.RecordProcessor  = {};
NetsuiteToolkit.SublistProcessor = {};

var line_item_match_error = "Unable to find matching line item with the given field.";
var malformed_data_error  = "Data for processing line items is malformed.";

/**
 * Requests a newly initialized record from NetSuite.
 *
 * @method
 * @param {string} record_type The String representing a record type
 * @memberof NetsuiteToolkit
 * @return {null}
 */
NetsuiteToolkit.createRecord = function(record_type) {
  return nlapiCreateRecord(record_type);
}

/**
 * Requests a record from NetSuite's database by id (internal_id in NetSuite parlance)
 *
 * @method
 * @param {string} record_type The String representing a record type
 * @param {string} interal_id  The String representing a NetSuite internal_id
 * @memberof NetsuiteToolkit
 * @return {null}
 */
NetsuiteToolkit.loadRecord = function(record_type, record_id) {
  return nlapiLoadRecord(record_type, record_id);
}

/**
 * Requests a record be deleted from NetSuite's database by id (internal_id in NetSuite parlance)
 *
 * @method
 * @param {string} record_type The String representing a record type
 * @param {string} interalid   The String representing a NetSuite internal_id
 * @memberof NetsuiteToolkit
 * @return {number} The number representing the internalid of the record deleted
 */
NetsuiteToolkit.deleteRecord = function(record_type, internalid) {
  return nlapiDeleteRecord(record_type, internalid);
}

/**
 * Requests a record from NetSuite's database by id (internal_id in NetSuite parlance)
 *
 * @method
 * @param {string} source_type The String representing a source record type
 * @param {string} internalid  The String representing the internalid of the source record
 * @param {string} result_type The String representing a result record type
 * @param {object} values      The object containing set of values to be populated onto the
 *                             transformed record
 * @memberof NetsuiteToolkit
 * @return {null}
 */
NetsuiteToolkit.transformRecord = function(source_type, internalid, result_type, values) {
  return nlapiTransformRecord(source_type, internalid, result_type, values);
}

/**
 * Requests that Netsuite write a given record to it's database.
 *
 * @method
 * @param {nlobjRecord} record           The NetSuite record object
 * @param {boolean}     do_sourcing      Enable or disable sourcing
 * @param {boolean}     ignore_mandatory Recognize or ignore mandatory fields
 * @memberof NetsuiteToolkit
 * @return {null}
 */
NetsuiteToolkit.submitRecord = function(record, do_sourcing, ignore_mandatory) {
  do_sourcing      = do_sourcing      || false;
  ignore_mandatory = ignore_mandatory || false;
  return nlapiSubmitRecord(record, do_sourcing, ignore_mandatory);
}

/**
* Mutates an arbitrary field value on a NetSuite record.
*
* @method
* @param {nlobjRecord} record     The NetSuite record object 
* @param {string}      field_name The String representing the field to mutate
* @param {value}       value      The String representing the value to replace
* @memberof NetsuiteToolkit
* @return {null}
*/
NetsuiteToolkit.setFieldValue = function(record, field_name, value) {
  record.setFieldValue(field_name, value);
}

/**
 * Fetches the line item count for a given NetSuite sublist.
 *
 * @method
 * @param {nlobjRecord} record       The NetSuite record object 
 * @param {string}      sublist_name The String representing the NetSuite sublist
 * @memberof NetsuiteToolkit
 * @return {number} The line item count for the sublist.
 */
NetsuiteToolkit.getLineItemCount = function(record, sublist_name) {
  return record.getLineItemCount(sublist_name);
}

/**
 * Fetched the value of a line item in a given sublist for a given field.
 *
 * @method
 * @param {nlobjRecord} record       The NetSuite record object 
 * @param {string}      sublist_name The String representing the NetSuite sublist
 * @param {number}      index        The Number of the sublist index
 * @param {string}      field_name   The string representing the name of the field
 * @memberof NetsuiteToolkit
 * @return {number} The value of the filed on the given sublist at the given index
 */
NetsuiteToolkit.getLineItemValue = function(record, sublist_name, index, field_name) {
  return record.getLineItemValue(sublist_name, index, field_name);
}

/**
 * Mutates the value of a line item in a given sublist for a given field.
 *
 * @method
 * @param {nlobjRecord} record       The NetSuite record object 
 * @param {string}      sublist_name The String representing the NetSuite sublist
 * @param {number}      index        The Number of the sublist index
 * @param {string}      field_name   The string representing the name of the field
 * @param {string}      value        The string representing the value of the field
 * @memberof NetsuiteToolkit
 * @return {null}
 */
NetsuiteToolkit.setLineItemValue = function(record, sublist_name, field_name, index, value) {
  record.setLineItemValue(sublist_name, field_name, index, value);
}

/** 
 * Inserts a line item into a sublist on a given record.
 * 
 * @method
 * @param {nlobjRecord} record       The NetsuiteRecord object
 * @param {string}      sublist_name The String representing the NetSuite sublist on the record 
 * @param {number}      index        The Number of the sublist index to be updated
 * @memberof NetsuiteToolkit
 * @return {null}
 */
NetsuiteToolkit.insertLineItem = function(record, sublist_name, index) {
  record.insertLineItem(sublist_name, index);
}

/**
 * Removes a line item at a given index for a given sublist field.
 *
 * @method
 * @param {nlobjRecord} record       The NetSuite record object
 * @param {string}      sublist_name The string representing the name of the sublist field
 * @param {number}      index        The number of the sublist index
 * @memberof NetsuiteToolkit
 * @return {null}
 */
NetsuiteToolkit.removeLineItem = function(record, sublist_name, index) {
  record.removeLineItem(sublist_name, index);
}

/**
 * Removes a line item at a given index for a given sublist field.
 *
 * @method
 * @param {string} field  The string representing the name of the record field
 * @param {string} join   The name of a field to join
 * @param {string} value1 The string representing the value for comparison
 * @param {string} value2 The string representing the second value for comparison
 * @param
 * @memberof NetsuiteToolkit
 * @return {nlobjSearchFilter} A new instance of nlobjSearchFilter
 */
NetsuiteToolkit.searchFilter = function(field, join, value1, value2) {
  return (new nlobjSearchFilter(field, join, value1, value2));
}

/**
 * Removes a line item at a given index for a given sublist field.
 *
 * @method
 * @param {string} field   The string representing the name of the record field
 * @param {string} join    The name of a field to join
 * @param {string} summary The summary of the column
 * @param
 * @memberof NetsuiteToolkit
 * @return {nlobjSearchColumn} A new instance of nlobjSearchColumn
 */
NetsuiteToolkit.searchColumn = function(name, join, summary) {
  return (new nlobjSearchColumn(name, join, summary));
}

/**
 * Removes a line item at a given index for a given sublist field.
 *
 * @method
 * @param {string} record_type    The string representing the record type
 * @param {string} search_id      The string representing the search id
 * @param {array}  search_filters The array containing a set on nlobjSearchFilter objects
 * @param {array}  search_columns The array containing a set on nlobjSearchColumn objects
 * @param
 * @memberof NetsuiteToolkit
 * @return {array} The array containing the results of the search
 */
NetsuiteToolkit.searchRecord = function(record_type, search_id, search_filters, search_columns) {
  return nlapiSearchRecord(record_type, search_id, search_filters, search_columns);
}

/**
 * Removes a line item at a given index for a given sublist field.
 *
 * @method
 * @param {nlobjRecord} record An instance of nlobjRecord
 * @param
 * @memberof NetsuiteToolkit
 * @return {number} The number representing the record id
 */
NetsuiteToolkit.getIdFromRecord = function(record) {
  return record.getId();
}

/**
 * Returns a formatted reply object using a given set of params, result and possible exception
 *
 * @method
 * @param {object} params    The object holding the params of a request
 * @param {object} result    The object containing the result of the request
 * @param {error}  exception The error object of a raised exception
 * @memberof NetsuiteToolkit
 * @return {object} The formatted reply object
 */
NetsuiteToolkit.formatReply = function(params, result, exception) {
  reply = {};

  reply['params']  = params;
  reply['result']  = result;

  if(exception) {
    reply['exception'] = NetsuiteToolkit.formatException(exception);
    reply['success']   = false;
  } else {
    reply['success'] = true;
  }

  return reply;
}                                                           
                                                          
/**
 * Returns a formatted reply object based off of a given exception.
 *
 * @method
 * @param {error} exception The Error object of the given exception
 * @memberof NetsuiteToolkit
 * @return {object} The formatted reply object generated from the exception
 */
NetsuiteToolkit.formatException = function(exception) {                 
  var formattedException = {};

  formattedException['message'] = exception.message;

  try {
    formattedException['trace'] = exception.getStackTrace();
  } catch(stack_fetch_error) {
    formattedException['trace'] = stack_fetch_error.message;
  }

  return formattedException;
}

/** @namespace NetsuiteToolkit.RecordProcessor */

/**
 * Update literal fields on a given record with the given fieldData.
 *
 * @method
 * @param {nlobjRecord} record    The NetSuite record object
 * @param {object}      fieldData Data for literal fields
 * @memberof NetsuiteToolkit.RecordProcessor
 */
NetsuiteToolkit.RecordProcessor.updateLiterals = function(record, fieldData) {
  for(field_name in fieldData) {
    value = fieldData[field_name];
    NetsuiteToolkit.setFieldValue(record, field_name, value);
  }
}

/** @namespace NetsuiteToolkit.SublistProcessor */

/**
 * SublistProcessor Class
 * @class NetsuiteToolkit.SublistProcessor
 * @param {object} sublist_data The object representing operations to be performed
 *                              on the sublist data
 * @return {SublistProcessor} The new instance of NetsuiteToolkit.SublistProcessor
 */
NetsuiteToolkit.SublistProcessor = (function() {

  /* @constructor */
  function SublistProcessor(record, sublist_data) {
    this.record       = record;
    this.sublist_name = sublist_data['name'];
    this.create_list  = sublist_data['create'] || [];
    this.update_list  = sublist_data['update'] || [];
    this.excise_list  = sublist_data['excise'] || [];
  }

  /**
   * Procedural function to execute all sublist operations on the given
   * record and sublist
   *
   * @method
   * @memberof NetsuiteToolkit.SublistProcessor
   */
  SublistProcessor.prototype.execute = function() {
    this.processCreations();
    this.processUpdates();
    this.processExcisions();
  }

  /**
   * Iterate over list of creation requests and execute them
   * 
   * @method
   * @memberof NetsuiteToolkit.SublistProcessor
   */
  SublistProcessor.prototype.processCreations = function() {
    for(index in this.create_list) {
      create_request = this.create_list[index];
      this.createLineItem(create_request);
    }
  }

  /**
   * Iterate over list of update requests and execute them
   * 
   * @method
   * @memberof NetsuiteToolkit.SublistProcessor
   */
  SublistProcessor.prototype.processUpdates = function() {
    for(index in this.update_list) {
      update_request = this.update_list[index];
      this.updateLineItem(update_request);
    }
  }

  /**
   * Iterate over list of excision requests and execute them
   * 
   * @method
   * @memberof NetsuiteToolkit.SublistProcessor
   */
  SublistProcessor.prototype.processExcisions = function() {
    for(index in this.excise_list) {
      excise_request = this.excise_list[index];
      this.exciseLineItem(excise_request);
    }
  }

  /**
   * Creates and alters the fields of a new line item using the
   * given params
   * 
   * @method
   * @param {object} creation_request The Object that hold a single creation
   *                                  request for a line item
   * @memberof NetsuiteToolkit.SublistProcessor
   */
  SublistProcessor.prototype.createLineItem = function(creation_request) {
    index = creation_request['index'];
    data  = creation_request['data'];

    if(!index) {
      index = NetsuiteToolkit.getLineItemCount(this.record, this.sublist_name);
    }
    NetsuiteToolkit.insertLineItem(this.record, this.sublist_name, index);
    this.updateLineItemFields(index, data);
  }

  /**
   * Alters the fields of a line item using the given params
   * 
   * @method
   * @param {object} update_request The Object that hold a single update
   *                                request for a line item
   * @memberof NetsuiteToolkit.SublistProcessor
   */
  SublistProcessor.prototype.updateLineItem = function(update_request) {
    index = update_request['index'];
    match = update_request['match'];
    data  = update_request['data'];

    if(!index && !match) {
      throw NetsuiteToolkit.SublistProcessor.UnableToMatch;
    } else if(!index) {
      index = this.matchLineItemByField(match, data);
    }

    this.updateLineItemFields(index, data);
  };

  /**
   * Removes a line item using the given params
   * 
   * @method
   * @param {object} excise_request The Object that hold a single excise
   *                                request for a line item
   * @memberof NetsuiteToolkit.SublistProcessor
   */
  SublistProcessor.prototype.exciseLineItem = function(excise_request) {
    index = excise_request['index'];
    match = excise_request['match'];
    data  = excise_request['data'];

    if(!index && !match) {
      throw NetsuiteToolkit.SublistProcessor.UnableToMatch;
    } else if(!index) {
      index = this.matchLineItemByField(match, data);
    }

    NetsuiteToolkit.removeLineItem(this.record, this.sublist_name, index);
  }

  /**
   * Updates all declared fields of a line item at the given index
   *
   * @param {Number} index          The Number representing the index position of
   *                                a line item
   * @param {object} line_item_data The Object representing the fields and values
   *                                for a line item alteration
   * @memberof NetsuiteToolkit.SublistProcessor
   */
  SublistProcessor.prototype.updateLineItemFields = function(index, line_item_data) {
    for(field in line_item_data) {
      value = line_item_data[field];
      NetsuiteToolkit.setLineItemValue(this.record, this.sublist_name, field, index, value);
    }
  }

  /**
   * Locates the index of a line item matching the given field data, returns
   * the first match encountered. An exception is raised if no match is found
   *
   * @param {String} match_field The String representing the internalid of a line item
   *                             field
   * @param {object} data        The Object representing the line item field and value
   *                             data
   * @memberof NetsuiteToolkit.SublistProcessor
   * @return {Number} The Number representing the index of the mateched line item
   */
  SublistProcessor.prototype.matchLineItemByField = function(match_field, data) {
    match_value = data[match_field];
    count       = NetsuiteToolkit.getLineItemCount(this.record, this.sublist_name);

    for(index=1; index <= count; index++) {
      if(this.compareLineItemValue(index, match_field, match_value)) { return index }
    }

    throw NetsuiteToolkit.SublistProcessor.UnableToMatch;
  }

  /**
   * Compares the value of a given field at a given line item index with the
   * given value
   *
   * @param {Number} index       The Number representing the index position of the line item
   * @param {String} match_field The String representing the internalid of the line item field
   * @param {String} match_value The String representing the value to be compared against
   * @memberof NetsuiteToolkit.SublistProcessor
   * @return {Boolean} The Boolean representing the successful match
   */
  SublistProcessor.prototype.compareLineItemValue = function(index, match_field, match_value) {
    netsuite_value = NetsuiteToolkit.getLineItemValue(this.record, this.sublist_name,
                                                      index, match_field);
    return (netsuite_value == match_value);
  }

  return SublistProcessor;
})();

/**
 * An exception thrown in the event that the sublist data given is malformed.
 * @static
 * @field
 * @memberof NetsuiteToolkit.SublistProcessor
 */
NetsuiteToolkit.SublistProcessor.MalformedData = new Error(malformed_data_error);

/**
 * An exception thrown in the event that a line item cannot be matched
 * to a given field.
 * @static
 * @field
 * @memberof NetsuiteToolkit.SublistProcessor
 */
NetsuiteToolkit.SublistProcessor.UnableToMatch = new Error(line_item_match_error);

if(typeof(exports) != 'undefined') {
  exports.NetsuiteToolkit = NetsuiteToolkit;
}
