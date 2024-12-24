declare const config: {
    DEFAULT_PAGE_SIZE: number;
    AUTO_UPDATE_DELAY: number;
    NON_FIELD_ERRORS_KEY: string;
    UPDATE_SEARCH_PARAMS: (search_params: URLSearchParams) => void;
    WATCTH_URL_CHANGES: (callback: any) => () => void;
    DEBOUNCE: (func: Function, debounce: number) => any;
};

type ID = string | number;
declare const ASC = true;
declare const DESC = false;
type ORDER_BY = Map<string, boolean>;

declare abstract class Filter {
    abstract get URLSearchParams(): URLSearchParams;
    abstract isMatch(obj: any): boolean;
    abstract get isReady(): boolean;
}

declare enum TYPE {
    ID = "id",
    STRING = "string",
    NUMBER = "number",
    DATE = "date",
    DATETIME = "datetime",
    BOOLEAN = "boolean",
    ARRAY_ID = "array-id",
    ARRAY_STRING = "array-string",
    ARRAY_NUMBER = "array-number",
    ARRAY_DATE = "array-date",
    ARRAY_DATETIME = "array-datetime",
    ORDER_BY = "order-by"
}

interface InputConstructorArgs<T> {
    value?: T;
    required?: boolean;
    disabled?: boolean;
    debounce?: number;
    syncURL?: string;
    syncLocalStorage?: string;
    type?: TYPE;
}
declare class Input<T> {
    readonly type: TYPE;
    value: T;
    isRequired: boolean;
    isDisabled: boolean;
    isDebouncing: boolean;
    isNeedToUpdate: boolean;
    errors: string[];
    readonly debounce: number;
    readonly syncURL?: string;
    readonly syncLocalStorage?: string;
    __disposers: any[];
    constructor(args?: InputConstructorArgs<T>);
    destroy(): void;
    private stopDebouncing;
    set(value: T): void;
    get isReady(): boolean;
    setFromString(value: string): void;
    toString(): string;
}
declare const StringInput: (args?: InputConstructorArgs<string>) => Input<string>;
declare const NumberInput: (args?: InputConstructorArgs<number>) => Input<number>;
declare const DateInput: (args?: InputConstructorArgs<Date>) => Input<Date>;
declare const DateTimeInput: (args?: InputConstructorArgs<Date>) => Input<Date>;
declare const BooleanInput: (args?: InputConstructorArgs<boolean>) => Input<boolean>;
declare const OrderByInput: (args?: InputConstructorArgs<ORDER_BY>) => Input<ORDER_BY>;
declare const ArrayStringInput: (args?: InputConstructorArgs<string[]>) => Input<string[]>;
declare const ArrayNumberInput: (args?: InputConstructorArgs<number[]>) => Input<number[]>;
declare const ArrayDateInput: (args?: InputConstructorArgs<Date[]>) => Input<Date[]>;
declare const ArrayDateTimeInput: (args?: InputConstructorArgs<Date[]>) => Input<Date[]>;

declare class SingleFilter extends Filter {
    readonly field: string;
    input: Input<any>;
    __disposers: (() => void)[];
    readonly getURIField: (field: string) => string;
    readonly operator: (value_a: any, value_b: any) => boolean;
    constructor(field: string, input: Input<any>, getURIField: (field: string) => string, operator: (a: any, b: any) => boolean);
    get isReady(): boolean;
    get URLSearchParams(): URLSearchParams;
    isMatch(obj: any): boolean;
}
declare function EQ(field: string, input: Input<any>): SingleFilter;
declare function EQV(field: string, input: Input<any>): SingleFilter;
declare function NOT_EQ(field: string, input: Input<any>): SingleFilter;
declare function GT(field: string, input: Input<any>): SingleFilter;
declare function GTE(field: string, input: Input<any>): SingleFilter;
declare function LT(field: string, input: Input<any>): SingleFilter;
declare function LTE(field: string, input: Input<any>): SingleFilter;
declare function LIKE(field: string, input: Input<any>): SingleFilter;
declare function ILIKE(field: string, input: Input<any>): SingleFilter;
declare function IN(field: string, input: Input<any>): SingleFilter;

declare abstract class ComboFilter extends Filter {
    readonly filters: Filter[];
    constructor(filters: Filter[]);
    abstract isMatch(obj: any): boolean;
    get isReady(): boolean;
    get URLSearchParams(): URLSearchParams;
}
declare class AND_Filter extends ComboFilter {
    isMatch(obj: any): boolean;
}
declare function AND(...filters: Filter[]): Filter;

declare abstract class Adapter<M extends Model> {
    abstract create(raw_data: any, controller?: AbortController): Promise<any>;
    abstract get(obj_id: ID, controller?: AbortController): Promise<any>;
    abstract update(obj_id: ID, only_changed_raw_data: any, controller?: AbortController): Promise<any>;
    abstract delete(obj_id: ID, controller?: AbortController): Promise<void>;
    abstract action(obj_id: ID, name: string, kwargs: Object, controller?: AbortController): Promise<any>;
    abstract find(query: Query<M>, controller?: AbortController): Promise<any>;
    abstract load(query: Query<M>, controller?: AbortController): Promise<any[]>;
    abstract getTotalCount(filter: Filter, controller?: AbortController): Promise<number>;
    abstract getDistinct(filter: Filter, field: string, controller?: AbortController): Promise<any[]>;
    abstract getURLSearchParams(query: Query<M>): URLSearchParams;
}

declare class Repository<M extends Model> {
    readonly model: any;
    readonly cache?: Cache<M>;
    readonly adapter: Adapter<M>;
    constructor(model: any, adapter: any, cache?: any);
    action(obj: M, name: string, kwargs: Object, controller?: AbortController): Promise<any>;
    create(obj: M, controller?: AbortController): Promise<M>;
    update(obj: M, controller?: AbortController): Promise<M>;
    delete(obj: M, controller?: AbortController): Promise<M>;
    get(obj_id: ID, controller?: AbortController): Promise<M>;
    find(query: Query<M>, controller?: AbortController): Promise<M>;
    load(query: Query<M>, controller?: AbortController): Promise<M[]>;
    getTotalCount(filter: Filter, controller?: AbortController): Promise<number>;
    getDistinct(filter: Filter, field: string, controller?: AbortController): Promise<any[]>;
}
declare function repository(adapter: any, cache?: any): (cls: any) => void;

interface ObjectInputConstructorArgs<T, M extends Model> extends InputConstructorArgs<T> {
    options?: Query<M>;
    autoReset?: (input: ObjectInput<M>) => void;
}
declare class ObjectInput<M extends Model> extends Input<ID> {
    readonly options?: Query<M>;
    constructor(args?: ObjectInputConstructorArgs<ID, M>);
    get isReady(): boolean;
    destroy(): void;
}

declare function autoResetId(input: ObjectInput<any>): void;

declare const syncURLHandler: (paramName: string, input: Input<any>) => void;

declare const syncLocalStorageHandler: (paramName: string, input: Input<any>) => void;

declare const DISPOSER_AUTOUPDATE = "__autoupdate";
interface QueryProps<M extends Model> {
    repository?: Repository<M>;
    filter?: Filter;
    orderBy?: Input<ORDER_BY>;
    offset?: Input<number>;
    limit?: Input<number>;
    relations?: Input<string[]>;
    fields?: Input<string[]>;
    omit?: Input<string[]>;
    autoupdate?: boolean;
}
declare class Query<M extends Model> {
    readonly repository: Repository<M>;
    readonly filter: Filter;
    readonly orderBy: Input<ORDER_BY>;
    readonly offset: Input<number>;
    readonly limit: Input<number>;
    readonly relations: Input<string[]>;
    readonly fields: Input<string[]>;
    readonly omit: Input<string[]>;
    protected __items: M[];
    total: number;
    isLoading: boolean;
    isNeedToUpdate: boolean;
    timestamp: number;
    error: string;
    get items(): M[];
    protected controller: AbortController;
    protected disposers: (() => void)[];
    protected disposerObjects: {
        [field: string]: () => void;
    };
    constructor(props: QueryProps<M>);
    destroy(): void;
    loading: () => Promise<Boolean>;
    ready: () => Promise<Boolean>;
    get autoupdate(): boolean;
    set autoupdate(value: boolean);
    get dependenciesAreReady(): boolean;
    get isReady(): boolean;
    load(): Promise<void>;
    shadowLoad(): Promise<void>;
    protected __load(): Promise<void>;
}

declare class QueryPage<M extends Model> extends Query<M> {
    setPage(n: number): void;
    setPageSize(size: number): void;
    goToFirstPage(): void;
    goToPrevPage(): void;
    goToNextPage(): void;
    goToLastPage(): void;
    get is_first_page(): boolean;
    get is_last_page(): boolean;
    get current_page(): number;
    get total_pages(): number;
    get isFirstPage(): boolean;
    get isLastPage(): boolean;
    get currentPage(): number;
    get totalPages(): number;
    constructor(props: QueryProps<M>);
    __load(): Promise<void>;
}

declare class QueryCacheSync<M extends Model> extends Query<M> {
    constructor(props: QueryProps<M>);
    __load(): Promise<void>;
    get items(): M[];
    __watch_obj(obj: any): void;
}

declare class QueryStream<M extends Model> extends Query<M> {
    goToFirstPage(): void;
    goToNextPage(): void;
    constructor(props: QueryProps<M>);
    __load(): Promise<void>;
}

/**
 * QueryRaw is a class to load raw objects from the server
 * without converting them to models using the repository.
 */
declare class QueryRaw<M extends Model> extends Query<M> {
    __load(): Promise<void>;
}

/**
 * QueryRawPage is a class to load raw objects from the server
 * without converting them to models using the repository.
 */
declare class QueryRawPage<M extends Model> extends QueryPage<M> {
    __load(): Promise<void>;
}

declare class QueryDistinct extends Query<any> {
    readonly field: string;
    constructor(field: string, props: QueryProps<any>);
    __load(): Promise<void>;
}

declare abstract class Model {
    static readonly repository: Repository<Model>;
    static readonly isOriginalClass = true;
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
    static getQuery(props: QueryProps<Model>): Query<Model>;
    static getQueryPage(props: QueryProps<Model>): QueryPage<Model>;
    static getQueryRaw(props: QueryProps<Model>): QueryRaw<Model>;
    static getQueryRawPage(props: QueryProps<Model>): QueryRawPage<Model>;
    static getQueryCacheSync(props: QueryProps<Model>): QueryCacheSync<Model>;
    static getQueryStream(props: QueryProps<Model>): QueryStream<Model>;
    static getQueryDistinct(field: string, props: QueryProps<Model>): QueryDistinct;
    static get(id: ID): Model;
    static findById(id: ID): Promise<Model>;
    static find(query: Query<Model>): Promise<Model>;
    id: ID;
    __init_data: any;
    __disposers: Map<any, any>;
    constructor(...args: any[]);
    destroy(): void;
    get model(): any;
    get raw_data(): any;
    get raw_obj(): any;
    get only_changed_raw_data(): any;
    get is_changed(): boolean;
    action(name: string, kwargs: Object): Promise<any>;
    create(): Promise<any>;
    update(): Promise<any>;
    delete(): Promise<any>;
    save(): Promise<any>;
    refresh(): Promise<any>;
    refreshInitData(): void;
    cancelLocalChanges(): void;
    updateFromRaw(raw_obj: any): void;
}
declare function model(constructor: any): any;

declare class Cache<M extends Model> {
    readonly name: string;
    readonly model: any;
    readonly store: Map<ID, M>;
    constructor(model: any, name?: string);
    get(id: any): M | undefined;
    inject(obj: M): void;
    eject(obj: M): boolean;
    update(raw_obj: any): M;
    clear(): void;
}

declare function field_field(obj: any, field_name: any): void;
declare function field(cls: any, field_name: string): void;

declare function foreign(foreign_model: any, foreign_id_name?: string): (cls: any, field_name: string) => void;

declare function one(remote_model: any, remote_foreign_id_name?: string): (cls: any, field_name: string) => void;

declare function many(remote_model: any, remote_foreign_id_name?: string): (cls: any, field_name: string) => void;

declare abstract class ReadOnlyAdapter<M extends Model> extends Adapter<M> {
    create(): Promise<void>;
    update(): Promise<void>;
    delete(): Promise<void>;
}

declare let local_store: {
    string?: {
        any: Model;
    };
};
declare class LocalAdapter<M extends Model> implements Adapter<M> {
    readonly store_name: string;
    delay: number;
    init_local_data(data: any[]): void;
    constructor(store_name: string);
    action(obj_id: number, name: string, kwargs: Object): Promise<any>;
    create(raw_data: any): Promise<any>;
    get(obj_id: any): Promise<any>;
    update(obj_id: number, only_changed_raw_data: any): Promise<any>;
    delete(obj_id: number): Promise<void>;
    find(query: Query<M>): Promise<any>;
    load(query: Query<M>): Promise<any[]>;
    getTotalCount(filter: Filter): Promise<number>;
    getDistinct(filter: any, filed: any): Promise<any[]>;
    getURLSearchParams(query: Query<M>): URLSearchParams;
}
declare function local(): (cls: any) => void;

declare class MockAdapter<M extends Model> implements Adapter<M> {
    action(obj_id: number, name: string, kwargs: Object): Promise<any>;
    create(raw_data: any): Promise<any>;
    get(obj_id: any): Promise<any>;
    update(obj_id: number, only_changed_raw_data: any): Promise<any>;
    delete(obj_id: number): Promise<void>;
    find(query: Query<M>): Promise<any>;
    load(query: Query<M>): Promise<any[]>;
    getTotalCount(filter: Filter): Promise<number>;
    getDistinct(filter: any, filed: any): Promise<any[]>;
    getURLSearchParams(query: Query<M>): URLSearchParams;
}
declare function mock(): (cls: any) => void;

declare class Form {
    readonly inputs: {
        [key: string]: Input<any>;
    };
    isLoading: boolean;
    errors: string[];
    private __submit;
    private __cancel;
    constructor(inputs: {
        [key: string]: Input<any>;
    }, submit: () => Promise<void>, cancel: () => void);
    get isReady(): boolean;
    get isError(): boolean;
    submit(): Promise<void>;
    cancel(): void;
}

declare class ObjectForm<M extends Model> extends Form {
    obj: M;
    constructor(inputs: {
        [key: string]: Input<any>;
    }, onSubmitted?: (obj: M) => void, onCancelled?: () => void);
}

declare function waitIsTrue(obj: any, field: string): Promise<Boolean>;
declare function waitIsFalse(obj: any, field: string): Promise<Boolean>;
declare function timeout(ms: number): Promise<unknown>;

export { AND, AND_Filter, ASC, Adapter, ArrayDateInput, ArrayDateTimeInput, ArrayNumberInput, ArrayStringInput, BooleanInput, Cache, ComboFilter, DESC, DISPOSER_AUTOUPDATE, DateInput, DateTimeInput, EQ, EQV, Filter, Form, GT, GTE, ID, ILIKE, IN, Input, InputConstructorArgs, LIKE, LT, LTE, LocalAdapter, MockAdapter, Model, NOT_EQ, NumberInput, ORDER_BY, ObjectForm, ObjectInput, ObjectInputConstructorArgs, OrderByInput, Query, QueryCacheSync, QueryDistinct, QueryPage, QueryProps, QueryRaw, QueryRawPage, QueryStream, ReadOnlyAdapter, Repository, SingleFilter, StringInput, autoResetId, config, field, field_field, foreign, local, local_store, many, mock, model, one, repository, syncLocalStorageHandler, syncURLHandler, timeout, waitIsFalse, waitIsTrue };
