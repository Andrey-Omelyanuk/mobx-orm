declare class Query<M extends Model> {
    private model;
    items: M[];
    filters: object;
    order_by: string[];
    page: number;
    page_size: number;
    is_ready: boolean;
    is_updating: boolean;
    error: string;
    private disposers;
    private disposer_objects;
    constructor(model: any, filters?: object, order_by?: string[], page?: number, page_size?: number);
    destroy(): void;
    update(): Promise<M[]>;
    private should_be_in_the_list;
    ready(): Promise<Boolean>;
}

declare abstract class Model {
    private static ids;
    private static adapter;
    private static cache;
    private static fields;
    static load(filter?: {}, order_by?: string[], page?: number, page_size?: number): Query<Model>;
    static clearCache(): void;
    static __id(obj: any, ids: []): string | null;
    private readonly _init_data;
    private disposers;
    constructor(...args: any[]);
    get __id(): string | null;
    get model(): any;
    save(): Promise<any>;
    delete(): Promise<void>;
    inject(): void;
    eject(): void;
}
declare function model(constructor: any): any;

interface Adapter<M extends Model> {
    save: (obj: M) => Promise<M>;
    delete: (obj: M) => Promise<M>;
    load: (where: any, order_by: any, limit: any, offset: any) => Promise<M[]>;
}

declare class LocalAdapter<M extends Model> implements Adapter<M> {
    private cls;
    private store_name;
    constructor(cls: any, store_name: string);
    save(obj: M): Promise<M>;
    delete(obj: M): Promise<any>;
    load(where?: {}, order_by?: any[], limit?: number, offset?: number): Promise<M[]>;
}
declare function local(api: string): (cls: any) => void;

declare class RestAdapter<M extends Model> implements Adapter<M> {
    private cls;
    private http;
    private api;
    constructor(cls: any, http: any, api: string);
    save(obj: M): Promise<M>;
    delete(obj: M): Promise<any>;
    load(where?: {}, order_by?: any[], limit?: number, offset?: number): Promise<M[]>;
}
declare function rest(http: any, api: string): (cls: any) => void;

declare function id(cls: any, field_name: string): void;

declare function field(cls: any, field_name: string): void;

declare function foreign(foreign_model: any, ...foreign_ids_names: string[]): (cls: any, field_name: string) => void;

declare function one(remote_model: any, ...remote_foreign_ids_names: string[]): (cls: any, field_name: string) => void;

declare function many(remote_model: any, ...remote_foreign_ids_names: string[]): (cls: any, field_name: string) => void;

export { Adapter, LocalAdapter, Model, Query, RestAdapter, field, foreign, id, local, many, model, one, rest };
