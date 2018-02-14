namespace OMWebPluginLib {
    /** API types
     */
    export namespace OMApi {
        export type DocumentId = {
            readonly lowId: number;
            readonly poolId: number;
            readonly systemId: string;
        }

        export interface IApi {
            createDocument(templateId: number, folderLoId: number, poolId: number, systemId?: string): Promise<DocumentId>;
            createDocumentEx(templateId: number, folder: DocumentId, fields: ReadonlyArray<OMApi.Field>): Promise<DocumentId>;

            getFields(docId: DocumentId, fieldIds: ReadonlyArray<FieldId>): Promise<Field[]>;
            setFields(docId: DocumentId, fields: ReadonlyArray<Field>): Promise<void>;

            getCurrentDocumentId(): Promise<OMApi.DocumentId>;
        }

        export type FieldId = {
            readonly id: number;
            readonly recordId?: number;
        }

        export type FieldType = 'string' | 'int'

        export interface IField {
            readonly type: FieldType
            readonly fieldId: FieldId;
        }

        /** Field value types always must be able to represent 'empty' value
        */
        export type StringFieldValue = string | null
        export interface StringField extends IField {
            readonly type: 'string';
            readonly value: StringFieldValue;
        }

        export type IntFieldValue = number | null
        export interface IntField extends IField {
            readonly type: 'int';
            readonly value: IntFieldValue;
        }

        export type Field = StringField | IntField

        export function stringField(value: StringFieldValue, fieldId: number, recordId?: number): StringField {
            return {
                type: 'string',
                fieldId: { id: fieldId, recordId },
                value
            }
        }

        export function intField(value: IntFieldValue, fieldId: number, recordId?: number): IntField {
            return {
                type: 'int',
                fieldId: { id: fieldId, recordId },
                value
            }
        }

        //export interface IDocument {
        //    setFields(fields: ReadonlyArray<Field>): Promise<void>
        //}
    }

    /** API calls
     */
    export namespace OMApi {
        export type ApiMessage = Message.IMessage & { readonly json: string }
        export const Module = 'api'

        export function isApiMessage(msg: Message.IMessage): msg is ApiMessage {
            return typeof msg === 'object' && typeof (msg as ApiMessage).json === 'string'
        }

        export class Creator<TType extends string, TReq, TRes> {
            readonly type: TType;

            constructor(type: TType) {
                this.type = type;
            }

            req(req: TReq): ApiMessage {
                return {
                    module: Module,
                    type: this.type,
                    json: JSON.stringify(req)
                }
            }

            res(msg: ApiMessage): TRes {
                const res = JSON.parse(msg.json) as TRes
                return res
            }
        }

        export const Messages = {
            createDocument: new Creator<'createDocument',
                { templateId: number, folderLoId: number, poolId: number, systemId?: string },
                DocumentId>('createDocument'),

            createDocumentEx: new Creator<'createDocumentEx',
                { templateId: number, folder: DocumentId, fields: ReadonlyArray<Field> },
                DocumentId>('createDocumentEx'),

            getFields: new Creator<'getFields',
                { docId: DocumentId, fieldIds: ReadonlyArray<FieldId> },
                Field[]>('getFields'),

            setFields: new Creator<'setFields',
                { docId: DocumentId, fields: ReadonlyArray<Field> },
                void>('setFields'),

            getCurrentDocumentId: new Creator<'getCurrentDocumentId',
                null,
                DocumentId>('getCurrentDocumentId'),
        }
    }
}