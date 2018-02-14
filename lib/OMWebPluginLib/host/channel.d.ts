declare namespace OMWebPluginLib {
    namespace Host {
        interface IChannel {
            close(): any;
            postMessage(msg: Message.IMessage): any;
            sendRequest(msg: Message.IMessage): Promise<Message.IMessage>;
        }
        /** Base channel implementation for plugins hosted in a web app
         */
        abstract class WindowChannel implements IChannel {
            private readonly _target;
            private readonly _onNotify?;
            private _pending;
            private _queue;
            constructor(target: Window, onNotify?: Notify.OnNotifyHandler);
            close(): void;
            /** Sends a notification message. A notification is only one way call.
             * The paramter could also be a generic IMessage in the future.
             */
            postMessage(msg: Message.IMessage): void;
            /**
             * Sends a request message. For every request message one response message is expected to be received.
             * @param msg
             */
            sendRequest(msg: Message.IMessage): Promise<Message.IMessage>;
            onMessage: (e: MessageEvent) => void;
            private processOutgoing(raw, pending?);
            private processIncoming(raw);
            onResponse(rawRes: Message.IRawResMessage): void;
            private enqueue(raw, isOutgoing, pending?);
            private processMessageQueue();
        }
        /** Channel for plugins running in an iframe
         */
        class ParentChannel extends WindowChannel {
            constructor(onNotify?: Notify.OnNotifyHandler);
        }
        /** Channel for plugins running in a new tab
         */
        class OpenerChannel extends WindowChannel {
            constructor(onNotify?: Notify.OnNotifyHandler);
        }
    }
}
