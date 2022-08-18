declare abstract class Adapter<M extends Model> {
    abstract __create(raw_data: RawData): Promise<RawObject>;
    abstract __update(obj_id: string, only_changed_raw_data: RawData): Promise<RawObject>;
    abstract __delete(obj_id: string): Promise<void>;
    abstract __find(where: any): Promise<object>;
    abstract __load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<RawObject[]>;
    abstract getTotalCount(where?: any): Promise<number>;
    readonly model: any;
    constructor(model: any);
    create(obj: M): Promise<M>;
    update(obj: M): Promise<M>;
    delete(obj: M): Promise<M>;
    find(where: any): Promise<M>;
    load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<M[]>;
}

declare abstract class Filter {
    abstract get URLSearchParams(): URLSearchParams;
    abstract setFromURI(uri: string): void;
    abstract isMatch(obj: any): boolean;
}

declare enum ValueType {
    STRING = 0,
    NUMBER = 1,
    BOOL = 2
}
declare abstract class SingleFilter extends Filter {
    readonly field: string;
    value: any;
    readonly value_type: ValueType;
    options: Query$1<Model>;
    constructor(field: string, value?: any, value_type?: ValueType);
    get URLSearchParams(): URLSearchParams;
    abstract get URIField(): string;
    setFromURI(uri: string): void;
    abstract operator(value_a: any, value_b: any): boolean;
    isMatch(obj: any): boolean;
    serialize(value: string | undefined): void;
    deserialize(value?: any): string;
}

declare abstract class ComboFilter extends Filter {
    readonly filters: Filter[];
    constructor(filters?: Filter[]);
    get URLSearchParams(): URLSearchParams;
    setFromURI(uri: string): void;
}

declare function EQ(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare function NOT_EQ(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare function IN(field: string, value?: any[], value_type?: ValueType): SingleFilter;

declare function AND(...filters: Filter[]): Filter;

declare const ASC = true;
declare const DESC = false;
declare type ORDER_BY = Map<string, boolean>;
declare abstract class Query$2<M extends Model> {
    filters: Filter;
    order_by: ORDER_BY;
    page: number;
    page_size: number;
    need_to_update: boolean;
    abstract get items(): any;
    get is_loading(): boolean;
    get is_ready(): boolean;
    get error(): string;
    readonly __base_cache: any;
    readonly __adapter: Adapter<M>;
    __items: M[];
    __is_loading: boolean;
    __is_ready: boolean;
    __error: string;
    __disposers: (() => void)[];
    __disposer_objects: {
        [field: string]: () => void;
    };
    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY, page?: number, page_size?: number);
    destroy(): void;
    abstract __load(objs: M[]): any;
    load(): Promise<void>;
    shadowLoad(): Promise<void>;
    ready(): Promise<Boolean>;
    loading(): Promise<Boolean>;
}

declare class Query$1<M extends Model> extends Query$2<M> {
    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY);
    get items(): M[];
    __load(objs: M[]): void;
    __watch_obj(obj: any): void;
}

declare class Query<M extends Model> extends Query$2<M> {
    __load(objs: M[]): void;
    get items(): M[];
    constructor(adapter: Adapter<M>, base_cache: any, filters?: Filter, order_by?: ORDER_BY, page?: number, page_size?: number);
}

declare type RawObject = any;
declare type RawData = any;
declare abstract class Model {
    static __id_separator: string;
    static __adapter: Adapter<Model>;
    static __cache: Map<string, Model>;
    static __ids: Map<string, {
        decorator: (obj: Model, field_name: string) => void;
        settings: any;
        serialize: any;
        deserialize: any;
    }>;
    static __fields: {
        [field_name: string]: {
            decorator: (obj: Model, field_name: string) => void;
            settings: any;
            serialize: any;
            deserialize: any;
        };
    };
    static __relations: {
        [field_name: string]: {
            decorator: (obj: Model, field_name: string) => void;
            settings: any;
        };
    };
    static inject(obj: Model): void;
    static eject(obj: Model): void;
    static find(filters: Filter): Promise<Model>;
    static getQuery(filters?: Filter, order_by?: ORDER_BY): Query$1<Model>;
    static getQueryPage(filter?: Filter, order_by?: ORDER_BY, page?: number, page_size?: number): Query<Model>;
    static get(__id: string): Model;
    static filter(): Array<Model>;
    static updateCache(raw_obj: any): Model;
    static clearCache(): void;
    static __id(obj: any, ids?: any): string | null;
    __init_data: any;
    __disposers: Map<any, any>;
    constructor(...args: any[]);
    get __id(): string | null;
    get model(): any;
    get raw_obj(): any;
    get raw_data(): any;
    get only_changed_raw_data(): any;
    get is_changed(): boolean;
    create(): Promise<any>;
    update(): Promise<any>;
    delete(): Promise<any>;
    save(): Promise<any>;
    refresh_init_data(): void;
    updateFromRaw(raw_obj: any): void;
}
declare function model(constructor: any): any;

declare class LocalAdapter<M extends Model> extends Adapter<M> {
    readonly store_name: string;
    delay: number;
    init_local_data(data: RawObject[]): void;
    constructor(model: any, store_name?: string);
    __create(raw_data: RawData): Promise<RawObject>;
    __update(obj_id: string, only_changed_raw_data: RawData): Promise<RawObject>;
    __delete(obj_id: string): Promise<void>;
    __find(where: any): Promise<RawObject>;
    __load(where?: any, order_by?: any, limit?: any, offset?: any): Promise<RawObject[]>;
    getTotalCount(where?: any): Promise<number>;
}
declare function local(): (cls: any) => void;

declare function id(cls: any, field_name: string): void;

declare function field(cls: any, field_name: string): void;

declare function foreign(foreign_model: any, ...foreign_ids_names: string[]): (cls: any, field_name: string) => void;

declare function one(remote_model: any, ...remote_foreign_ids_names: string[]): (cls: any, field_name: string) => void;

declare function many(remote_model: any, ...remote_foreign_ids_names: string[]): (cls: any, field_name: string) => void;

export { AND, ASC, Adapter, ComboFilter, DESC, EQ, Filter, IN, LocalAdapter, Model, NOT_EQ, ORDER_BY, Query$1 as Query, Query$2 as QueryBase, Query as QueryPage, RawData, RawObject, SingleFilter, ValueType, field, foreign, id, local, many, model, one };
