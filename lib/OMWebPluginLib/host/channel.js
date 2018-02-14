"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var OMWebPluginLib;
(function (OMWebPluginLib) {
    var Host;
    (function (Host) {
        var newRequestId = (function () {
            var _seqRequestId = 0;
            return function () { return ++_seqRequestId; };
        })();
        /** Base channel implementation for plugins hosted in a web app
         */
        var WindowChannel = /** @class */ (function () {
            function WindowChannel(target, onNotify) {
                var _this = this;
                this._queue = [];
                this.onMessage = function (e) {
                    if (e.source !== _this._target)
                        return;
                    var raw = e.data;
                    if (!OMWebPluginLib.Message.isRawMessage(raw))
                        return;
                    _this.processIncoming(raw);
                };
                var err = 'Plugin channel cannot be initialised: ';
                if (!target) {
                    throw new Error(err + 'Missing reference to a client window object');
                }
                else if (target === window) {
                    throw new Error(err + 'Plugin window object and client window object are the same');
                }
                this._target = target;
                this._onNotify = onNotify;
                window.addEventListener('message', this.onMessage);
            }
            WindowChannel.prototype.close = function () {
                window.removeEventListener('message', this.onMessage);
            };
            /** Sends a notification message. A notification is only one way call.
             * The paramter could also be a generic IMessage in the future.
             */
            WindowChannel.prototype.postMessage = function (msg) {
                var raw = {
                    protocol: OMWebPluginLib.Message.Protocol,
                    version: OMWebPluginLib.Message.Version,
                    payload: msg
                };
                this.processOutgoing(raw);
            };
            /**
             * Sends a request message. For every request message one response message is expected to be received.
             * @param msg
             */
            WindowChannel.prototype.sendRequest = function (msg) {
                var requestId = newRequestId();
                var raw = {
                    protocol: OMWebPluginLib.Message.Protocol,
                    version: OMWebPluginLib.Message.Version,
                    requestId: requestId,
                    payload: msg
                };
                var pending = null;
                var p = new Promise(function (resolve, reject) {
                    pending = {
                        requestId: requestId,
                        resolve: resolve,
                        reject: reject
                    };
                });
                this.processOutgoing(raw, pending);
                return p;
            };
            WindowChannel.prototype.processOutgoing = function (raw, pending) {
                if (!!this._pending) {
                    this.enqueue(raw, true, pending);
                    return;
                }
                this._pending = pending;
                this._target.postMessage(raw, '*'); //TODO DEBUG proper target origin
            };
            WindowChannel.prototype.processIncoming = function (raw) {
                if (OMWebPluginLib.Message.isRequest(raw)) {
                    OMWebPluginLib.throwNotImplemented();
                }
                else if (OMWebPluginLib.Message.isResponse(raw)) {
                    this.onResponse(raw); //process response directly
                }
                else {
                    if (!!this._pending) {
                        this.enqueue(raw, false);
                        return;
                    }
                    var rawPayload = raw.payload;
                    if (OMWebPluginLib.Message.isMessage(rawPayload)) {
                        this._onNotify && this._onNotify(rawPayload);
                    }
                    else {
                        OMWebPluginLib.Log.warn('Notify message ignored', rawPayload);
                    }
                }
            };
            WindowChannel.prototype.onResponse = function (rawRes) {
                var rawPayload = rawRes.payload;
                if (!!this._pending && rawRes.responseId === this._pending.requestId) {
                    var pending = this._pending;
                    this._pending = null;
                    if (rawRes.isError) {
                        pending.reject(rawPayload);
                    }
                    else if (OMWebPluginLib.Message.isMessage(rawPayload)) {
                        pending.resolve(rawPayload);
                    }
                    else {
                        OMWebPluginLib.Log.error('Invalid response message', rawPayload);
                    }
                    this.processMessageQueue();
                }
                else {
                    OMWebPluginLib.Log.error('Unexpected response message or response after timeout', rawPayload);
                }
            };
            WindowChannel.prototype.enqueue = function (raw, isOutgoing, pending) {
                var item = {
                    raw: raw,
                    isOutgoing: isOutgoing,
                    pending: pending
                };
                this._queue.push(item);
            };
            WindowChannel.prototype.processMessageQueue = function () {
                while (!this._pending && this._queue.length > 0) {
                    var item = this._queue.splice(0, 1)[0];
                    if (item.isOutgoing) {
                        this.processOutgoing(item.raw, item.pending);
                    }
                    else {
                        this.processIncoming(item.raw);
                    }
                }
            };
            return WindowChannel;
        }());
        Host.WindowChannel = WindowChannel;
        /** Channel for plugins running in an iframe
         */
        var ParentChannel = /** @class */ (function (_super) {
            __extends(ParentChannel, _super);
            function ParentChannel(onNotify) {
                return _super.call(this, window.parent, onNotify) || this;
            }
            return ParentChannel;
        }(WindowChannel));
        Host.ParentChannel = ParentChannel;
        /** Channel for plugins running in a new tab
         */
        var OpenerChannel = /** @class */ (function (_super) {
            __extends(OpenerChannel, _super);
            function OpenerChannel(onNotify) {
                return _super.call(this, window.opener, onNotify) || this;
            }
            return OpenerChannel;
        }(WindowChannel));
        Host.OpenerChannel = OpenerChannel;
    })(Host = OMWebPluginLib.Host || (OMWebPluginLib.Host = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=channel.js.map