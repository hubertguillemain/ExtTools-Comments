"use strict";
var OMWebPluginLib;
(function (OMWebPluginLib) {
    /** API types
     */
    var OMApi;
    (function (OMApi) {
        function stringField(value, fieldId, recordId) {
            return {
                type: 'string',
                fieldId: { id: fieldId, recordId: recordId },
                value: value
            };
        }
        OMApi.stringField = stringField;
        function intField(value, fieldId, recordId) {
            return {
                type: 'int',
                fieldId: { id: fieldId, recordId: recordId },
                value: value
            };
        }
        OMApi.intField = intField;
        //export interface IDocument {
        //    setFields(fields: ReadonlyArray<Field>): Promise<void>
        //}
    })(OMApi = OMWebPluginLib.OMApi || (OMWebPluginLib.OMApi = {}));
    /** API calls
     */
    (function (OMApi) {
        OMApi.Module = 'api';
        function isApiMessage(msg) {
            return typeof msg === 'object' && typeof msg.json === 'string';
        }
        OMApi.isApiMessage = isApiMessage;
        var Creator = /** @class */ (function () {
            function Creator(type) {
                this.type = type;
            }
            Creator.prototype.req = function (req) {
                return {
                    module: OMApi.Module,
                    type: this.type,
                    json: JSON.stringify(req)
                };
            };
            Creator.prototype.res = function (msg) {
                var res = JSON.parse(msg.json);
                return res;
            };
            return Creator;
        }());
        OMApi.Creator = Creator;
        OMApi.Messages = {
            createDocument: new Creator('createDocument'),
            createDocumentEx: new Creator('createDocumentEx'),
            getFields: new Creator('getFields'),
            setFields: new Creator('setFields'),
            getCurrentDocumentId: new Creator('getCurrentDocumentId'),
        };
    })(OMApi = OMWebPluginLib.OMApi || (OMWebPluginLib.OMApi = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=api.js.map