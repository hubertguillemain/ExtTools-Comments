declare namespace OMWebPluginLib {
    namespace Host {
        class ApiModule implements OMApi.IApi {
            private readonly _channel;
            constructor(channel: IChannel);
            createDocument(templateId: number, folderLoId: number, poolId: number, systemId?: string): Promise<OMApi.DocumentId>;
            createDocumentEx(templateId: number, folder: OMApi.DocumentId, fields: ReadonlyArray<OMApi.Field>): Promise<OMApi.DocumentId>;
            getFields(docId: OMApi.DocumentId, fieldIds: ReadonlyArray<OMApi.FieldId>): Promise<OMApi.Field[]>;
            setFields(docId: OMApi.DocumentId, fields: ReadonlyArray<OMApi.Field>): Promise<void>;
            getCurrentDocumentId(): Promise<OMApi.DocumentId>;
            call<TType extends string, TReq, TRes>(creator: OMApi.Creator<TType, TReq, TRes>, req: TReq): Promise<TRes>;
        }
    }
}
