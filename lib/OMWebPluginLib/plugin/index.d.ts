declare namespace OMWebPluginLib {
    namespace Plugin {
        type OnNotifyHandler = Notify.OnNotifyHandler;
        /**
         */
        class SamePageBuilder {
            private _config;
            static create(): SamePageBuilder;
            constructor();
            getPluginConfig(): any;
            getUrlProps(): Readonly<StringKeyValueObject>;
            /** Register notify handler
             * @param handler
             * @param moduleFilter - if set filter messages by module
             */
            onNotify(handler: OnNotifyHandler, moduleFilter?: string): SamePageBuilder;
            getProps(): Readonly<{}>;
        }
        type Builder = SamePageBuilder;
        interface IPlugin {
            /** Sends notification message to a client.
             * The client needs to undestand the message
             */
            postNotify(module: string, type: string, payload?: Notify.NotifyPayload): void;
            getApi(): OMApi.IApi;
        }
        function createPlugin(builder: Builder): IPlugin;
        /**
         * Normally it is responsibility of the client to destroy plugin instance.
         * @param plugin - instance
         */
        function destroyPlugin(plugin: IPlugin): void;
    }
}
