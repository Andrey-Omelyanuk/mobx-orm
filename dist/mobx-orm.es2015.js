
  /**
   * @license
   * author: Andrey Omelyanuk
   * mobx-orm.js v1.0.44
   * Released under the MIT license.
   */

import { observable, action, makeObservable, runInAction, autorun, computed, reaction, observe, intercept, extendObservable } from 'mobx';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

class Filter {
}

// Note: any type can be === null
var ValueType;
(function (ValueType) {
    ValueType[ValueType["STRING"] = 0] = "STRING";
    ValueType[ValueType["NUMBER"] = 1] = "NUMBER";
    ValueType[ValueType["BOOL"] = 2] = "BOOL";
})(ValueType || (ValueType = {}));
class SingleFilter extends Filter {
    constructor(field, value, value_type) {
        super();
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // string|number|boolean|null|undefined|Array<any>
        Object.defineProperty(this, "value_type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // use it for UI when we need to show options for select
        this.field = field;
        // auto detect type if type was not provided
        if (value_type === undefined) {
            switch (typeof value) {
                case 'number':
                    this.value_type = ValueType.NUMBER;
                    break;
                case 'boolean':
                    this.value_type = ValueType.BOOL;
                    break;
                default:
                    this.value_type = ValueType.STRING;
            }
        }
        else {
            this.value_type = value_type;
        }
        this.value = value;
        makeObservable(this);
    }
    get URLSearchParams() {
        let search_params = new URLSearchParams();
        let value = this.deserialize();
        value !== undefined && search_params.set(this.URIField, value);
        return search_params;
    }
    setFromURI(uri) {
        const search_params = new URLSearchParams(uri);
        const field_name = this.URIField;
        const value = search_params.has(field_name) ? search_params.get(field_name) : undefined;
        this.serialize(value);
    }
    isMatch(obj) {
        // it's always match if value of filter is undefined
        if (this.value === undefined)
            return true;
        return match(obj, this.field, this.value, this.operator);
    }
    // convert from string
    serialize(value) {
        let result;
        if (value === undefined) {
            this.value = undefined;
            return;
        }
        if (value === 'null') {
            this.value = null;
            return;
        }
        switch (this.value_type) {
            case ValueType.STRING:
                result = value;
                break;
            case ValueType.NUMBER:
                result = parseInt(value);
                if (isNaN(result))
                    result = undefined;
                break;
            case ValueType.BOOL:
                // I'm not shure that it is string
                result = value === 'true' ? true : value === 'false' ? false : undefined;
                break;
        }
        this.value = result;
    }
    // convert to string
    deserialize(value) {
        if (value === undefined) {
            value = this.value;
        }
        if (value === undefined)
            return undefined;
        if (value === null)
            return 'null';
        switch (this.value_type) {
            case ValueType.STRING:
                return '' + value;
            case ValueType.NUMBER:
                if (isNaN(value) || value === true || value === false) {
                    return undefined;
                }
                else {
                    return '' + value;
                }
            case ValueType.BOOL:
                // I'm not shure that it is string
                return !!value ? 'true' : 'false';
        }
    }
}
__decorate([
    observable,
    __metadata("design:type", Object)
], SingleFilter.prototype, "value", void 0);
__decorate([
    action('MO: Filter - set from URI'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SingleFilter.prototype, "setFromURI", null);
function match(obj, field_name, filter_value, operator) {
    let field_names = field_name.split('__');
    let current_field_name = field_names[0];
    let current_value = obj[current_field_name];
    if (field_names.length === 1)
        return operator(current_value, filter_value);
    else if (field_names.length > 1) {
        let next_field_name = field_name.substring(field_names[0].length + 2);
        // we have object relation
        if (typeof current_value === 'object' && current_value !== null) {
            if (Array.isArray(current_value)) {
                let result = false;
                for (const item of current_value) {
                    result = match(item, next_field_name, filter_value, operator);
                    if (result)
                        return result;
                }
            }
            else {
                return match(current_value, next_field_name, filter_value, operator);
            }
        }
    }
    return false;
}

class ComboFilter extends Filter {
    constructor(filters) {
        super();
        Object.defineProperty(this, "filters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.filters = filters;
    }
    get URLSearchParams() {
        let search_params = new URLSearchParams();
        for (let filter of this.filters) {
            filter.URLSearchParams.forEach((value, key) => search_params.set(key, value));
        }
        return search_params;
    }
    setFromURI(uri) {
        for (let filter of this.filters) {
            filter.setFromURI(uri);
        }
    }
}

class EQ_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__eq`;
    }
    operator(value_a, value_b) {
        return value_a === value_b;
    }
}
function EQ(field, value, value_type) {
    return new EQ_Filter(field, value, value_type);
}

class NOT_EQ_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__not_eq`;
    }
    operator(value_a, value_b) {
        return value_a !== value_b;
    }
}
function NOT_EQ(field, value, value_type) {
    return new NOT_EQ_Filter(field, value, value_type);
}

class IN_Filter extends SingleFilter {
    constructor(field, value, value_type) {
        if (value === undefined) {
            value = [];
        }
        super(field, value, value_type);
    }
    serialize(value) {
        if (value === undefined) {
            this.value = [];
            return;
        }
        let result = [];
        for (const i of value.split(',')) {
            super.serialize(i);
            if (this.value !== undefined) {
                result.push(this.value);
            }
        }
        this.value = result;
    }
    deserialize() {
        let result = [];
        for (const i of this.value) {
            let v = super.deserialize(i);
            if (v !== undefined) {
                result.push(v);
            }
        }
        return result.length ? result.join(',') : undefined;
    }
    get URIField() {
        return `${this.field}__in`;
    }
    operator(value_a, value_b) {
        // it's always match if value of filter is empty []
        if (value_b.length === 0)
            return true;
        for (let v of value_b) {
            if (v === value_a)
                return true;
        }
        return false;
    }
}
function IN(field, value, value_type) {
    return new IN_Filter(field, value, value_type);
}

class AND_Filter extends ComboFilter {
    isMatch(obj) {
        for (let filter of this.filters) {
            if (!filter.isMatch(obj)) {
                return false;
            }
        }
        return true;
    }
}
function AND(...filters) { return new AND_Filter(filters); }

const ASC = true;
const DESC = false;
class QueryBase {
    constructor(adapter, base_cache, selector) {
        Object.defineProperty(this, "filters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "order_by", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fields", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "omit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "relations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // I cannot declare these observables directly into QueryPage
        Object.defineProperty(this, "offset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "limit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "total", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "need_to_update", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        }); // set to true then filters/order_by/page/page_size was changed and back to false after load
        Object.defineProperty(this, "__base_cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__adapter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "__is_loading", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "__is_ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "__error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "__disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "__disposer_objects", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.__base_cache = base_cache;
        this.__adapter = adapter;
        this.filters = selector === null || selector === void 0 ? void 0 : selector.filter;
        this.order_by = (selector === null || selector === void 0 ? void 0 : selector.order_by) || new Map();
        this.fields = (selector === null || selector === void 0 ? void 0 : selector.fields) || [];
        this.omit = (selector === null || selector === void 0 ? void 0 : selector.omit) || [];
        this.relations = (selector === null || selector === void 0 ? void 0 : selector.relations) || [];
        makeObservable(this);
    }
    get is_loading() { return this.__is_loading; }
    get is_ready() { return this.__is_ready; }
    get error() { return this.__error; }
    destroy() {
        while (this.__disposers.length) {
            this.__disposers.pop()();
        }
        for (let __id in this.__disposer_objects) {
            this.__disposer_objects[__id]();
            delete this.__disposer_objects[__id];
        }
    }
    // use it if everybody should know that the query data is updating
    async load() {
        this.__is_loading = true;
        try {
            await this.shadowLoad();
        }
        finally {
            // we have to wait a next tick before set __is_loading to true, mobx recalculation should be done before
            await new Promise(resolve => setTimeout(resolve));
            runInAction(() => this.__is_loading = false);
        }
    }
    get select_many() {
        return {
            filter: this.filters,
            order_by: this.order_by,
            fields: this.fields,
            omit: this.omit,
            relations: this.relations,
            offset: this.offset,
            limit: this.limit
        };
    }
    // use it if you need use promise instead of observe is_ready
    ready() {
        return new Promise((resolve, reject) => {
            autorun((reaction) => {
                if (this.__is_ready) {
                    reaction.dispose();
                    resolve(this.__is_ready);
                }
            });
        });
    }
    // use it if you need use promise instead of observe is_loading
    loading() {
        return new Promise((resolve, reject) => {
            autorun((reaction) => {
                if (!this.__is_loading) {
                    reaction.dispose();
                    resolve(!this.__is_loading);
                }
            });
        });
    }
}
__decorate([
    observable,
    __metadata("design:type", Filter)
], QueryBase.prototype, "filters", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], QueryBase.prototype, "order_by", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], QueryBase.prototype, "fields", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], QueryBase.prototype, "omit", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], QueryBase.prototype, "relations", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], QueryBase.prototype, "offset", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], QueryBase.prototype, "limit", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], QueryBase.prototype, "total", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], QueryBase.prototype, "need_to_update", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], QueryBase.prototype, "__items", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], QueryBase.prototype, "__is_loading", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], QueryBase.prototype, "__is_ready", void 0);
__decorate([
    observable,
    __metadata("design:type", String)
], QueryBase.prototype, "__error", void 0);
__decorate([
    action('MO: Query Base - load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueryBase.prototype, "load", null);

/*
Reactive items:
- delete from the cache -> delete from items
- add to the cache
    - the new obj is match the filters  -> add the obj to items
- obj was changed
    - не было но уже    попадание по фильтрам -> add the obj to items
    -    было но уже не попадание по фильтрам -> remove the obj from items
*/
class Query extends QueryBase {
    constructor(adapter, base_cache, selector) {
        super(adapter, base_cache, selector);
        this.__disposers.push(reaction(() => {
            var _a;
            return {
                filter: (_a = this.filters) === null || _a === void 0 ? void 0 : _a.URLSearchParams,
                order_by: this.order_by,
            };
        }, action('MO: Query Base - need to update', () => this.need_to_update = true)));
        // watch the cache for changes, and update items if needed
        this.__disposers.push(observe(this.__base_cache, action('MO: Query - update from cache changes', (change) => {
            if (change.type == 'add') {
                this.__watch_obj(change.newValue);
            }
            if (change.type == "delete") {
                let id = change.name;
                let obj = change.oldValue;
                this.__disposer_objects[id]();
                delete this.__disposer_objects[id];
                let i = this.__items.indexOf(obj);
                if (i != -1)
                    this.__items.splice(i, 1);
            }
        })));
        // ch all exist objects of model 
        for (let [id, obj] of this.__base_cache) {
            this.__watch_obj(obj);
        }
    }
    async shadowLoad() {
        try {
            let objs = await this.__adapter.load(this.select_many);
            this.__load(objs);
            // we have to wait a next tick before set __is_ready to true, mobx recalculation should be done before
            await new Promise(resolve => setTimeout(resolve));
            runInAction(() => {
                this.__is_ready = true;
                this.need_to_update = false;
            });
        }
        catch (e) {
            // 'MO: Query Base - shadow load - error',
            runInAction(() => this.__error = e);
            throw e;
        }
    }
    get items() {
        let __items = this.__items.map(x => x); // copy __items (not deep)
        if (this.order_by.size) {
            let compare = (a, b) => {
                for (const [key, value] of this.order_by) {
                    if (value === ASC) {
                        if ((a[key] === undefined || a[key] === null) && (b[key] !== undefined && b[key] !== null))
                            return 1;
                        if ((b[key] === undefined || b[key] === null) && (a[key] !== undefined && a[key] !== null))
                            return -1;
                        if (a[key] < b[key])
                            return -1;
                        if (a[key] > b[key])
                            return 1;
                    }
                    else {
                        if ((a[key] === undefined || a[key] === null) && (b[key] !== undefined && b[key] !== null))
                            return -1;
                        if ((b[key] === undefined || b[key] === null) && (a[key] !== undefined && a[key] !== null))
                            return 1;
                        if (a[key] < b[key])
                            return 1;
                        if (a[key] > b[key])
                            return -1;
                    }
                }
                return 0;
            };
            __items.sort(compare);
        }
        return __items;
    }
    __load(objs) {
        // Query don't need to overide the items, query's items should be get only from the cache
        // Query page have to use it only 
    }
    __watch_obj(obj) {
        if (this.__disposer_objects[obj.id])
            this.__disposer_objects[obj.id]();
        this.__disposer_objects[obj.id] = reaction(() => !this.filters || this.filters.isMatch(obj), action('MO: Query - obj was changed', (should) => {
            let i = this.__items.indexOf(obj);
            // should be in the items and it is not in the items? add it to the items
            if (should && i == -1)
                this.__items.push(obj);
            // should not be in the items and it is in the items? remove it from the items
            if (!should && i != -1)
                this.__items.splice(i, 1);
        }), { fireImmediately: true });
    }
}
__decorate([
    action('MO: Query Base - shadow load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Query.prototype, "shadowLoad", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Query.prototype, "items", null);

class QueryPage extends QueryBase {
    __load(objs) {
        this.__items.splice(0, this.__items.length);
        this.__items.push(...objs);
    }
    setPageSize(size) { this.limit = size; }
    setPage(n) { this.offset = this.limit * n; }
    goToFirstPage() { this.offset = 0; }
    goToPrevPage() { this.offset = this.offset < this.limit ? 0 : this.offset - this.limit; }
    goToNextPage() { this.offset = this.offset + this.limit; }
    goToLastPage() { this.offset = Math.floor(this.total / this.limit) * this.limit; }
    get is_first_page() { return this.offset === 0; }
    get is_last_page() { return this.offset + this.limit >= this.total; }
    get current_page() { return this.offset / this.limit; }
    get total_pages() { return Math.floor(this.total / this.limit); }
    get items() { return this.__items; }
    constructor(adapter, base_cache, selector) {
        super(adapter, base_cache, selector);
        this.offset = (selector === null || selector === void 0 ? void 0 : selector.offset) || 0;
        this.limit = (selector === null || selector === void 0 ? void 0 : selector.limit) || 50;
        this.__disposers.push(reaction(() => {
            var _a;
            return {
                filter: (_a = this.filters) === null || _a === void 0 ? void 0 : _a.URLSearchParams,
                order_by: this.order_by,
                offset: this.offset,
                limit: this.limit,
            };
        }, action('MO: Query Base - need to update', () => this.need_to_update = true)));
    }
    async shadowLoad() {
        try {
            const objs = await this.__adapter.load(this.select_many);
            this.__load(objs);
            const total = await this.__adapter.getTotalCount(this.filters);
            runInAction(() => {
                this.total = total;
                this.__is_ready = true;
                this.need_to_update = false;
            });
        }
        catch (e) {
            // 'MO: Query Base - shadow load - error',
            runInAction(() => this.__error = e);
            throw e;
        }
    }
}
__decorate([
    action('MO: Query Page - load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "__load", null);
__decorate([
    action('MO: set page size'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "setPageSize", null);
__decorate([
    action('MO: set page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "setPage", null);
__decorate([
    action('MO: fisrt page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "goToFirstPage", null);
__decorate([
    action('MO: prev page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "goToPrevPage", null);
__decorate([
    action('MO: next page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "goToNextPage", null);
__decorate([
    action('MO: last page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "goToLastPage", null);
__decorate([
    action('MO: Query Base - shadow load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueryPage.prototype, "shadowLoad", null);

class Model {
    constructor(...args) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "__init_data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    // add obj to the cache
    static inject(obj) {
        if (obj.id === undefined)
            throw new Error(`Object should have id!`);
        if (this.__cache.has(obj.id)) {
            throw new Error(`Object with id ${obj.id} already exist in the cache of model: "${this.prototype.constructor.name}")`);
        }
        this.__cache.set(obj.id, obj);
    }
    // remove obj from the cache
    static eject(obj) {
        if (this.__cache.has(obj.id))
            this.__cache.delete(obj.id);
    }
    static getQuery(props) {
        return new Query(this.__adapter, this.__cache, props);
    }
    static getQueryPage(props) {
        return new QueryPage(this.__adapter, this.__cache, props);
    }
    static get(id) {
        return this.__cache.get(id);
    }
    static async find(props) {
        return this.__adapter.find(props);
    }
    static updateCache(raw_obj) {
        let obj;
        if (this.__cache.has(raw_obj.id)) {
            obj = this.__cache.get(raw_obj.id);
            obj.updateFromRaw(raw_obj);
        }
        else {
            obj = new this(raw_obj);
        }
        return obj;
    }
    static clearCache() {
        // id = undefined is equal to remove obj from cache 
        for (let obj of this.__cache.values()) {
            obj.id = undefined;
        }
    }
    get model() {
        return this.constructor.__proto__;
    }
    // data only from fields (no ids)
    get raw_data() {
        let raw_data = {};
        for (let field_name in this.model.__fields) {
            if (this[field_name] !== undefined) {
                raw_data[field_name] = this[field_name];
            }
        }
        return raw_data;
    }
    // it is raw_data + id
    get raw_obj() {
        let raw_obj = this.raw_data;
        raw_obj.id = this.id;
        return raw_obj;
    }
    get only_changed_raw_data() {
        let raw_data = {};
        for (let field_name in this.model.__fields) {
            if (this[field_name] !== undefined && this[field_name] != this.__init_data[field_name]) {
                raw_data[field_name] = this[field_name];
            }
        }
        return raw_data;
    }
    get is_changed() {
        let is_changed = false;
        for (let field_name in this.model.__fields) {
            if (this[field_name] != this.__init_data[field_name]) {
                is_changed = true;
            }
        }
        return is_changed;
    }
    async create() { return await this.model.__adapter.create(this); }
    async update() { return await this.model.__adapter.update(this); }
    async delete() { return await this.model.__adapter.delete(this); }
    async save() { return this.id === undefined ? this.create() : this.update(); }
    refreshInitData() {
        if (this.__init_data === undefined)
            this.__init_data = {};
        for (let field_name in this.model.__fields) {
            this.__init_data[field_name] = this[field_name];
        }
    }
    // TODO: add test
    cancelLocalChanges() {
        for (let field_name in this.model.__fields) {
            if (this[field_name] !== this.__init_data[field_name]) {
                this[field_name] = this.__init_data[field_name];
            }
        }
    }
    updateFromRaw(raw_obj) {
        if (this.id === undefined && raw_obj.id !== undefined) {
            this.id = raw_obj.id;
        }
        // update the fields if the raw data is exist and it is different 
        for (let field_name in this.model.__fields) {
            if (raw_obj[field_name] !== undefined && raw_obj[field_name] !== this[field_name]) {
                this[field_name] = raw_obj[field_name];
            }
        }
        for (let relation in this.model.__relations) {
            const settings = this.model.__relations[relation].settings;
            if (settings.foreign_model && raw_obj[relation]) {
                settings.foreign_model.updateCache(raw_obj[relation]);
                this[settings.foreign_id_name] = raw_obj[relation].id;
            }
            else if (settings.remote_model && raw_obj[relation]) {
                // many
                if (Array.isArray(raw_obj[relation])) {
                    for (const i of raw_obj[relation]) {
                        settings.remote_model.updateCache(i);
                    }
                }
                // one 
                else {
                    settings.remote_model.updateCache(raw_obj[relation]);
                }
            }
        }
    }
}
__decorate([
    observable,
    __metadata("design:type", Number)
], Model.prototype, "id", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], Model.prototype, "__init_data", void 0);
__decorate([
    action('MO: obj - refresh init data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Model.prototype, "refreshInitData", null);
__decorate([
    action('MO: obj - cancel local changes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Model.prototype, "cancelLocalChanges", null);
__decorate([
    action('MO: obj - update from raw'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Model.prototype, "updateFromRaw", null);
__decorate([
    action('MO: model - inject'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Model]),
    __metadata("design:returntype", void 0)
], Model, "inject", null);
__decorate([
    action('MO: model - eject'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Model]),
    __metadata("design:returntype", void 0)
], Model, "eject", null);
__decorate([
    action('MO: model - update the cache from raw'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Model)
], Model, "updateCache", null);
__decorate([
    action('MO: model - clear the cache'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Model, "clearCache", null);
// Decorator
function model(constructor) {
    var original = constructor;
    original.__cache = observable(new Map());
    // the new constructor
    let f = function (...args) {
        let c = class extends original {
            constructor(...args) { super(...args); }
        };
        c.__proto__ = original;
        let obj = new c();
        let model = obj.model;
        makeObservable(obj);
        // id field reactions
        obj.__disposers.set('before changes', intercept(obj, 'id', (change) => {
            if (change.newValue !== undefined && obj.id !== undefined)
                throw new Error(`You cannot change id field: ${obj.id} to ${change.newValue}`);
            if (obj.id !== undefined && change.newValue === undefined)
                obj.model.eject(obj);
            return change;
        }));
        obj.__disposers.set('after changes', observe(obj, 'id', (change) => {
            if (obj.id !== undefined)
                obj.model.inject(obj);
        }));
        // apply fields decorators
        for (let field_name in model.__fields) {
            model.__fields[field_name].decorator(obj, field_name);
        }
        // apply __relations decorators
        for (let field_name in model.__relations) {
            model.__relations[field_name].decorator(obj, field_name);
        }
        if (args[0])
            obj.updateFromRaw(args[0]);
        obj.refreshInitData();
        return obj;
    };
    f.__proto__ = original;
    f.prototype = original.prototype; // copy prototype so intanceof operator still works
    Object.defineProperty(f, "name", { value: original.name });
    return f; // return new constructor (will override original)
}

function field_field(obj, field_name) {
    // make observable and set default value
    extendObservable(obj, { [field_name]: obj[field_name] });
}
function field(cls, field_name) {
    let model = cls.constructor;
    if (model.__fields === undefined)
        model.__fields = {};
    model.__fields[field_name] = { decorator: field_field }; // register field 
}

function field_foreign(obj, field_name) {
    let settings = obj.model.__relations[field_name].settings;
    let foreign_model = settings.foreign_model;
    let foreign_id_name = settings.foreign_id_name;
    // make observable and set default value
    extendObservable(obj, { [field_name]: undefined });
    reaction(
    // watch on foreign cache for foreign object
    () => {
        if (obj[foreign_id_name] === undefined)
            return undefined;
        if (obj[foreign_id_name] === null)
            return null;
        return foreign_model.__cache.get(obj[foreign_id_name]);
    }, 
    // update foreign field
    action('MO: Foreign - update', (_new, _old) => obj[field_name] = _new), { fireImmediately: true });
}
function foreign(foreign_model, foreign_id_name) {
    return function (cls, field_name) {
        let model = cls.constructor;
        if (model.__relations === undefined)
            model.__relations = {};
        // register field 
        model.__relations[field_name] = {
            decorator: field_foreign,
            settings: {
                foreign_model: foreign_model,
                // if it is empty then try auto detect it (it works only with single id) 
                foreign_id_name: foreign_id_name !== undefined ? foreign_id_name : `${field_name}_id`
            }
        };
    };
}

function field_one(obj, field_name) {
    // make observable and set default value
    extendObservable(obj, { [field_name]: undefined });
}
function one(remote_model, remote_foreign_id_name) {
    return function (cls, field_name) {
        let model = cls.prototype.constructor;
        if (model.__relations === undefined)
            model.__relations = {};
        // if it is empty then try auto detect it (it works only with single id) 
        remote_foreign_id_name = remote_foreign_id_name !== undefined ? remote_foreign_id_name : `${model.name.toLowerCase()}_id`;
        model.__relations[field_name] = {
            decorator: field_one,
            settings: {
                remote_model: remote_model,
                remote_foreign_id_name: remote_foreign_id_name
            }
        };
        const disposer_name = `MO: One - update - ${model.name}.${field_name}`;
        observe(remote_model.__cache, (change) => {
            let remote_obj;
            switch (change.type) {
                case 'add':
                    remote_obj = change.newValue;
                    remote_obj.__disposers.set(disposer_name, reaction(() => {
                        return {
                            id: remote_obj[remote_foreign_id_name],
                            obj: model.__cache.get(remote_obj[remote_foreign_id_name])
                        };
                    }, action(disposer_name, (_new, _old) => {
                        if (_old === null || _old === void 0 ? void 0 : _old.obj)
                            _old.obj[field_name] = _new.id ? undefined : null;
                        if (_new === null || _new === void 0 ? void 0 : _new.obj)
                            _new.obj[field_name] = remote_obj;
                    }), { fireImmediately: true }));
                    break;
                case 'delete':
                    remote_obj = change.oldValue;
                    if (remote_obj.__disposers.get(disposer_name)) {
                        remote_obj.__disposers.get(disposer_name)();
                        remote_obj.__disposers.delete(disposer_name);
                    }
                    let obj = model.__cache.get(remote_obj[remote_foreign_id_name]);
                    if (obj)
                        runInAction(() => { obj[field_name] = undefined; });
                    break;
            }
        });
    };
}

function field_many(obj, field_name) {
    extendObservable(obj, { [field_name]: [] });
}
function many(remote_model, remote_foreign_id_name) {
    return function (cls, field_name) {
        let model = cls.prototype.constructor;
        if (model.__relations === undefined)
            model.__relations = {};
        // if it is empty then try auto detect it (it works only with single id) 
        remote_foreign_id_name = remote_foreign_id_name !== undefined ? remote_foreign_id_name : `${model.name.toLowerCase()}_id`;
        model.__relations[field_name] = {
            decorator: field_many,
            settings: {
                remote_model: remote_model,
                remote_foreign_id_name: remote_foreign_id_name
            }
        };
        const disposer_name = `MO: Many - update - ${model.name}.${field_name}`;
        // watch for remote object in the cache 
        observe(remote_model.__cache, (remote_change) => {
            let remote_obj;
            switch (remote_change.type) {
                case 'add':
                    remote_obj = remote_change.newValue;
                    remote_obj.__disposers.set(disposer_name, reaction(() => model.__cache.get(remote_obj[remote_foreign_id_name]), action(disposer_name, (_new, _old) => {
                        if (_old) {
                            const i = _old[field_name].indexOf(remote_obj);
                            if (i > -1)
                                _old[field_name].splice(i, 1);
                        }
                        if (_new) {
                            const i = _new[field_name].indexOf(remote_obj);
                            if (i === -1)
                                _new[field_name].push(remote_obj);
                        }
                    }), { fireImmediately: true }));
                    break;
                case 'delete':
                    remote_obj = remote_change.oldValue;
                    if (remote_obj.__disposers.get(disposer_name)) {
                        remote_obj.__disposers.get(disposer_name)();
                        remote_obj.__disposers.delete(disposer_name);
                    }
                    let obj = model.__cache.get(remote_obj[remote_foreign_id_name]);
                    if (obj) {
                        const i = obj[field_name].indexOf(remote_obj);
                        if (i > -1)
                            runInAction(() => { obj[field_name].splice(i, 1); });
                    }
                    break;
            }
        });
    };
}

class Adapter {
    constructor(model) {
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.model = model;
    }
    async create(obj) {
        let raw_obj = await this.__create(obj.raw_data);
        obj.updateFromRaw(raw_obj);
        obj.refreshInitData(); // backend can return default values and they should be in __init_data
        return obj;
    }
    async update(obj) {
        let raw_obj = await this.__update(obj.id, obj.only_changed_raw_data);
        obj.updateFromRaw(raw_obj);
        obj.refreshInitData();
        return obj;
    }
    async delete(obj) {
        await this.__delete(obj.id);
        runInAction(() => obj.id = undefined);
        return obj;
    }
    /* Returns ONE object */
    async find(selector) {
        let raw_obj = await this.__find(selector);
        return this.model.updateCache(raw_obj);
    }
    /* Returns MANY objects */
    async load(selector) {
        let raw_objs = await this.__load(selector);
        let objs = [];
        // it should be happend in one big action
        runInAction(() => {
            for (let raw_obj of raw_objs) {
                objs.push(this.model.updateCache(raw_obj));
            }
        });
        return objs;
    }
}

/*
You can use this adapter for mock data or for unit test
*/
let local_store = {};
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class LocalAdapter extends Adapter {
    constructor(model, store_name) {
        super(model);
        Object.defineProperty(this, "store_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // delays for simulate real usage, use it only for tests
        Object.defineProperty(this, "delay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.store_name = store_name ? store_name : model.__proto__.name;
        local_store[this.store_name] = {};
    }
    init_local_data(data) {
        let objs = {};
        for (let obj of data) {
            objs[obj.id] = obj;
        }
        local_store[this.store_name] = objs;
    }
    async __create(raw_data) {
        if (this.delay)
            await timeout(this.delay);
        // calculate and set new ID
        let ids = [0];
        for (let id of Object.keys(local_store[this.store_name])) {
            ids.push(parseInt(id));
        }
        let max = Math.max.apply(null, ids);
        raw_data.id = max + 1;
        local_store[this.store_name][raw_data.id] = raw_data;
        return raw_data;
    }
    async __update(obj_id, only_changed_raw_data) {
        if (this.delay)
            await timeout(this.delay);
        let raw_obj = local_store[this.store_name][obj_id];
        for (let field of Object.keys(only_changed_raw_data)) {
            raw_obj[field] = only_changed_raw_data[field];
        }
        return raw_obj;
    }
    async __delete(obj_id) {
        if (this.delay)
            await timeout(this.delay);
        delete local_store[this.store_name][obj_id];
    }
    async __find(selector) {
        if (this.delay)
            await timeout(this.delay);
        // TODO: apply where, and throw error if no obj or multi objs
        let raw_obj = Object.values(local_store[this.store_name])[0];
        return raw_obj;
    }
    async __load(selector) {
        const { filter, order_by, limit, offset } = selector || {};
        if (this.delay)
            await timeout(this.delay);
        let raw_objs = [];
        if (filter) {
            for (let raw_obj of Object.values(local_store[this.store_name])) {
            }
        }
        else {
            raw_objs = Object.values(local_store[this.store_name]);
        }
        // order_by (sort)
        if (order_by) {
            raw_objs = raw_objs.sort((obj_a, obj_b) => {
                for (let sort_by_field of order_by) {
                }
                return 0;
            });
        }
        // page
        if (limit !== undefined && offset !== undefined) {
            raw_objs = raw_objs.slice(offset, offset + limit);
        }
        return raw_objs;
    }
    async getTotalCount(where) {
        return Object.values(local_store[this.store_name]).length;
    }
}
// model decorator
function local() {
    return (cls) => {
        let adapter = new LocalAdapter(cls);
        cls.__proto__.__adapter = adapter;
    };
}
// TODO: where example
// let where = [
//             ["field_a", "==", 10, "and", "field_b == 20"],
//     "or",   ["field_a", "<=",  5, "and", "field_b", "contain", "test"]
// ]

export { AND, AND_Filter, ASC, Adapter, ComboFilter, DESC, EQ, EQ_Filter, Filter, IN, IN_Filter, LocalAdapter, Model, NOT_EQ, NOT_EQ_Filter, Query, QueryBase, QueryPage, SingleFilter, ValueType, field, field_field, foreign, local, local_store, many, match, model, one };
//# sourceMappingURL=mobx-orm.es2015.js.map
