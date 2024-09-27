declare const config: {
    DEFAULT_PAGE_SIZE: number;
    AUTO_UPDATE_DELAY: number;
    NON_FIELD_ERRORS_KEY: string;
    UPDATE_SEARCH_PARAMS: (search_params: URLSearchParams) => void;
    WATCTH_URL_CHANGES: (callback: any) => () => void;
};

declare abstract class Filter {
    abstract get URLSearchParams(): URLSearchParams;
    abstract isMatch(obj: any): boolean;
    abstract get isReady(): boolean;
}

declare abstract class AutoReset<T extends Input<any, any>> {
    input: T;
    __disposers: any[];
    constructor(input: T);
    destroy(): void;
    abstract do(): void;
}

interface InputConstructorArgs<T, M extends Model> {
    value?: T;
    options?: Query<M>;
    required?: boolean;
    disabled?: boolean;
    syncURL?: string;
    syncURLSearchParams?: string;
    syncLocalStorage?: string;
    debounce?: number;
    autoReset?: (input: Input<T, M>) => void;
    autoResetClass?: new (input: Input<T, M>) => AutoReset<Input<T, M>>;
}
declare abstract class Input<T, M extends Model> {
    value: T;
    errors: string[];
    readonly options?: Query<M>;
    required: boolean;
    disabled: boolean;
    readonly syncURLSearchParams?: string;
    readonly syncLocalStorage?: string;
    readonly debounce?: number;
    readonly autoReset?: (input: Input<T, M>) => void;
    readonly autoResetObj?: AutoReset<Input<T, M>>;
    isInit: boolean;
    __isReady: boolean;
    __disposers: any[];
    __setReadyTrue: Function;
    constructor(args?: InputConstructorArgs<T, M>);
    get isReady(): boolean;
    get isError(): boolean;
    set(value: T): void;
    destroy(): void;
    abstract serialize(value: string): void;
    abstract deserialize(): string;
    toString(): string;
    __doOptions(): void;
    __doAutoReset(): void;
    __doSyncURLSearchParams(): void;
    __doSyncLocalStorage(): void;
}

declare abstract class SingleFilter extends Filter {
    readonly field: string;
    input: Input<any, any>;
    __disposers: (() => void)[];
    constructor(field: string, input: Input<any, any>);
    get isReady(): boolean;
    get URLSearchParams(): URLSearchParams;
    abstract get URIField(): string;
    abstract operator(value_a: any, value_b: any): boolean;
    isMatch(obj: any): boolean;
}

declare abstract class ComboFilter extends Filter {
    readonly filters: Filter[];
    constructor(filters: Filter[]);
    abstract isMatch(obj: any): boolean;
    get isReady(): boolean;
    get URLSearchParams(): URLSearchParams;
}

declare class StringInput extends Input<string | null | undefined, any> {
    serialize(value: string): void;
    deserialize(): string;
}

declare class NumberInput<M extends Model> extends Input<number | null | undefined, M> {
    serialize(value: string): void;
    deserialize(): string;
}

declare class BooleanInput extends Input<boolean | null | undefined, any> {
    serialize(value?: string): void;
    deserialize(): string;
}

declare class DateInput extends Input<Date | null | undefined, any> {
    serialize(value: string): void;
    deserialize(): string;
}

declare class DateTimeInput extends Input<Date | null | undefined, any> {
    serialize(value?: string): void;
    deserialize(): string;
}

declare class EnumInput<EnumType extends Object, EnumValue extends EnumType[keyof EnumType]> extends Input<EnumValue | null | undefined, any> {
    private enum;
    constructor(args: InputConstructorArgs<EnumValue, any> & {
        enum: EnumType;
    });
    serialize(value?: string): void;
    deserialize(): string;
}

declare abstract class ArrayInput<T, M extends Model> extends Input<T, M> {
    constructor(args?: InputConstructorArgs<T, M>);
}

declare class ArrayStringInput extends ArrayInput<string[], any> {
    serialize(value: string): void;
    deserialize(): string;
}

declare class ArrayNumberInput extends ArrayInput<number[], any> {
    serialize(value: string): void;
    deserialize(): string;
}

declare class OrderByInput extends Input<ORDER_BY, any> {
    serialize(value: string): void;
    deserialize(): string | undefined;
}

interface ObjectInputConstructorArgs<T, M extends Model> extends InputConstructorArgs<T, M> {
    model: new (...args: any[]) => M;
}
declare class ObjectInput<M extends Model> extends NumberInput<M> {
    readonly model: new (...args: any[]) => M;
    constructor(args?: ObjectInputConstructorArgs<number, M>);
    get obj(): M;
}

declare function autoResetId(input: NumberInput<any>): void;

declare const autoResetArrayOfIDs: (input: ArrayNumberInput) => void;

declare const autoResetArrayToEmpty: (input: any) => void;

declare class EQ_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare class EQV_Filter extends EQ_Filter {
    get URIField(): string;
}
declare function EQ(field: string, value: Input<any, any>): SingleFilter;
declare function EQV(field: string, value: Input<any, any>): SingleFilter;

declare class NOT_EQ_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function NOT_EQ(field: string, value: Input<any, any>): SingleFilter;

declare class GT_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function GT(field: string, value: Input<any, any>): SingleFilter;

declare class GTE_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function GTE(field: string, value: Input<any, any>): SingleFilter;

declare class LT_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function LT(field: string, value: Input<any, any>): SingleFilter;

declare class LTE_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function LTE(field: string, value: Input<any, any>): SingleFilter;

declare class IN_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function IN(field: string, value: Input<any, any>): SingleFilter;

declare class LIKE_Filter extends SingleFilter {
    get URIField(): string;
    operator(current_value: any, filter_value: any): boolean;
}
declare function LIKE(field: string, value: Input<any, any>): SingleFilter;

declare class ILIKE_Filter extends SingleFilter {
    get URIField(): string;
    operator(current_value: any, filter_value: any): boolean;
}
declare function ILIKE(field: string, value: Input<any, any>): SingleFilter;

declare class AND_Filter extends ComboFilter {
    isMatch(obj: any): boolean;
}
declare function AND(...filters: Filter[]): Filter;

declare abstract class Adapter<M extends Model> {
    abstract create(raw_data: any, controller?: AbortController): Promise<any>;
    abstract get(obj_id: any, controller?: AbortController): Promise<any>;
    abstract update(obj_id: any, only_changed_raw_data: any, controller?: AbortController): Promise<any>;
    abstract delete(obj_id: any, controller?: AbortController): Promise<void>;
    abstract action(obj_id: any, name: string, kwargs: Object, controller?: AbortController): Promise<any>;
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
    get(obj_id: number, controller?: AbortController): Promise<M>;
    find(query: Query<M>, controller?: AbortController): Promise<M>;
    load(query: Query<M>, controller?: AbortController): Promise<M[]>;
    getTotalCount(filter: Filter, controller?: AbortController): Promise<number>;
    getDistinct(filter: Filter, field: string, controller?: AbortController): Promise<any[]>;
}
declare function repository(adapter: any, cache?: any): (cls: any) => void;

declare const DISPOSER_AUTOUPDATE = "__autoupdate";
declare const ASC = true;
declare const DESC = false;
type ORDER_BY = Map<string, boolean>;
interface QueryProps<M extends Model> {
    repository?: Repository<M>;
    filter?: Filter;
    orderBy?: OrderByInput;
    offset?: NumberInput<any>;
    limit?: NumberInput<any>;
    relations?: ArrayStringInput;
    fields?: ArrayStringInput;
    omit?: ArrayStringInput;
    autoupdate?: boolean;
}
declare class Query<M extends Model> {
    readonly repository: Repository<M>;
    readonly filter: Filter;
    readonly orderBy: OrderByInput;
    readonly offset: NumberInput<any>;
    readonly limit: NumberInput<any>;
    readonly relations: ArrayStringInput;
    readonly fields: ArrayStringInput;
    readonly omit: ArrayStringInput;
    protected __items: M[];
    total: number;
    isLoading: boolean;
    needToUpdate: boolean;
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
    load(): Promise<void>;
    shadowLoad(): Promise<void>;
    get autoupdate(): boolean;
    set autoupdate(value: boolean);
    get isReady(): boolean;
    loading: () => Promise<Boolean>;
    protected __wrap_controller(func: Function): Promise<any>;
    protected __load(): Promise<any>;
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
    __load(): Promise<any>;
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
    __load(): Promise<any>;
}

/**
 * QueryRawPage is a class to load raw objects from the server
 * without converting them to models using the repository.
 */
declare class QueryRawPage<M extends Model> extends QueryPage<M> {
    __load(): Promise<any>;
}

declare class QueryDistinct extends Query<any> {
    readonly field: string;
    constructor(field: string, props: QueryProps<any>);
    __load(): Promise<any>;
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
    static get(id: any): Model;
    static findById(id: any): Promise<Model>;
    static find(query: Query<Model>): Promise<Model>;
    id: any | undefined;
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
    readonly store: Map<number, M>;
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
        [key: string]: Input<any, any>;
    };
    isLoading: boolean;
    errors: string[];
    private __submit;
    private __cancel;
    constructor(inputs: {
        [key: string]: Input<any, any>;
    }, submit: () => Promise<void>, cancel: () => void);
    get isReady(): boolean;
    get isError(): boolean;
    submit(): Promise<void>;
    cancel(): void;
}

declare class ObjectForm<M extends Model> extends Form {
    obj: M;
    constructor(inputs: {
        [key: string]: Input<any, any>;
    }, onSubmitted?: (obj: M) => void, onCancelled?: () => void);
}

declare function waitIsTrue(obj: any, field: string): Promise<Boolean>;
declare function waitIsFalse(obj: any, field: string): Promise<Boolean>;
declare function timeout(ms: number): Promise<unknown>;

export { AND, AND_Filter, ASC, Adapter, ArrayInput, ArrayNumberInput, ArrayStringInput, BooleanInput, Cache, ComboFilter, DESC, DISPOSER_AUTOUPDATE, DateInput, DateTimeInput, EQ, EQV, EQV_Filter, EQ_Filter, EnumInput, Filter, Form, GT, GTE, GTE_Filter, GT_Filter, ILIKE, ILIKE_Filter, IN, IN_Filter, Input, InputConstructorArgs, LIKE, LIKE_Filter, LT, LTE, LTE_Filter, LT_Filter, LocalAdapter, MockAdapter, Model, NOT_EQ, NOT_EQ_Filter, NumberInput, ORDER_BY, ObjectForm, ObjectInput, ObjectInputConstructorArgs, OrderByInput, Query, QueryCacheSync, QueryDistinct, QueryPage, QueryProps, QueryRaw, QueryRawPage, QueryStream, ReadOnlyAdapter, Repository, SingleFilter, StringInput, autoResetArrayOfIDs, autoResetArrayToEmpty, autoResetId, config, field, field_field, foreign, local, local_store, many, mock, model, one, repository, timeout, waitIsFalse, waitIsTrue };
