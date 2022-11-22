import { Selector as Selector$1 } from '@/types';

declare abstract class Filter {
    abstract get URLSearchParams(): URLSearchParams;
    abstract setFromURI(uri: string): void;
    abstract isMatch(obj: any): boolean;
}

declare const ASC = true;
declare const DESC = false;
declare type ORDER_BY = Map<string, boolean>;
declare abstract class QueryBase<M extends Model> {
    filters: Filter;
    order_by: ORDER_BY;
    fields?: Array<string>;
    omit?: Array<string>;
    relations?: Array<string>;
    offset: number;
    limit: number;
    total: number;
    need_to_update: boolean;
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
    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector$1);
    destroy(): void;
    abstract get items(): any;
    abstract __load(objs: M[]): any;
    abstract shadowLoad(): any;
    load(): Promise<void>;
    get selector(): Selector$1;
    ready(): Promise<Boolean>;
    loading(): Promise<Boolean>;
}

declare class Query<M extends Model> extends QueryBase<M> {
    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector$1);
    shadowLoad(): Promise<void>;
    get items(): M[];
    __load(objs: M[]): void;
    __watch_obj(obj: any): void;
}

declare class QueryPage<M extends Model> extends QueryBase<M> {
    __load(objs: M[]): void;
    setPageSize(size: number): void;
    setPage(n: number): void;
    goToFirstPage(): void;
    goToPrevPage(): void;
    goToNextPage(): void;
    goToLastPage(): void;
    get is_first_page(): boolean;
    get is_last_page(): boolean;
    get current_page(): number;
    get total_pages(): number;
    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector$1);
    get items(): M[];
    shadowLoad(): Promise<void>;
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
    options: Query<Model>;
    constructor(field: string, value?: any, value_type?: ValueType);
    get URLSearchParams(): URLSearchParams;
    abstract get URIField(): string;
    setFromURI(uri: string): void;
    abstract operator(value_a: any, value_b: any): boolean;
    isMatch(obj: any): boolean;
    serialize(value: string | undefined): void;
    deserialize(value?: any): string;
}
declare function match(obj: any, field_name: string, filter_value: any, operator: (value_a: any, value_b: any) => boolean): boolean;

declare abstract class ComboFilter extends Filter {
    readonly filters: Filter[];
    constructor(filters?: Filter[]);
    get URLSearchParams(): URLSearchParams;
    setFromURI(uri: string): void;
}

declare class EQ_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function EQ(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class NOT_EQ_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function NOT_EQ(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class IN_Filter extends SingleFilter {
    constructor(field: string, value?: any, value_type?: ValueType);
    serialize(value: string | undefined): void;
    deserialize(): string;
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function IN(field: string, value?: any[], value_type?: ValueType): SingleFilter;

declare class AND_Filter extends ComboFilter {
    isMatch(obj: any): boolean;
}
declare function AND(...filters: Filter[]): Filter;

interface Selector {
    filter?: Filter;
    order_by?: ORDER_BY;
    relations?: Array<string>;
    fields?: Array<string>;
    omit?: Array<string>;
    offset?: number;
    limit?: number;
}

declare abstract class Adapter<M extends Model> {
    abstract __create(raw_data: RawData): Promise<RawObject>;
    abstract __update(obj_id: number, only_changed_raw_data: RawData): Promise<RawObject>;
    abstract __delete(obj_id: number): Promise<void>;
    abstract __find(props: Selector): Promise<object>;
    abstract __load(props: Selector): Promise<RawObject[]>;
    abstract getTotalCount(where?: any): Promise<number>;
    readonly model: any;
    constructor(model: any);
    create(obj: M): Promise<M>;
    update(obj: M): Promise<M>;
    delete(obj: M): Promise<M>;
    find(selector: Selector): Promise<M>;
    load(selector?: Selector): Promise<M[]>;
}

declare let local_store: {
    string?: {
        number: Model;
    };
};
declare class LocalAdapter<M extends Model> extends Adapter<M> {
    readonly store_name: string;
    delay: number;
    init_local_data(data: RawObject[]): void;
    constructor(model: any, store_name?: string);
    __create(raw_data: RawData): Promise<RawObject>;
    __update(obj_id: number, only_changed_raw_data: RawData): Promise<RawObject>;
    __delete(obj_id: number): Promise<void>;
    __find(selector: Selector$1): Promise<RawObject>;
    __load(selector?: Selector$1): Promise<RawObject[]>;
    getTotalCount(where?: any): Promise<number>;
}
declare function local(): (cls: any) => void;

declare type RawObject = any;
declare type RawData = any;
declare abstract class Model {
    static __adapter: Adapter<Model>;
    static __cache: Map<number, Model>;
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
    static getQuery(selector?: Selector): Query<Model>;
    static getQueryPage(selector?: Selector): QueryPage<Model>;
    static get(id: number): Model;
    static find(selector: Selector): Promise<Model>;
    static updateCache(raw_obj: any): Model;
    static clearCache(): void;
    id: number | undefined;
    __init_data: any;
    __disposers: Map<any, any>;
    constructor(...args: any[]);
    get model(): any;
    get raw_data(): any;
    get raw_obj(): any;
    get only_changed_raw_data(): any;
    get is_changed(): boolean;
    create(): Promise<any>;
    update(): Promise<any>;
    delete(): Promise<any>;
    save(): Promise<any>;
    refreshInitData(): void;
    cancelLocalChanges(): void;
    updateFromRaw(raw_obj: any): void;
}
declare function model(constructor: any): any;

declare function field_field(obj: any, field_name: any): void;
declare function field(cls: any, field_name: string): void;

declare function foreign(foreign_model: any, foreign_id_name?: string): (cls: any, field_name: string) => void;

declare function one(remote_model: any, remote_foreign_id_name?: string): (cls: any, field_name: string) => void;

declare function many(remote_model: any, remote_foreign_id_name?: string): (cls: any, field_name: string) => void;

export { AND, AND_Filter, ASC, Adapter, ComboFilter, DESC, EQ, EQ_Filter, Filter, IN, IN_Filter, LocalAdapter, Model, NOT_EQ, NOT_EQ_Filter, ORDER_BY, Query, QueryBase, QueryPage, RawData, RawObject, Selector, SingleFilter, ValueType, field, field_field, foreign, local, local_store, many, match, model, one };
