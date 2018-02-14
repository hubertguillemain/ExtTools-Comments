declare namespace OMWebPluginLib {
    /** API types
     */
    namespace OMApi {
        type DocumentId = {
            readonly lowId: number;
            readonly poolId: number;
            readonly systemId: string;
        };
        interface IApi {
            createDocument(templateId: number, folderLoId: number, poolId: number, systemId?: string): Promise<DocumentId>;
            createDocumentEx(templateId: number, folder: DocumentId, fields: ReadonlyArray<OMApi.Field>): Promise<DocumentId>;
            getFields(docId: DocumentId, fieldIds: ReadonlyArray<FieldId>): Promise<Field[]>;
            setFields(docId: DocumentId, fields: ReadonlyArray<Field>): Promise<void>;
            getCurrentDocumentId(): Promise<OMApi.DocumentId>;
        }
        type FieldId = {
            readonly id: number;
            readonly recordId?: number;
        };
        type FieldType = 'string' | 'int';
        interface IField {
            readonly type: FieldType;
            readonly fieldId: FieldId;
        }
        /** Field value types always must be able to represent 'empty' value
        */
        type StringFieldValue = string | null;
        interface StringField extends IField {
            readonly type: 'string';
            readonly value: StringFieldValue;
        }
        type IntFieldValue = number | null;
        interface IntField extends IField {
            readonly type: 'int';
            readonly value: IntFieldValue;
        }
        type Field = StringField | IntField;
        function stringField(value: StringFieldValue, fieldId: number, recordId?: number): StringField;
        function intField(value: IntFieldValue, fieldId: number, recordId?: number): IntField;
    }
    /** API calls
     */
    namespace OMApi {
        type ApiMessage = Message.IMessage & {
            readonly json: string;
        };
        const Module = "api";
        function isApiMessage(msg: Message.IMessage): msg is ApiMessage;
        class Creator<TType extends string, TReq, TRes> {
            readonly type: TType;
            constructor(type: TType);
            req(req: TReq): ApiMessage;
            res(msg: ApiMessage): TRes;
        }
        const Messages: {
            createDocument: Creator<"createDocument", {
                templateId: number;
                folderLoId: number;
                poolId: number;
                systemId?: string | undefined;
            }, DocumentId>;
            createDocumentEx: Creator<"createDocumentEx", {
                templateId: number;
                folder: DocumentId;
                fields: ReadonlyArray<Field>;
            }, DocumentId>;
            getFields: Creator<"getFields", {
                docId: DocumentId;
                fieldIds: ReadonlyArray<FieldId>;
            }, Field[]>;
            setFields: Creator<"setFields", {
                docId: DocumentId;
                fields: ReadonlyArray<Field>;
            }, void>;
            getCurrentDocumentId: Creator<"getCurrentDocumentId", null, DocumentId>;
        };
    }
}
