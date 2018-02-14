namespace OMWebPluginLib {
    export namespace Host {
        const newRequestId = (function () {
            let _seqRequestId: number = 0;
            return () => ++_seqRequestId
        })()

        export interface IChannel {
            close();
            postMessage(msg: Message.IMessage);
            sendRequest(msg: Message.IMessage): Promise<Message.IMessage>;
        }

        type Pending = {
            requestId: number;
            resolve: (msg: Message.IMessage) => void;
            reject: (reason: any) => void;
        }

        type QueueItem = {
            raw: Message.IRawMessage;
            isOutgoing: boolean;
            pending?: Pending;
        }

        /** Base channel implementation for plugins hosted in a web app
         */
        export abstract class WindowChannel implements IChannel {
            //TODO support timeout
            //TODO support sequential processing (queue)
            private readonly _target: Window
            private readonly _onNotify?: Notify.OnNotifyHandler
            private _pending: Pending | null | undefined
            private _queue: QueueItem[] = []

            constructor(target: Window, onNotify?: Notify.OnNotifyHandler) {
                const err = 'Plugin channel cannot be initialised: '
                if (!target) {
                    throw new Error(err + 'Missing reference to a client window object')
                }
                else if (target === window) {
                    throw new Error(err + 'Plugin window object and client window object are the same')
                }

                this._target = target
                this._onNotify = onNotify

                window.addEventListener('message', this.onMessage)
            }

            close() {
                window.removeEventListener('message', this.onMessage)
            }
            /** Sends a notification message. A notification is only one way call.
             * The paramter could also be a generic IMessage in the future.
             */
            postMessage(msg: Message.IMessage) {
                const raw: Message.IRawMessage = {
                    protocol: Message.Protocol,
                    version: Message.Version,
                    payload: msg
                }
                this.processOutgoing(raw)
            }

            /**
             * Sends a request message. For every request message one response message is expected to be received.
             * @param msg
             */
            sendRequest(msg: Message.IMessage): Promise<Message.IMessage> { //TODO DEBUG review and improve
                const requestId = newRequestId();
                const raw: Message.IRawReqMessage = {
                    protocol: Message.Protocol,
                    version: Message.Version,
                    requestId,
                    payload: msg
                }

                let pending = (null as any) as Pending
                const p = new Promise<Message.IMessage>((resolve, reject) => {
                    pending = {
                        requestId,
                        resolve,
                        reject
                    }
                })

                this.processOutgoing(raw, pending)
                return p
            }

            onMessage = (e: MessageEvent) => {
                if (e.source !== this._target)    //ignore unknown sources
                    return;

                const raw = e.data
                if (!Message.isRawMessage(raw))     //ignore unknown messages
                    return;

                this.processIncoming(raw)
            }

            private processOutgoing(raw: Message.IRawMessage, pending?: Pending) {
                if (!!this._pending) {
                    this.enqueue(raw, true, pending)
                    return
                }

                this._pending = pending
                this._target.postMessage(raw, '*');       //TODO DEBUG proper target origin
            }

            private processIncoming(raw: Message.IRawMessage) {
                if (Message.isRequest(raw)) {
                    throwNotImplemented();
                }
                else if (Message.isResponse(raw)) {
                    this.onResponse(raw)        //process response directly
                }
                else {
                    if (!!this._pending) {
                        this.enqueue(raw, false)
                        return
                    }

                    const rawPayload = raw.payload
                    if (Message.isMessage(rawPayload)) {
                        this._onNotify && this._onNotify(rawPayload)
                    }
                    else {
                        Log.warn('Notify message ignored', rawPayload)
                    }
                }
            }

            onResponse(rawRes: Message.IRawResMessage) {
                const rawPayload = rawRes.payload
                if (!!this._pending && rawRes.responseId === this._pending.requestId) {
                    const pending = this._pending
                    this._pending = null

                    if (rawRes.isError) {
                        pending.reject(rawPayload)
                    }
                    else if (Message.isMessage(rawPayload)) {
                        pending.resolve(rawPayload)
                    }
                    else {
                        Log.error('Invalid response message', rawPayload)
                    }

                    this.processMessageQueue()
                }
                else {
                    Log.error('Unexpected response message or response after timeout', rawPayload)
                }
            }

            private enqueue(raw: Message.IRawMessage, isOutgoing: boolean, pending?: Pending) {
                const item: QueueItem = {
                    raw,
                    isOutgoing,
                    pending
                }
                this._queue.push(item)
            }

            private processMessageQueue() {
                while (!this._pending && this._queue.length > 0) {
                    const item = this._queue.splice(0, 1)[0]

                    if (item.isOutgoing) {
                        this.processOutgoing(item.raw, item.pending)
                    }
                    else {
                        this.processIncoming(item.raw)
                    }
                }
            }
        }

        /** Channel for plugins running in an iframe
         */
        export class ParentChannel extends WindowChannel {
            constructor(onNotify?: Notify.OnNotifyHandler) {
                super(window.parent, onNotify)
            }
        }

        /** Channel for plugins running in a new tab
         */
        export class OpenerChannel extends WindowChannel {
            constructor(onNotify?: Notify.OnNotifyHandler) {
                super(window.opener as Window, onNotify)
            }
        }

    }
}