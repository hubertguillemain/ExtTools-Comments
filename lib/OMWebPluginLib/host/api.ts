namespace OMWebPluginLib {
    export namespace Host {

        export class ApiModule implements OMApi.IApi {
            private readonly _channel: IChannel
            constructor(channel: IChannel) {
                this._channel = channel
            }

            createDocument(templateId: number, folderLoId: number, poolId: number, systemId?: string) {
                return this.call(OMApi.Messages.createDocument,
                    { templateId, folderLoId, poolId, systemId })
            }

            createDocumentEx(templateId: number, folder: OMApi.DocumentId, fields: ReadonlyArray<OMApi.Field>) {
                return this.call(OMApi.Messages.createDocumentEx,
                    { templateId, folder, fields })
            }

            getFields(docId: OMApi.DocumentId, fieldIds: ReadonlyArray<OMApi.FieldId>) {
                return this.call(OMApi.Messages.getFields,
                    { docId, fieldIds })
            }

            setFields(docId: OMApi.DocumentId, fields: ReadonlyArray<OMApi.Field>) {
                return this.call(OMApi.Messages.setFields,
                { docId, fields })
            }

            getCurrentDocumentId() {
                return this.call(OMApi.Messages.getCurrentDocumentId, null)
            }

            call<TType extends string, TReq, TRes>(creator: OMApi.Creator<TType, TReq, TRes>, req: TReq): Promise<TRes> {
                const reqMsg = creator.req(req)
                return this._channel.sendRequest(reqMsg).then(msg => {
                    const res = creator.res(msg as OMApi.ApiMessage)
                    return res
                })
            }
        }
    }
}