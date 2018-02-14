"use strict";
var OMWebPluginLib;
(function (OMWebPluginLib) {
    var Host;
    (function (Host) {
        var ApiModule = /** @class */ (function () {
            function ApiModule(channel) {
                this._channel = channel;
            }
            ApiModule.prototype.createDocument = function (templateId, folderLoId, poolId, systemId) {
                return this.call(OMWebPluginLib.OMApi.Messages.createDocument, { templateId: templateId, folderLoId: folderLoId, poolId: poolId, systemId: systemId });
            };
            ApiModule.prototype.createDocumentEx = function (templateId, folder, fields) {
                return this.call(OMWebPluginLib.OMApi.Messages.createDocumentEx, { templateId: templateId, folder: folder, fields: fields });
            };
            ApiModule.prototype.getFields = function (docId, fieldIds) {
                return this.call(OMWebPluginLib.OMApi.Messages.getFields, { docId: docId, fieldIds: fieldIds });
            };
            ApiModule.prototype.setFields = function (docId, fields) {
                return this.call(OMWebPluginLib.OMApi.Messages.setFields, { docId: docId, fields: fields });
            };
            ApiModule.prototype.getCurrentDocumentId = function () {
                return this.call(OMWebPluginLib.OMApi.Messages.getCurrentDocumentId, null);
            };
            ApiModule.prototype.call = function (creator, req) {
                var reqMsg = creator.req(req);
                return this._channel.sendRequest(reqMsg).then(function (msg) {
                    var res = creator.res(msg);
                    return res;
                });
            };
            return ApiModule;
        }());
        Host.ApiModule = ApiModule;
    })(Host = OMWebPluginLib.Host || (OMWebPluginLib.Host = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=api.js.map