declare namespace OMWebPluginLib {
    function throwNotImplemented(): never;
    namespace Log {
        function warn(message: any, ...args: any[]): void;
        function error(message: any, ...args: any[]): void;
        function info(message: any, ...args: any[]): void;
    }
    type StringKeyValueObject = {
        [index: string]: string;
    };
    namespace UrlParams {
        const Channel = "channel";
        const PluginConfig = "pluginconfig";
        const CefChannel = "cef";
        const WebPostParentChannel = "parent";
        const WebPostOpenerChannel = "opener";
        /** Channel specifies how are messages transfered between client and plugin.
         * Channel must support both directions.
        */
        type Channel = typeof CefChannel | typeof WebPostParentChannel | typeof WebPostOpenerChannel;
    }
    namespace Message {
        const Protocol: string;
        const Version: number;
        type XMLString = string;
        interface IRawMessage {
            readonly protocol: typeof Protocol;
            readonly version: typeof Version;
            readonly payload: {};
        }
        interface IRawReqMessage extends IRawMessage {
            readonly requestId: number;
        }
        interface IRawResMessage extends IRawMessage {
            readonly responseId: number;
            readonly isError?: boolean;
        }
        interface IMessage {
            readonly module: string;
            readonly type: string;
        }
        interface IError {
            message: string;
            stack?: string;
            inner?: IError;
        }
        function isRawMessage(msg: any): msg is IRawMessage;
        function isRequest(msg: IRawMessage): msg is IRawReqMessage;
        function isResponse(msg: IRawMessage): msg is IRawResMessage;
        function isMessage(rawPayload: {}): rawPayload is IMessage;
        function isError(reason: {}): reason is IError;
    }
    /** Namespace defines common notifications
     */
    namespace Notify {
        namespace Lifecycle {
            const Module = "lifecycle";
            const Ready = "ready";
        }
        namespace View {
            const Module = "view";
            const ContentSize = "contentsize";
            type ContentSizeData = {
                width: number;
                height: number;
            };
        }
        namespace Board {
            const Module = "board";
            const SetWidgetConfig = "setWidgetConfig";
            const SetFederatedSearch = "setFederatedSearch";
        }
        namespace UserAction {
            const Module = "useraction";
            const OK = "ok";
            const Cancel = "cancel";
            type Type = typeof OK | typeof Cancel;
        }
        type NotifyPayload = {};
        type NotifyMessage = Message.IMessage & {
            readonly json?: string;
        };
        function parsePayload(msg: Message.IMessage): {} | null;
        type OnNotifyHandler = (msg: Message.IMessage) => void;
    }
}
