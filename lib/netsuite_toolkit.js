/** @namespace NetsuiteToolkit */
var NetsuiteToolkit = {};

/**
 * Requests a newly initialized record from NetSuite.
 *
 * @method
 * @param {string} record_type The String representing a record type
 * @memberof NetsuiteToolkit
 * @return {null}
 */
NetsuiteToolkit.initializeRecord = function(record_type) {
  return nlapiInitializeRecord(record_type);
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

NetsuiteToolkit.deleteRecord = function() {}

NetsuiteToolkit.transformRecord = function() {}

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
NetsuiteToolkit.setLineItemValue = function(record, sublist_name, index, field_name, value) {
  record.setLineItemValue(sublist_name, index, field_name, value);  
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
 * @params {error} exception The Error object of the given exception
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

exports.NetsuiteToolkit = NetsuiteToolkit;