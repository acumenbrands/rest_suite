this.Endpoint = (function () {

    var EXCEPTIONS = {
        METHOD_NOT_SUPPORTED: 'Method not supported!',
        REQUIRED_PARAMETER: 'Parameter(s) {{PARAMETER}} is required',
        PARAMETERS_MUST_BE_AN_ARRAY: 'The parameter \'params\' must be an array'
    };

    var FIELD_TYPE_WITH_OPTIONS = ['select', 'multiselect', 'radio'];

    function Endpoint(netsuiteApi, requestParams) {
        this.netsuiteApi   = netsuiteApi;
        this.requestParams = requestParams || {};
        this.result        = null;
        this.exception     = null;
    }

    Endpoint.prototype.handleRequest = function () {
        var method = this.requestParams.method;
        var params = this.requestParams.params || [];

        if (!Array.isArray(params)) {
            this.addException(EXCEPTIONS.PARAMETERS_MUST_BE_AN_ARRAY);
        } else if (this._isFunction(this[method])) {
            this.result = this[method].apply(this, params);
        } else if (this._isFunction(this.netsuiteApi[method])) {
            this.result = this.netsuiteApi[method].apply(this.netsuiteApi, params);
        } else {
            this.addException(EXCEPTIONS.METHOD_NOT_SUPPORTED);
        }

        return this.generateReply();
    };

    Endpoint.prototype.getModuleFields = function (module) {
        var self = this;

        if (module) {
            var fields  = [];
            var records = NetsuiteToolkit.searchRecord(module);

            if (records.length) {
                var record     = NetsuiteToolkit.loadRecord(module, records[0].id);
                var fieldNames = record.getAllFields();

                fieldNames.forEach(function(fieldName) {
                    var field = self._getField(record, fieldName);

                    if (field) {
                        fields.push(field);
                    }
                });
            }

            return fields;
        } else {
            self.addException(EXCEPTIONS.REQUIRED_PARAMETER.replace('{{PARAMETER}}', 'module'));
        }
    };

    Endpoint.prototype._getField = function (record, fieldName) {
        var field = record.getField(fieldName);
        if (field) {
            return this._buildField(field);
        }
    };

    Endpoint.prototype._buildField = function (field) {
        var formattedField = {
            name     : field.name,
            label    : field.label || field.name,
            type     : field.type,
            readOnly : !!field.readOnly,
            mandatory: !!field.mandatory,
            disabled : !!field.disabled,
            hidden   : !!field.hidden,
            popup    : !!field.popup
        };

        if (FIELD_TYPE_WITH_OPTIONS.indexOf(formattedField.type) !== -1) {
            formattedField.values = this._getSelectFieldValues(field);
        }

        return formattedField;
    };

    Endpoint.prototype._getSelectFieldValues = function (field) {
        var values = [];

        try {
            var options = field.getSelectOptions();

            values = options.map(function (option) {
                return {
                    label: option.getText(),
                    value: option.getId()
                };
            });
        } catch(e) {}

        return values;
    };


    Endpoint.prototype.addException = function (message) {
        this.exception = new Error(message);
    };

    Endpoint.prototype.generateReply = function () {
        return NetsuiteToolkit.formatReply(this.params, this.result, this.exception);
    };

    Endpoint.prototype._isFunction = function (object) {
        return Object.prototype.toString.call(object) === '[object Function]';
    };

    return Endpoint;

})();


function endpointPostHandler(params) {
    var service = new Endpoint(this, params);
    return service.handleRequest();
}