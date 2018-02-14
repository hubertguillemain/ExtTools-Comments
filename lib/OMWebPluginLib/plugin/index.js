"use strict";
var OMWebPluginLib;
(function (OMWebPluginLib) {
    var Plugin;
    (function (Plugin) {
        function decodeUrlParams() {
            var search = window.location.search;
            var qs = search.split("+").join(" ");
            var params = {};
            var regex = /[?&]?([^=]+)=([^&]*)/g;
            var tokens;
            while (tokens = regex.exec(qs)) {
                if (!tokens || tokens.length < 1) {
                    continue;
                }
                var key = decodeURIComponent(tokens[1]);
                if (!tokens || tokens.length > 1) {
                    var value = decodeURIComponent(tokens[2]);
                    params[key] = value;
                }
            }
            return params;
        }
        /**
         */
        var SamePageBuilder = /** @class */ (function () {
            function SamePageBuilder() {
                var urlParams = decodeUrlParams();
                this._config = {
                    urlParams: urlParams
                };
            }
            SamePageBuilder.create = function () {
                return new SamePageBuilder();
            };
            SamePageBuilder.prototype.getPluginConfig = function () {
                var json = this._config.urlParams[OMWebPluginLib.UrlParams.PluginConfig];
                if (!json)
                    return null;
                var result = JSON.parse(json);
                return result;
            };
            SamePageBuilder.prototype.getUrlProps = function () {
                return this._config.urlParams;
            };
            /** Register notify handler
             * @param handler
             * @param moduleFilter - if set filter messages by module
             */
            SamePageBuilder.prototype.onNotify = function (handler, moduleFilter) {
                this._config.onNotify = handler;
                return this;
            };
            SamePageBuilder.prototype.getProps = function () {
                return this._config;
            };
            return SamePageBuilder;
        }());
        Plugin.SamePageBuilder = SamePageBuilder;
        var SamePagePlugin = /** @class */ (function () {
            function SamePagePlugin(channel) {
                this._isReady = false;
                this._channel = channel;
                this._isReady = true;
            }
            Object.defineProperty(SamePagePlugin.prototype, "isReady", {
                get: function () {
                    return this._isReady;
                },
                enumerable: true,
                configurable: true
            });
            SamePagePlugin.prototype.getChannel = function () {
                return this._channel;
            };
            SamePagePlugin.prototype.postNotify = function (module, type, payload) {
                var msg = {
                    module: module,
                    type: type,
                    json: !!payload ? JSON.stringify(payload) : undefined
                };
                this._channel.postMessage(msg);
            };
            SamePagePlugin.prototype.getApi = function () {
                return new OMWebPluginLib.Host.ApiModule(this._channel);
            };
            return SamePagePlugin;
        }());
        function createPlugin(builder) {
            var props = builder.getProps();
            var channel = new OMWebPluginLib.Host.ParentChannel(props.onNotify);
            var plugin = new SamePagePlugin(channel);
            window.setTimeout(function () {
                plugin.isReady && plugin.postNotify(OMWebPluginLib.Notify.Lifecycle.Module, OMWebPluginLib.Notify.Lifecycle.Ready);
            }, 0);
            return plugin;
        }
        Plugin.createPlugin = createPlugin;
        /**
         * Normally it is responsibility of the client to destroy plugin instance.
         * @param plugin - instance
         */
        function destroyPlugin(plugin) {
            if (plugin instanceof SamePagePlugin) {
                plugin.getChannel().close();
            }
        }
        Plugin.destroyPlugin = destroyPlugin;
    })(Plugin = OMWebPluginLib.Plugin || (OMWebPluginLib.Plugin = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=index.js.map