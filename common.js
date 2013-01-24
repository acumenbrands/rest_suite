var formatException;

this.formatException = function(exception) {
  /*
   * Description: Format an exception to send to the client
   * Params:
   *              exception: An exception object
   *
   * Return:      A serialized exception object
   */
  var serializedException = [exception.name.toString(), exception.message];

  try {
    return(serializedException.concat(exception.getStackTrace()));
  }
  catch(stack_fetch_error) {
    return(serializedException.concat([stack_fetch_error.message]));
  }
}

