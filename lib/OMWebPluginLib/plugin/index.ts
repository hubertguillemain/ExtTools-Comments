namespace OMWebPluginLib {
    export namespace Plugin {
        function decodeUrlParams(): Readonly<StringKeyValueObject> {
            var search: string = window.location.search;
            var qs: string = search.split("+").join(" ");
            var params: StringKeyValueObject = {}

            var regex: RegExp = /[?&]?([^=]+)=([^&]*)/g;
            var tokens: RegExpExecArray | null;
            while (tokens = regex.exec(qs)) {
                if (!tokens || tokens.length < 1) {
                    continue;
                }
                var key: string = decodeURIComponent(tokens[1]);
                if (!tokens || tokens.length > 1) {
                    const value = decodeURIComponent(tokens[2]);
                    params[key] = value;
                }
            }
            return params
        }

        export type OnNotifyHandler = Notify.OnNotifyHandler

        type BuilderProps = {
            onNotify?: OnNotifyHandler,
            urlParams: Readonly<StringKeyValueObject>
        }

        /**
         */
        export class SamePageBuilder {
            private _config: BuilderProps

            static create() {
                return new SamePageBuilder()
            }

            constructor() {
                const urlParams = decodeUrlParams()
                this._config = {
                    urlParams
                }
            }

            getPluginConfig(): any {
                const json = this._config.urlParams[UrlParams.PluginConfig];
                if (!json)
                    return null
                const result = JSON.parse(json)
                return result
            }

            getUrlProps(): Readonly<StringKeyValueObject> {
                return this._config.urlParams;
            }

            /** Register notify handler
             * @param handler
             * @param moduleFilter - if set filter messages by module
             */
            onNotify(handler: OnNotifyHandler, moduleFilter?: string): SamePageBuilder {
                this._config.onNotify = handler
                return this
            }

            getProps(): Readonly<{}> {
                return this._config
            }
        }

        export type Builder = SamePageBuilder


        export interface IPlugin {
            /** Sends notification message to a client.
             * The client needs to undestand the message
             */
            postNotify(module: string, type: string, payload?: Notify.NotifyPayload): void;

            getApi(): OMApi.IApi;
        }

        class SamePagePlugin implements IPlugin {
            private readonly _channel: Host.IChannel;
            private _isReady = false;

            constructor(channel: Host.IChannel) {
                this._channel = channel
                this._isReady = true
            }

            get isReady(): boolean {
                return this._isReady;
            }

            getChannel() {
                return this._channel
            }

            postNotify(module: string, type: string, payload?: Notify.NotifyPayload): void {
                const msg: Notify.NotifyMessage = {
                    module,
                    type,
                    json: !!payload ? JSON.stringify(payload) : undefined
                }
                this._channel.postMessage(msg)
            }

            getApi(): OMApi.IApi {
                return new Host.ApiModule(this._channel)
            }
        }

        export function createPlugin(builder: Builder): IPlugin {
            const props = builder.getProps() as Readonly<BuilderProps>
            const channel = new Host.ParentChannel(props.onNotify)
            const plugin = new SamePagePlugin(channel)
            window.setTimeout(() => {
                plugin.isReady && plugin.postNotify(Notify.Lifecycle.Module, Notify.Lifecycle.Ready)
            }, 0)
            return plugin
        }

        /**
         * Normally it is responsibility of the client to destroy plugin instance. 
         * @param plugin - instance
         */
        export function destroyPlugin(plugin: IPlugin): void {
            if (plugin instanceof SamePagePlugin) {
                plugin.getChannel().close()
            }
        }
    }
}