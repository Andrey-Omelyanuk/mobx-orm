import { Selector as Selector$1 } from '@/types';

declare abstract class Filter {
    abstract get URLSearchParams(): URLSearchParams;
    abstract setFromURI(uri: string): void;
    abstract isMatch(obj: any): boolean;
}

declare abstract class XFilter {
    abstract get URLSearchParams(): URLSearchParams;
    abstract isMatch(obj: any): boolean;
    abstract get isReady(): boolean;
}

declare class OrderByInput extends Input<ORDER_BY> {
    serialize(value?: string): ORDER_BY;
    deserialize(value: ORDER_BY): string | undefined;
}

declare class NumberInput extends Input<number | null | undefined> {
    serialize(value?: string): number | null | undefined;
    deserialize(value: number | null | undefined): string;
}

declare abstract class ArrayInput<T> extends Input<T> {
    constructor(args?: InputConstructorArgs<T>);
}

declare class ArrayStringInput extends ArrayInput<string[]> {
    serialize(value?: string): string[];
    deserialize(value: string[]): string;
}

declare const DISPOSER_AUTOUPDATE = "__autoupdate";
interface QueryXProps<M extends Model> {
    adapter?: Adapter<M>;
    filter?: XFilter;
    order_by?: ORDER_BY;
    offset?: number;
    limit?: number;
    relations?: Array<string>;
    fields?: Array<string>;
    omit?: Array<string>;
    autoupdate?: boolean;
    syncURL?: boolean;
    syncURLSearchParams?: boolean;
    syncURLSearchParamsPrefix?: string;
}
declare class QueryX<M extends Model> {
    readonly filter: XFilter;
    readonly input_order_by: OrderByInput;
    readonly input_offset: NumberInput;
    readonly input_limit: NumberInput;
    readonly input_relations: ArrayStringInput;
    readonly input_fields: ArrayStringInput;
    readonly input_omit: ArrayStringInput;
    get orderBy(): ORDER_BY;
    get order_by(): ORDER_BY;
    get offset(): number;
    get limit(): number;
    get relations(): string[];
    get fields(): string[];
    get omit(): string[];
    set offset(value: number);
    set limit(value: number);
    set relations(value: string[]);
    set fields(value: string[]);
    set omit(value: string[]);
    readonly syncURLSearchParams: boolean;
    readonly syncURLSearchParamsPrefix: string;
    total: number;
    need_to_update: boolean;
    timestamp: number;
    readonly adapter: Adapter<M>;
    __items: M[];
    __is_loading: boolean;
    __is_ready: boolean;
    __error: string;
    get is_loading(): boolean;
    get is_ready(): boolean;
    get error(): string;
    get items(): M[];
    get filters(): XFilter;
    get isLoading(): boolean;
    get isReady(): boolean;
    __controller: AbortController;
    __disposers: (() => void)[];
    __disposer_objects: {
        [field: string]: () => void;
    };
    constructor(props: QueryXProps<M>);
    destroy(): void;
    __wrap_controller(func: Function): Promise<any>;
    __load(): Promise<any>;
    load(): Promise<void>;
    shadowLoad(): Promise<void>;
    get autoupdate(): boolean;
    set autoupdate(value: boolean);
    get URLSearchParams(): URLSearchParams;
    ready: () => Promise<Boolean>;
    loading: () => Promise<Boolean>;
}

declare abstract class AutoReset<T extends Input<any>> {
    input: T;
    __disposers: any[];
    constructor(input: T);
    destroy(): void;
    abstract do(): void;
}

interface InputConstructorArgs<T> {
    value?: T;
    options?: any;
    required?: boolean;
    disabled?: boolean;
    syncURL?: string;
    syncURLSearchParams?: string;
    syncLocalStorage?: string;
    debounce?: number;
    autoReset?: (input: Input<T>) => void;
    autoResetClass?: new (input: Input<T>) => AutoReset<Input<T>>;
}
declare abstract class Input<T> {
    value: T;
    errors: string[];
    readonly options?: QueryX<Model>;
    required: boolean;
    disabled: boolean;
    readonly syncURLSearchParams?: string;
    readonly syncLocalStorage?: string;
    readonly debounce?: number;
    readonly autoReset?: (input: Input<T>) => void;
    readonly autoResetObj?: AutoReset<Input<T>>;
    isInit: boolean;
    __isReady: boolean;
    __disposers: any[];
    __setReadyTrue: Function;
    constructor(args?: InputConstructorArgs<T>);
    get isReady(): boolean;
    get isError(): boolean;
    set(value: T): void;
    destroy(): void;
    abstract serialize(value?: string): T;
    abstract deserialize(value: T): string;
    toString(): string;
    __doOptions(): void;
    __doAutoReset(): void;
    __doSyncURLSearchParams(): void;
    __doSyncLocalStorage(): void;
}

declare class StringInput extends Input<string | null | undefined> {
    serialize(value?: string): string | null | undefined;
    deserialize(value: string | null | undefined): string;
}

declare class BooleanInput extends Input<boolean | null | undefined> {
    serialize(value?: string): boolean | null | undefined;
    deserialize(value: boolean | null | undefined): string;
}

declare class DateInput extends Input<Date | null | undefined> {
    serialize(value?: string): Date;
    deserialize(value: Date | null | undefined): string;
}

declare class DateTimeInput extends Input<Date | null | undefined> {
    serialize(value?: string): Date | null | undefined;
    deserialize(value: Date | null | undefined): string;
}

declare class EnumInput<EnumType extends Object, EnumValue extends EnumType[keyof EnumType]> extends Input<EnumValue | null | undefined> {
    private enum;
    constructor(args: InputConstructorArgs<EnumValue> & {
        enum: EnumType;
    });
    serialize(value?: string): EnumValue | null | undefined;
    deserialize(value: EnumValue | null | undefined): string;
}

declare class ArrayNumberInput extends ArrayInput<number[]> {
    serialize(value?: string): number[];
    deserialize(value: number[]): string;
}

declare function autoResetId(input: NumberInput): void;

declare const autoResetArrayOfIDs: (input: ArrayNumberInput) => void;

declare const autoResetArrayToEmpty: (input: any) => void;

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

declare abstract class XSingleFilter extends XFilter {
    readonly field: string;
    input: Input<any>;
    __disposers: (() => void)[];
    constructor(field: string, input: Input<any>);
    get isReady(): boolean;
    get URLSearchParams(): URLSearchParams;
    abstract get URIField(): string;
    abstract operator(value_a: any, value_b: any): boolean;
    isMatch(obj: any): boolean;
}

declare abstract class XComboFilter extends XFilter {
    readonly filters: XFilter[];
    constructor(filters: XFilter[]);
    abstract isMatch(obj: any): boolean;
    get isReady(): boolean;
    get URLSearchParams(): URLSearchParams;
}

declare class XEQ_Filter extends XSingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare class XEQV_Filter extends XEQ_Filter {
    get URIField(): string;
}
declare function XEQ(field: string, value: Input<any>): XSingleFilter;
declare function XEQV(field: string, value: Input<any>): XSingleFilter;

declare class XNOT_EQ_Filter extends XSingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function XNOT_EQ(field: string, value: Input<any>): XSingleFilter;

declare class XGT_Filter extends XSingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function XGT(field: string, value: Input<any>): XSingleFilter;

declare class XGTE_Filter extends XSingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function XGTE(field: string, value: Input<any>): XSingleFilter;

declare class XLT_Filter extends XSingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function XLT(field: string, value: Input<any>): XSingleFilter;

declare class XLTE_Filter extends XSingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function XLTE(field: string, value: Input<any>): XSingleFilter;

declare class XIN_Filter extends XSingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function XIN(field: string, value: Input<any>): XSingleFilter;

declare class XLIKE_Filter extends XSingleFilter {
    get URIField(): string;
    operator(current_value: any, filter_value: any): boolean;
}
declare function XLIKE(field: string, value: Input<any>): XSingleFilter;

declare class XILIKE_Filter extends XSingleFilter {
    get URIField(): string;
    operator(current_value: any, filter_value: any): boolean;
}
declare function XILIKE(field: string, value: Input<any>): XSingleFilter;

declare class XAND_Filter extends XComboFilter {
    isMatch(obj: any): boolean;
}
declare function XAND(...filters: XFilter[]): XFilter;

declare abstract class Adapter<M extends Model> {
    abstract __create(raw_data: RawData, controller?: AbortController): Promise<RawObject>;
    abstract __update(obj_id: number, only_changed_raw_data: RawData, controller?: AbortController): Promise<RawObject>;
    abstract __delete(obj_id: number, controller?: AbortController): Promise<void>;
    abstract __action(obj_id: number, name: string, kwargs: Object, controller?: AbortController): Promise<any>;
    abstract __get(obj_id: number, controller?: AbortController): Promise<object>;
    abstract __find(props: Selector | QueryX<M>, controller?: AbortController): Promise<object>;
    abstract __load(props: Selector | QueryX<M>, controller?: AbortController): Promise<RawObject[]>;
    abstract getTotalCount(where?: any, controller?: AbortController): Promise<number>;
    abstract getDistinct(where: XFilter, field: string, controller?: AbortController): Promise<any[]>;
    readonly model: any;
    constructor(model: any);
    action(obj: M, name: string, kwargs: Object, controller?: AbortController): Promise<any>;
    create(obj: M, controller?: AbortController): Promise<M>;
    update(obj: M, controller?: AbortController): Promise<M>;
    delete(obj: M, controller?: AbortController): Promise<M>;
    get(obj_id: number, controller?: AbortController): Promise<M>;
    find(selector: Selector | QueryX<M>, controller?: AbortController): Promise<M>;
    load(selector?: Selector | QueryX<M>, controller?: AbortController): Promise<M[]>;
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
    __action(obj_id: number, name: string, kwargs: Object): Promise<any>;
    __create(raw_data: RawData): Promise<RawObject>;
    __update(obj_id: number, only_changed_raw_data: RawData): Promise<RawObject>;
    __delete(obj_id: number): Promise<void>;
    __find(selector: Selector): Promise<RawObject>;
    __get(obj_id: number): Promise<RawObject>;
    __load(selector?: Selector): Promise<RawObject[]>;
    getTotalCount(where?: any): Promise<number>;
    getDistinct(where: any, filed: any): Promise<any[]>;
}
declare function local(): (cls: any) => void;

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
    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector);
    destroy(): void;
    abstract get items(): any;
    abstract __load(objs: M[]): any;
    abstract shadowLoad(): any;
    load(): Promise<void>;
    get autoupdate(): boolean;
    set autoupdate(value: boolean);
    get selector(): Selector;
    ready(): Promise<Boolean>;
    loading(): Promise<Boolean>;
}

declare class Query<M extends Model> extends QueryBase<M> {
    constructor(adapter: Adapter<M>, base_cache: any, selector?: Selector);
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

declare class QueryXPage<M extends Model> extends QueryX<M> {
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
    get isFirstPage(): boolean;
    get isLastPage(): boolean;
    get currentPage(): number;
    get totalPages(): number;
    constructor(props: QueryXProps<M>);
    __load(): Promise<any>;
}

declare class QueryXCacheSync<M extends Model> extends QueryX<M> {
    constructor(cache: any, props: QueryXProps<M>);
    __load(): Promise<void>;
    get items(): M[];
    __watch_obj(obj: any): void;
}

declare class QueryXStream<M extends Model> extends QueryX<M> {
    goToFirstPage(): void;
    goToNextPage(): void;
    constructor(props: QueryXProps<M>);
    __load(): Promise<void>;
}

declare class QueryXRaw<M extends Model> extends QueryX<M> {
    __load(): Promise<any>;
}

declare class QueryXRawPage<M extends Model> extends QueryXPage<M> {
    __load(): Promise<any>;
}

declare class QueryXDistinct extends QueryX<any> {
    readonly field: string;
    constructor(field: string, props: QueryXProps<any>);
    __load(): Promise<any>;
}

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
    static getQueryX<Class extends typeof Model, Instance extends InstanceType<Class>>(this: Class, props: QueryXProps<Instance>): QueryX<Instance>;
    static getQueryXRaw<Class extends typeof Model, Instance extends InstanceType<Class>>(this: Class, props: QueryXProps<Instance>): QueryX<Instance>;
    static getQueryXPage<Class extends typeof Model, Instance extends InstanceType<Class>>(this: Class, props: QueryXProps<Instance>): QueryXPage<Instance>;
    static getQueryXRawPage<Class extends typeof Model, Instance extends InstanceType<Class>>(this: Class, props: QueryXProps<Instance>): QueryXRawPage<Instance>;
    static getQueryXCacheSync<Class extends typeof Model, Instance extends InstanceType<Class>>(this: Class, props: QueryXProps<Instance>): QueryXCacheSync<Instance>;
    static getQueryXStream<Class extends typeof Model, Instance extends InstanceType<Class>>(this: Class, props: QueryXProps<Instance>): QueryXStream<Instance>;
    static getQueryXDistinct<Class extends typeof Model, Instance extends InstanceType<Class>>(this: Class, field: string, props: QueryXProps<Instance>): QueryXDistinct;
    static getQuery(selector?: Selector): Query<Model>;
    static getQueryPage(selector?: Selector): QueryPage<Model>;
    static get(id: number): Model;
    static findById(id: number): Promise<Model>;
    static find(selector: Selector): Promise<Model>;
    static updateCache(raw_obj: any): Model;
    static clearCache(): void;
    id: number | undefined;
    __init_data: any;
    __errors: any;
    __disposers: Map<any, any>;
    constructor(...args: any[]);
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
    /**
     * @deprecated use errors in the form and inputs
     */
    setError(error: any): void;
    refreshInitData(): void;
    cancelLocalChanges(): void;
    updateFromRaw(raw_obj: any): void;
}
declare function model(constructor: any): any;

declare enum ValueType {
    STRING = 0,
    NUMBER = 1,
    BOOL = 2,
    DATETIME = 3,
    DATE = 4
}
declare abstract class SingleFilter extends Filter {
    readonly field: string;
    readonly value_type: ValueType;
    value: any;
    options?: Query<Model>;
    __disposers: (() => void)[];
    constructor(field: string, value?: any, value_type?: ValueType, options?: Query<Model>);
    get URLSearchParams(): URLSearchParams;
    abstract get URIField(): string;
    set(value: any): void;
    setFromURI(uri: string): void;
    abstract operator(value_a: any, value_b: any): boolean;
    abstract alias(alias_field: any): SingleFilter;
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
    alias(alias_field: any): SingleFilter;
}
declare class EQV_Filter extends EQ_Filter {
    get URIField(): string;
}
declare function EQ(field: string, value?: any, value_type?: ValueType): SingleFilter;
declare function EQV(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class NOT_EQ_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
    alias(alias_field: any): SingleFilter;
}
declare function NOT_EQ(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class GT_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
    alias(alias_field: any): SingleFilter;
}
declare function GT(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class GTE_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
    alias(alias_field: any): SingleFilter;
}
declare function GTE(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class LT_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
    alias(alias_field: any): SingleFilter;
}
declare function LT(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class LTE_Filter extends SingleFilter {
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
    alias(alias_field: any): SingleFilter;
}
declare function LTE(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class IN_Filter extends SingleFilter {
    constructor(field: string, value?: any, value_type?: ValueType);
    alias(alias_field: any): SingleFilter;
    serialize(value: string | undefined): void;
    deserialize(): string;
    get URIField(): string;
    operator(value_a: any, value_b: any): boolean;
}
declare function IN(field: string, value?: any[], value_type?: ValueType): SingleFilter;

declare class LIKE_Filter extends SingleFilter {
    get URIField(): string;
    operator(current_value: any, filter_value: any): boolean;
    alias(alias_field: any): SingleFilter;
}
declare function LIKE(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class ILIKE_Filter extends SingleFilter {
    get URIField(): string;
    operator(current_value: any, filter_value: any): boolean;
    alias(alias_field: any): SingleFilter;
}
declare function ILIKE(field: string, value?: any, value_type?: ValueType): SingleFilter;

declare class AND_Filter extends ComboFilter {
    isMatch(obj: any): boolean;
}
declare function AND(...filters: Filter[]): Filter;

declare const ASC = true;
declare const DESC = false;
declare type ORDER_BY = Map<string, boolean>;
declare type RawObject = any;
declare type RawData = any;
interface Selector {
    filter?: Filter;
    order_by?: ORDER_BY;
    offset?: number;
    limit?: number;
    relations?: Array<string>;
    fields?: Array<string>;
    omit?: Array<string>;
}

declare const config: {
    DEFAULT_PAGE_SIZE: number;
    AUTO_UPDATE_DELAY: number;
    UPDATE_SEARCH_PARAMS: (search_params: URLSearchParams) => void;
    NON_FIELD_ERRORS_KEY: string;
};

declare abstract class ReadOnlyModel extends Model {
    create(): Promise<void>;
    update(): Promise<void>;
    delete(): Promise<void>;
    save(): Promise<void>;
}

declare function field_field(obj: any, field_name: any): void;
declare function field(cls: any, field_name: string): void;

declare function foreign(foreign_model: any, foreign_id_name?: string): (cls: any, field_name: string) => void;

declare function one(remote_model: any, remote_foreign_id_name?: string): (cls: any, field_name: string) => void;

declare function many(remote_model: any, remote_foreign_id_name?: string): (cls: any, field_name: string) => void;

declare function waitIsTrue(obj: any, field: string): Promise<Boolean>;
declare function waitIsFalse(obj: any, field: string): Promise<Boolean>;

export { AND, AND_Filter, ASC, Adapter, ArrayInput, ArrayNumberInput, ArrayStringInput, BooleanInput, ComboFilter, DESC, DISPOSER_AUTOUPDATE, DateInput, DateTimeInput, EQ, EQV, EQV_Filter, EQ_Filter, EnumInput, Filter, Form, GT, GTE, GTE_Filter, GT_Filter, ILIKE, ILIKE_Filter, IN, IN_Filter, Input, InputConstructorArgs, LIKE, LIKE_Filter, LT, LTE, LTE_Filter, LT_Filter, LocalAdapter, Model, NOT_EQ, NOT_EQ_Filter, NumberInput, ORDER_BY, OrderByInput, Query, QueryBase, QueryPage, QueryX, QueryXCacheSync, QueryXDistinct, QueryXPage, QueryXProps, QueryXRaw, QueryXRawPage, QueryXStream, RawData, RawObject, ReadOnlyModel, Selector, SingleFilter, StringInput, ValueType, XAND, XAND_Filter, XComboFilter, XEQ, XEQV, XEQV_Filter, XEQ_Filter, XFilter, XGT, XGTE, XGTE_Filter, XGT_Filter, XILIKE, XILIKE_Filter, XIN, XIN_Filter, XLIKE, XLIKE_Filter, XLT, XLTE, XLTE_Filter, XLT_Filter, XNOT_EQ, XNOT_EQ_Filter, XSingleFilter, autoResetArrayOfIDs, autoResetArrayToEmpty, autoResetId, config, field, field_field, foreign, local, local_store, many, match, model, one, waitIsFalse, waitIsTrue };
