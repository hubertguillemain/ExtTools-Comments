namespace OMWebPluginLib {
    export function throwNotImplemented(): never {
        throw new Error('not implemented')
    }

    export namespace Log {
        export function warn(message: any, ...args: any[]) {
            console.warn(format([message, ...args]))
        }

        export function error(message: any, ...args: any[]) {
            console.error(format([message, ...args]))
        }

        export function info(message: any, ...args: any[]) {
            console.info(format([message, ...args]))
        }

        function format(...args: any[]): string {      //TODO improve formatting
            const formatted = args.map(x => String(x)).join(' ,')
            return `OMWebPluginLib: ${formatted}`
        }

    }

    export type StringKeyValueObject = { [index: string]: string }

    export namespace UrlParams {
        export const Channel = "channel"
        export const PluginConfig = "pluginconfig"

        export const CefChannel = "cef"                 //win client native
        export const WebPostParentChannel = "parent"    //web post message
        export const WebPostOpenerChannel = "opener"    //web post message
        /** Channel specifies how are messages transfered between client and plugin.
         * Channel must support both directions.
        */
        export type Channel = typeof CefChannel | typeof WebPostParentChannel | typeof WebPostOpenerChannel
    }

    export namespace Message {
        export const Protocol: string = "omwebplugin"; // current name
        export const Version: number = 1;              // current version
        export type XMLString = string;

        export interface IRawMessage {
            readonly protocol: typeof Protocol;
            readonly version: typeof Version;
            readonly payload: {};
        }

        //export interface ITypedRawMessage<T> extends IRawMessage {
        //    readonly payload: T;
        //}

        export interface IRawReqMessage extends IRawMessage {
            readonly requestId: number;        //unique for a plugin instance (managed by channel)
        }

        export interface IRawResMessage extends IRawMessage {
            readonly responseId: number;       //unique for a plugin instance (managed by channel)
            readonly isError?: boolean;
        }

        export interface IMessage {
            readonly module: string;
            readonly type: string;
        }

        export interface IError {
            message: string;
            stack?: string;
            inner?: IError;
        }

        export function isRawMessage(msg: any): msg is IRawMessage {
            const m = msg as IRawMessage
            return typeof m === 'object' && m.protocol === Protocol && typeof m.version === 'number' &&
                m.version >= Version && typeof m.payload === 'object'
        }

        export function isRequest(msg: IRawMessage): msg is IRawReqMessage {
            const m = msg as IRawReqMessage
            return typeof m.requestId === 'number'
        }

        export function isResponse(msg: IRawMessage): msg is IRawResMessage {
            const m = msg as IRawResMessage
            return typeof m.responseId === 'number'
        }

        export function isMessage(rawPayload: {}): rawPayload is IMessage {
            const p = rawPayload as IMessage
            return typeof p.module === 'string' && typeof p.type === 'string'
        }

        export function isError(reason: {}): reason is IError {
            const e = reason as IError
            return typeof e === 'object' && typeof e.message === 'string' && !!e.message
        }
    }

    /** Namespace defines common notifications
     */
    export namespace Notify {
        //| 'flashnotes' | 'workflows'
        export namespace Lifecycle {
            export const Module = 'lifecycle'
            //sent to client after plugin successfully created (sent in next tick)
            export const Ready = 'ready'
        }

        export namespace View {
            export const Module = 'view'
            //scrollWidth and scrollHeight
            export const ContentSize = 'contentsize'
            export type ContentSizeData = {
                width: number;
                height: number;
            }
        }

        export namespace Board {
            export const Module = 'board'
            export const SetWidgetConfig = 'setWidgetConfig'
            export const SetFederatedSearch = 'setFederatedSearch'
        }

        export namespace UserAction {
            export const Module = 'useraction'
            export const OK = 'ok'
            export const Cancel = 'cancel'
            export type Type = typeof OK | typeof Cancel
        }

        export type NotifyPayload = {}
        export type NotifyMessage = Message.IMessage & { readonly json?: string }

        export function parsePayload(msg: Message.IMessage): {} | null {
            const json = (msg as NotifyMessage).json
            if (!json || typeof json !== 'string')
                return null
            const p = JSON.parse(json)
            return typeof p === 'object' ? p as {} : null
        }

        export type OnNotifyHandler = (msg: Message.IMessage) => void

        //export interface RawNotifyMessage extends Message.IRawPayloadMessage<NotifyMessage> {
        //    readonly kind: Message.RawMessageKind.notify;
        //}

        //export function createRawNotifyMessage(payload: NotifyMessage): RawNotifyMessage {
        //    return {
        //        kind: Message.RawMessageKind.notify,
        //        protocol: Message.Protocol,
        //        version: Message.Version,
        //        payload
        //    }
        //}

        //export function isRawNotify(arg: any): arg is RawNotifyMessage {
        //    return Message.isRawNotify(arg) &&
        //        arg.kind === Message.RawMessageKind.notify &&
        //        !!arg.payload
        //}
    }
}