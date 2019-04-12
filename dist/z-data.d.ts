

export declare class Model {
    static get(id: number): Model;
    static all(): Model[];
    static load(where?: {}, order_by?: {}, limit?: number, offset?: number): Promise<any>;
    private readonly _init_data;
    constructor(init_data?: any);
    save(): Promise<any>;
    delete(): Promise<any>;
}
export declare function model(cls: any): any;


interface FieldTypeDecorator {
    (model_name: string, field_name: string, obj: Object): void;
}
interface ModelDescription {
    fields: {
        [field_name: string]: {
            type: string;
            settings: any;
        };
    };
    objects: {
        [id: number]: object;
    };
    unique: {
        [field_name: string]: any;
    };
    getNewId: () => number;
    save: undefined | ((obj: any) => any);
    delete: undefined | ((obj: any) => any);
    load: undefined | ((model_name: any, where: any, order_by: any, limit: any, offset: any) => any);
}
export declare class Store {
    debug: boolean;
    models: {
        [model_name: string]: ModelDescription;
    };
    field_types: {
        [type_name: string]: FieldTypeDecorator;
    };
    registerModel(model_name: any): void;
    registerFieldType(type: any, decorator: any): void;
    registerModelField(model_name: any, type: any, field_name: any, settings: any): void;
    inject(model_name: any, object: any): void;
    eject(model_name: any, object: any): void;
    clear(): void;
    clearModel(model_name: any): void;
}
export declare let store: Store;



export declare function registerField(): void;


export declare function registerForeign(): void;


export declare function registerFieldId(): void;


export declare function registerMany(): void;


export declare function registerOne(): void;

export declare function adapter(): (cls: any) => void;




