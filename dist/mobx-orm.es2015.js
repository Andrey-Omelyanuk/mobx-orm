
  /**
   * @license
   * author: Andrey Omelyanuk
   * mobx-orm.js v1.3.14
   * Released under the MIT license.
   */

import { observable, action, makeObservable, reaction, runInAction, autorun, computed, observe, intercept, extendObservable } from 'mobx';
import _ from 'lodash';

const ASC = true;
const DESC = false;

// Global config of Mobx-ORM
const config = {
    DEFAULT_PAGE_SIZE: 50,
    AUTO_UPDATE_DELAY: 100,
    UPDATE_SEARCH_PARAMS: (search_params) => {
        window.history.pushState(null, '', `${window.location.pathname}?${search_params.toString()}`);
    },
    NON_FIELD_ERRORS_KEY: 'non_field_errors',
};

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
    ValueType[ValueType["DATETIME"] = 3] = "DATETIME";
    ValueType[ValueType["DATE"] = 4] = "DATE";
})(ValueType || (ValueType = {}));
class SingleFilter extends Filter {
    constructor(field, value, value_type, options) {
        super();
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value_type", {
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
        }); // string|number|boolean|null|undefined|string[]|number[]
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.options = options;
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
                    this.value_type = value instanceof Date ? ValueType.DATETIME : ValueType.STRING;
            }
        }
        else {
            this.value_type = value_type;
        }
        this.value = value;
        makeObservable(this);
        // this.__disposers.push(autorun(() => {
        //     if (this.value === undefined && getDefaultValue !== undefined) {
        //         this.value = getDefaultValue(this)
        //     }
        // }
    }
    get URLSearchParams() {
        let search_params = new URLSearchParams();
        let value = this.deserialize();
        value !== undefined && search_params.set(this.URIField, value);
        return search_params;
    }
    set(value) {
        this.value = value;
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
        return match$1(obj, this.field, this.value, this.operator);
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
            case ValueType.DATE:
            case ValueType.DATETIME:
                result = new Date(value);
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
            case ValueType.DATE:
                return value instanceof Date ? value.toISOString().split('T')[0] : "";
            case ValueType.DATETIME:
                return value instanceof Date ? value.toISOString() : "";
        }
    }
}
__decorate([
    observable,
    __metadata("design:type", Object)
], SingleFilter.prototype, "value", void 0);
__decorate([
    action('MO: Filter - set'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SingleFilter.prototype, "set", null);
__decorate([
    action('MO: Filter - set from URI'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SingleFilter.prototype, "setFromURI", null);
function match$1(obj, field_name, filter_value, operator) {
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
                    result = match$1(item, next_field_name, filter_value, operator);
                    if (result)
                        return result;
                }
            }
            else {
                return match$1(current_value, next_field_name, filter_value, operator);
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
        return `${this.field}`;
    }
    operator(value_a, value_b) {
        return value_a === value_b;
    }
    alias(alias_field) {
        const alias_filter = EQ(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.value = value; }, { fireImmediately: true });
        return alias_filter;
    }
}
// EQV is a verbose version of EQ
class EQV_Filter extends EQ_Filter {
    get URIField() {
        return `${this.field}__eq`;
    }
}
function EQ(field, value, value_type) {
    return new EQ_Filter(field, value, value_type);
}
function EQV(field, value, value_type) {
    return new EQV_Filter(field, value, value_type);
}

class NOT_EQ_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__not_eq`;
    }
    operator(value_a, value_b) {
        return value_a !== value_b;
    }
    alias(alias_field) {
        const alias_filter = NOT_EQ(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.value = value; }, { fireImmediately: true });
        return alias_filter;
    }
}
function NOT_EQ(field, value, value_type) {
    return new NOT_EQ_Filter(field, value, value_type);
}

class GT_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__gt`;
    }
    operator(value_a, value_b) {
        return value_a > value_b;
    }
    alias(alias_field) {
        const alias_filter = GT(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.value = value; }, { fireImmediately: true });
        return alias_filter;
    }
}
function GT(field, value, value_type) {
    return new GT_Filter(field, value, value_type);
}

class GTE_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__gte`;
    }
    operator(value_a, value_b) {
        return value_a >= value_b;
    }
    alias(alias_field) {
        const alias_filter = GTE(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.value = value; }, { fireImmediately: true });
        return alias_filter;
    }
}
function GTE(field, value, value_type) {
    return new GTE_Filter(field, value, value_type);
}

class LT_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__lt`;
    }
    operator(value_a, value_b) {
        return value_a < value_b;
    }
    alias(alias_field) {
        const alias_filter = LT(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.value = value; }, { fireImmediately: true });
        return alias_filter;
    }
}
function LT(field, value, value_type) {
    return new LT_Filter(field, value, value_type);
}

class LTE_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__lte`;
    }
    operator(value_a, value_b) {
        return value_a <= value_b;
    }
    alias(alias_field) {
        const alias_filter = LTE(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.value = value; }, { fireImmediately: true });
        return alias_filter;
    }
}
function LTE(field, value, value_type) {
    return new LTE_Filter(field, value, value_type);
}

class IN_Filter extends SingleFilter {
    constructor(field, value, value_type) {
        if (value === undefined) {
            value = [];
        }
        super(field, value, value_type);
    }
    alias(alias_field) {
        const alias_filter = IN(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.value = value; }, { fireImmediately: true });
        return alias_filter;
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

class LIKE_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__contains`;
    }
    operator(current_value, filter_value) {
        return current_value.includes(filter_value);
    }
    alias(alias_field) {
        const alias_filter = LIKE(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.set(value); }, { fireImmediately: true });
        return alias_filter;
    }
}
function LIKE(field, value, value_type) {
    return new LIKE_Filter(field, value, value_type);
}

class ILIKE_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__icontains`;
    }
    operator(current_value, filter_value) {
        return current_value.toLowerCase().includes(filter_value.toLowerCase());
    }
    alias(alias_field) {
        const alias_filter = ILIKE(alias_field, this.value, this.value_type);
        reaction(() => this.value, (value) => { alias_filter.set(value); }, { fireImmediately: true });
        return alias_filter;
    }
}
function ILIKE(field, value, value_type) {
    return new ILIKE_Filter(field, value, value_type);
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

// Depricated
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
            value: 0
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
        this.__disposers.push(reaction(() => {
            var _a;
            return {
                filter: (_a = this.filters) === null || _a === void 0 ? void 0 : _a.URLSearchParams.toString(),
                order_by: Array.from(this.order_by, ([name, value]) => ([name, value])),
                // order_by: this.order_by, 
                offset: this.offset,
                limit: this.limit,
            };
        }, action('MO: Query Base - need to update', () => this.need_to_update = true), { fireImmediately: true, delay: 200 }));
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
    get autoupdate() {
        // TODO: move the name of disposer to const
        return !!this.__disposer_objects['__autoupdate'];
    }
    set autoupdate(value) {
        if (value !== this.autoupdate) {
            // off
            if (!value) {
                if (this.__disposer_objects['__autoupdate']) {
                    this.__disposer_objects['__autoupdate']();
                }
                delete this.__disposer_objects['__autoupdate'];
            }
            // on 
            else {
                this.__disposer_objects['__autoupdate'] = reaction(() => this.need_to_update, (need_to_update) => {
                    if (need_to_update)
                        this.load();
                }, { fireImmediately: true });
            }
        }
    }
    get selector() {
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

// Depricated
class Query extends QueryBase {
    constructor(adapter, base_cache, selector) {
        super(adapter, base_cache, selector);
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
            let objs = await this.__adapter.load(this.selector);
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

// Depriated
class QueryPage extends QueryBase {
    __load(objs) {
        this.__items.splice(0, this.__items.length);
        this.__items.push(...objs);
    }
    setPageSize(size) { this.limit = size; this.offset = 0; }
    setPage(n) { this.offset = this.limit * (n > 0 ? n - 1 : 0); }
    goToFirstPage() { this.setPage(1); }
    goToPrevPage() { this.setPage(this.current_page - 1); }
    goToNextPage() { this.setPage(this.current_page + 1); }
    goToLastPage() { this.setPage(this.total_pages); }
    get is_first_page() { return this.offset === 0; }
    get is_last_page() { return this.offset + this.limit >= this.total; }
    get current_page() { return this.offset / this.limit + 1; }
    get total_pages() { return this.total ? Math.ceil(this.total / this.limit) : 1; }
    constructor(adapter, base_cache, selector) {
        super(adapter, base_cache, selector);
        runInAction(() => {
            this.offset = (selector === null || selector === void 0 ? void 0 : selector.offset) || 0;
            this.limit = (selector === null || selector === void 0 ? void 0 : selector.limit) || 50;
        });
    }
    get items() { return this.__items; }
    async shadowLoad() {
        try {
            const objs = await this.__adapter.load(this.selector);
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

function waitIsTrue(obj, field) {
    return new Promise((resolve, reject) => {
        autorun((reaction) => {
            if (obj[field]) {
                reaction.dispose();
                resolve(true);
            }
        });
    });
}
function waitIsFalse(obj, field) {
    return new Promise((resolve, reject) => {
        autorun((reaction) => {
            if (!obj[field]) {
                reaction.dispose();
                resolve(true);
            }
        });
    });
}

class Input {
    constructor(args) {
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "errors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // should be a Query
        Object.defineProperty(this, "required", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "disabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "syncURLSearchParams", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "syncLocalStorage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "debounce", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "autoReset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "autoResetObj", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__isReady", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "__setReadyTrue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // init all observables before use it in reaction
        this.value = args === null || args === void 0 ? void 0 : args.value;
        this.options = args === null || args === void 0 ? void 0 : args.options;
        this.required = !!(args === null || args === void 0 ? void 0 : args.required);
        this.disabled = !!(args === null || args === void 0 ? void 0 : args.disabled);
        this.syncURLSearchParams = (args === null || args === void 0 ? void 0 : args.syncURL) || (args === null || args === void 0 ? void 0 : args.syncURLSearchParams);
        this.syncLocalStorage = args === null || args === void 0 ? void 0 : args.syncLocalStorage;
        this.debounce = args === null || args === void 0 ? void 0 : args.debounce;
        this.autoReset = args === null || args === void 0 ? void 0 : args.autoReset;
        this.isInit = false;
        this.__isReady = !this.options;
        // if debounce is on then we have to have debounced version of __setReadyTrue
        if (this.debounce)
            this.__setReadyTrue = _.debounce(() => runInAction(() => this.__isReady = true), this.debounce);
        else
            this.__setReadyTrue = () => this.__isReady = true;
        makeObservable(this);
        // init reactions
        this.options && this.__doOptions();
        this.syncURLSearchParams && this.__doSyncURLSearchParams();
        this.syncLocalStorage && this.__doSyncLocalStorage();
        if (args === null || args === void 0 ? void 0 : args.autoResetClass) {
            this.autoResetObj = new args.autoResetClass(this);
        }
        else if (this.autoReset) {
            this.__doAutoReset();
        }
    }
    get isReady() {
        return this.disabled
            || (this.__isReady
                && (this.options === undefined
                    // if not required and value is undefined or empty array - it is ready
                    || (!this.required && (this.value === undefined || (Array.isArray(this.value) && !this.value.length)))
                    || this.options.isReady));
    }
    get isError() {
        return this.errors.length > 0;
    }
    set(value) {
        var _a;
        this.value = value;
        // if debounce is on then set __isReady to false and then to true after debounce
        if (this.debounce)
            this.__isReady = false;
        if (!this.required || !(this.required && value === undefined)) {
            this.__setReadyTrue();
        }
        if (!this.isInit && (!this.options || ((_a = this.options) === null || _a === void 0 ? void 0 : _a.isReady))) {
            this.isInit = true;
        }
    }
    destroy() {
        var _a, _b;
        this.__disposers.forEach(disposer => disposer());
        (_a = this.options) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.autoResetObj) === null || _b === void 0 ? void 0 : _b.destroy();
    }
    toString() {
        return this.deserialize(this.value);
    }
    // Any changes in options should reset __isReady
    __doOptions() {
        this.__disposers.push(reaction(() => this.options.isReady, () => {
            this.__isReady = false;
        }));
    }
    __doAutoReset() {
        this.__disposers.push(reaction(() => this.options.is_ready && !this.disabled, (is_ready) => {
            if (is_ready) {
                this.autoReset(this);
            }
        }, { fireImmediately: true }));
    }
    __doSyncURLSearchParams() {
        // init from URL Search Params
        const name = this.syncURLSearchParams;
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has(name)) {
            this.set(this.serialize(searchParams.get(name)));
        }
        // watch for URL changes and update Input
        function updataInputFromURL() {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has(name)) {
                const value = this.serialize(searchParams.get(name));
                if (this.value !== value) {
                    this.set(value);
                }
            }
        }
        window.addEventListener('popstate', updataInputFromURL.bind(this));
        this.__disposers.push(() => window.removeEventListener('popstate', updataInputFromURL));
        // watch for Input changes and update URL
        this.__disposers.push(reaction(
        // I cannot use this.value because it can be a Map
        () => this.deserialize(this.value), () => {
            const searchParams = new URLSearchParams(window.location.search);
            const _value = this.deserialize(this.value);
            if (_value === '' || _value === undefined) {
                searchParams.delete(name);
            }
            else if (searchParams.get(name) !== _value) {
                searchParams.set(name, _value);
            }
            config.UPDATE_SEARCH_PARAMS(searchParams);
        }, { fireImmediately: true }));
    }
    __doSyncLocalStorage() {
        const name = this.syncLocalStorage;
        const value = this.serialize(localStorage.getItem(name));
        if (this.value !== value) {
            this.set(value);
        }
        this.__disposers.push(reaction(() => this.value, (value) => {
            if (value !== undefined) {
                localStorage.setItem(name, this.deserialize(value));
            }
            else {
                localStorage.removeItem(name);
            }
        }, { fireImmediately: true }));
    }
}
__decorate([
    observable,
    __metadata("design:type", Object)
], Input.prototype, "value", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], Input.prototype, "errors", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], Input.prototype, "required", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], Input.prototype, "disabled", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], Input.prototype, "isInit", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], Input.prototype, "__isReady", void 0);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Input.prototype, "set", null);

class OrderByInput extends Input {
    serialize(value) {
        let result = new Map();
        if (value) {
            for (const item of value.split(',')) {
                if (item[0] === '-') {
                    result.set(item.slice(1), DESC);
                }
                else {
                    result.set(item, ASC);
                }
            }
        }
        return result;
    }
    deserialize(value) {
        if (value) {
            let result = '';
            for (const [key, val] of value) {
                if (result)
                    result += ',';
                if (val === DESC)
                    result += '-';
                const field = key.replace(/\./g, '__');
                result += field;
            }
            return result ? result : undefined;
        }
        return undefined;
    }
}

class NumberInput extends Input {
    serialize(value) {
        if (value === undefined)
            return undefined;
        if (value === 'null')
            return null;
        if (value === null)
            return undefined;
        let result = parseInt(value);
        if (isNaN(result))
            result = undefined;
        return result;
    }
    deserialize(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return 'null';
        return '' + value;
    }
}

class ArrayInput extends Input {
    constructor(args) {
        if (args === undefined || args.value === undefined)
            args = Object.assign(Object.assign({}, args), { value: [] });
        super(args);
    }
}

class StringInput extends Input {
    serialize(value) {
        if (value === undefined)
            return undefined;
        if (value === 'null')
            return null;
        if (value === null)
            return undefined;
        return value;
    }
    deserialize(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return 'null';
        return value;
    }
}

class ArrayStringInput extends ArrayInput {
    serialize(value) {
        let result = [];
        if (value) {
            let converter = new StringInput();
            for (const i of value.split(',')) {
                let tmp = converter.serialize(i);
                if (tmp !== undefined) {
                    result.push(tmp);
                }
            }
        }
        return result;
    }
    deserialize(value) {
        let result = [];
        if (value) {
            for (const i of value) {
                let converter = new StringInput();
                let v = converter.deserialize(i);
                if (v !== undefined) {
                    result.push(v);
                }
            }
        }
        return result.length ? result.join(',') : undefined;
    }
}

const DISPOSER_AUTOUPDATE = "__autoupdate";
class QueryX {
    constructor(props) {
        Object.defineProperty(this, "filter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input_order_by", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input_offset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input_limit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input_relations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input_fields", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input_omit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "syncURLSearchParams", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "syncURLSearchParamsPrefix", {
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
        });
        Object.defineProperty(this, "timestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "adapter", {
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
        Object.defineProperty(this, "__controller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
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
        // use it if you need use promise instead of observe is_ready
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => waitIsTrue(this, '__is_ready')
        });
        // use it if you need use promise instead of observe is_loading
        Object.defineProperty(this, "loading", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => waitIsFalse(this, '__is_loading')
        });
        let { adapter, filter, order_by = new Map(), offset, limit, relations = [], fields = [], omit = [], autoupdate = false, syncURL, syncURLSearchParams = false, syncURLSearchParamsPrefix = '' } = props;
        if (syncURL)
            syncURLSearchParams = syncURL;
        this.adapter = adapter;
        this.filter = filter;
        this.input_order_by = new OrderByInput({ value: order_by, syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__order_by` : undefined });
        this.input_offset = new NumberInput({ value: offset, syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__offset` : undefined });
        this.input_limit = new NumberInput({ value: limit, syncURLSearchParams: syncURLSearchParams ? `${syncURLSearchParamsPrefix}__limit` : undefined });
        this.input_relations = new ArrayStringInput({ value: relations });
        this.input_fields = new ArrayStringInput({ value: fields });
        this.input_omit = new ArrayStringInput({ value: omit });
        this.syncURLSearchParams = syncURLSearchParams;
        this.syncURLSearchParamsPrefix = syncURLSearchParamsPrefix;
        makeObservable(this);
        this.__disposers.push(reaction(() => this.URLSearchParams.toString(), action('MO: Query Base - need to update', () => {
            this.need_to_update = true;
            this.__is_ready = false;
        }), { fireImmediately: true }));
        this.autoupdate = autoupdate;
        // this.syncURLSearchParams && this.__doSyncURLSearchParams()
    }
    get orderBy() { return this.input_order_by.value; } // for js style
    get order_by() { return this.input_order_by.value; }
    get offset() { return this.input_offset.value; }
    get limit() { return this.input_limit.value; }
    get relations() { return this.input_relations.value; }
    get fields() { return this.input_fields.value; }
    get omit() { return this.input_omit.value; }
    set offset(value) { this.input_offset.set(value); }
    set limit(value) { this.input_limit.set(value); }
    set relations(value) { this.input_relations.set(value); }
    set fields(value) { this.input_fields.set(value); }
    set omit(value) { this.input_omit.set(value); }
    get is_loading() { return this.__is_loading; }
    get is_ready() { return this.__is_ready; }
    get error() { return this.__error; }
    get items() { return this.__items; }
    // backward compatibility, remove it in the future
    get filters() { return this.filter; }
    // we going to migrate to JS style
    get isLoading() { return this.__is_loading; }
    get isReady() { return this.__is_ready; }
    destroy() {
        var _a;
        (_a = this.__controller) === null || _a === void 0 ? void 0 : _a.abort();
        while (this.__disposers.length) {
            this.__disposers.pop()();
        }
        for (let __id in this.__disposer_objects) {
            this.__disposer_objects[__id]();
            delete this.__disposer_objects[__id];
        }
    }
    async __wrap_controller(func) {
        if (this.__controller) {
            this.__controller.abort();
        }
        this.__controller = new AbortController();
        let response;
        try {
            response = await func();
        }
        catch (e) {
            if (e.name !== 'AbortError' && e.message !== 'canceled')
                throw e;
        }
        finally {
            this.__controller = undefined;
        }
        return response;
    }
    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.adapter.load(this, this.__controller);
            runInAction(() => {
                this.__items = objs;
            });
        });
    }
    // use it if everybody should know that the query data is updating
    async load() {
        this.__is_loading = true;
        try {
            await this.shadowLoad();
        }
        finally {
            runInAction(() => {
                // the loading can be canceled by another load
                // in this case we should not touch the __is_loading
                if (!this.__controller) {
                    this.__is_loading = false;
                }
            });
        }
    }
    // use it if nobody should know that the query data is updating
    // for example you need to update the current data on the page and you don't want to show a spinner
    async shadowLoad() {
        try {
            await this.__load();
        }
        catch (e) {
            runInAction(() => {
                this.__error = e.message;
            });
        }
        finally {
            runInAction(() => {
                // TODO: timestamp, aviod to trigger react hooks twise
                if (!this.__is_ready) {
                    this.__is_ready = true;
                    this.timestamp = Date.now();
                }
                if (this.need_to_update)
                    this.need_to_update = false;
            });
        }
    }
    get autoupdate() {
        return !!this.__disposer_objects[DISPOSER_AUTOUPDATE];
    }
    set autoupdate(value) {
        if (value !== this.autoupdate) {
            // on 
            if (value) {
                setTimeout(() => {
                    this.__disposer_objects[DISPOSER_AUTOUPDATE] = reaction(
                    // NOTE: don't need to check pagination and order because they are always ready 
                    () => this.need_to_update && (this.filter === undefined || this.filter.isReady), (need_to_update) => {
                        if (need_to_update) {
                            this.load();
                        }
                    }, { fireImmediately: true });
                }, config.AUTO_UPDATE_DELAY);
            }
            // off
            else {
                this.__disposer_objects[DISPOSER_AUTOUPDATE]();
                delete this.__disposer_objects[DISPOSER_AUTOUPDATE];
            }
        }
    }
    get URLSearchParams() {
        const searchParams = this.filter ? this.filter.URLSearchParams : new URLSearchParams();
        if (this.order_by.size)
            searchParams.set('__order_by', this.input_order_by.deserialize(this.order_by));
        if (this.limit !== undefined)
            searchParams.set('__limit', this.input_limit.deserialize(this.limit));
        if (this.offset !== undefined)
            searchParams.set('__offset', this.input_offset.deserialize(this.offset));
        if (this.relations.length)
            searchParams.set('__relations', this.input_relations.deserialize(this.relations));
        if (this.fields.length)
            searchParams.set('__fields', this.input_fields.deserialize(this.fields));
        if (this.omit.length)
            searchParams.set('__omit', this.input_omit.deserialize(this.omit));
        return searchParams;
    }
}
__decorate([
    observable,
    __metadata("design:type", Number)
], QueryX.prototype, "total", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], QueryX.prototype, "need_to_update", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], QueryX.prototype, "timestamp", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], QueryX.prototype, "__items", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], QueryX.prototype, "__is_loading", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], QueryX.prototype, "__is_ready", void 0);
__decorate([
    observable,
    __metadata("design:type", String)
], QueryX.prototype, "__error", void 0);
__decorate([
    action('MO: Query Base - load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueryX.prototype, "load", null);
__decorate([
    action('MO: Query Base - shadow load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueryX.prototype, "shadowLoad", null);

class QueryXPage extends QueryX {
    setPageSize(size) { this.limit = size; this.offset = 0; }
    setPage(n) { this.offset = this.limit * (n > 0 ? n - 1 : 0); }
    goToFirstPage() { this.setPage(1); }
    goToPrevPage() { this.setPage(this.current_page - 1); }
    goToNextPage() { this.setPage(this.current_page + 1); }
    goToLastPage() { this.setPage(this.total_pages); }
    get is_first_page() { return this.offset === 0; }
    get is_last_page() { return this.offset + this.limit >= this.total; }
    get current_page() { return this.offset / this.limit + 1; }
    get total_pages() { return this.total ? Math.ceil(this.total / this.limit) : 1; }
    // we going to migrate to JS style
    get isFirstPage() { return this.offset === 0; }
    get isLastPage() { return this.offset + this.limit >= this.total; }
    get currentPage() { return this.offset / this.limit + 1; }
    get totalPages() { return this.total ? Math.ceil(this.total / this.limit) : 1; }
    constructor(props) {
        super(props);
        runInAction(() => {
            if (this.offset === undefined)
                this.offset = 0;
            if (this.limit === undefined)
                this.limit = config.DEFAULT_PAGE_SIZE;
        });
    }
    async __load() {
        return this.__wrap_controller(async () => {
            const [objs, total] = await Promise.all([
                this.adapter.load(this, this.__controller),
                this.adapter.getTotalCount(this.filter, this.__controller)
            ]);
            runInAction(() => {
                this.__items = objs;
                this.total = total;
            });
        });
    }
}
__decorate([
    action('MO: set page size'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QueryXPage.prototype, "setPageSize", null);
__decorate([
    action('MO: set page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QueryXPage.prototype, "setPage", null);

class QueryXCacheSync extends QueryX {
    constructor(cache, props) {
        super(props);
        // watch the cache for changes, and update items if needed
        this.__disposers.push(observe(cache, action('MO: Query - update from cache changes', (change) => {
            if (change.type == 'add') {
                this.__watch_obj(change.newValue);
            }
            if (change.type == "delete") {
                let id = change.name;
                let obj = change.oldValue;
                this.__disposer_objects[id]();
                delete this.__disposer_objects[id];
                let i = this.__items.indexOf(obj);
                if (i != -1) {
                    this.__items.splice(i, 1);
                    this.total = this.__items.length;
                }
            }
        })));
        // ch all exist objects of model 
        for (let [id, obj] of cache) {
            this.__watch_obj(obj);
        }
    }
    async __load() {
        if (this.__controller)
            this.__controller.abort();
        this.__controller = new AbortController();
        try {
            await this.adapter.load(this, this.__controller);
            // Query don't need to overide the __items,
            // query's items should be get only from the cache
        }
        catch (e) {
            if (e.name !== 'AbortError')
                throw e;
        }
        // we have to wait the next tick
        // mobx should finished recalculation for model-objects
        await Promise.resolve();
        // await new Promise(resolve => setTimeout(resolve))
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
    __watch_obj(obj) {
        if (this.__disposer_objects[obj.id])
            this.__disposer_objects[obj.id]();
        this.__disposer_objects[obj.id] = reaction(() => !this.filter || this.filter.isMatch(obj), action('MO: Query - obj was changed', (should) => {
            let i = this.__items.indexOf(obj);
            // should be in the items and it is not in the items? add it to the items
            if (should && i == -1)
                this.__items.push(obj);
            // should not be in the items and it is in the items? remove it from the items
            if (!should && i != -1)
                this.__items.splice(i, 1);
            if (this.total != this.__items.length)
                this.total = this.__items.length;
        }), { fireImmediately: true });
    }
}
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], QueryXCacheSync.prototype, "items", null);

class QueryXStream extends QueryX {
    // you can reset all and start from beginning
    goToFirstPage() { this.__items = []; this.offset = 0; }
    // you can scroll only forward
    goToNextPage() { this.offset = this.offset + this.limit; }
    constructor(props) {
        super(props);
        runInAction(() => {
            if (this.offset === undefined)
                this.offset = 0;
            if (this.limit === undefined)
                this.limit = config.DEFAULT_PAGE_SIZE;
        });
    }
    async __load() {
        if (this.__controller)
            this.__controller.abort();
        this.__controller = new AbortController();
        try {
            const objs = await this.adapter.load(this, this.__controller);
            runInAction(() => {
                this.__items.push(...objs);
                // total is not make sense for infinity queries
                // total = 1 show that last page is reached
                if (objs.length < this.limit)
                    this.total = 1;
            });
        }
        catch (e) {
            if (e.name !== 'AbortError')
                throw e;
        }
    }
}
__decorate([
    action('MO: fisrt page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryXStream.prototype, "goToFirstPage", null);
__decorate([
    action('MO: next page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryXStream.prototype, "goToNextPage", null);

class QueryXRaw extends QueryX {
    async __load() {
        return this.__wrap_controller(async () => {
            // get only raw objects from adapter
            const objs = await this.adapter.__load(this, this.__controller);
            runInAction(() => {
                this.__items = objs;
            });
        });
    }
}

// TODO: fix types
class QueryXRawPage extends QueryXPage {
    async __load() {
        return this.__wrap_controller(async () => {
            // get only raw objects from adapter
            const objs = await this.adapter.__load(this);
            const total = await this.adapter.getTotalCount(this.filter);
            runInAction(() => {
                this.__items = objs;
                this.total = total;
            });
        });
    }
}

class QueryXDistinct extends QueryX {
    constructor(field, props) {
        super(props);
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.field = field;
    }
    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.adapter.getDistinct(this.filter, this.field, this.__controller);
            runInAction(() => {
                this.__items = objs;
            });
        });
    }
}

class Model {
    constructor(...args) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        // TODO: should it be observable?
        Object.defineProperty(this, "__init_data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__errors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // depricated, use errors in the form and inputs
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
    static getQueryX(props) {
        return new QueryX(Object.assign(Object.assign({}, props), { adapter: this.__adapter }));
    }
    static getQueryXRaw(props) {
        return new QueryXRaw(Object.assign(Object.assign({}, props), { adapter: this.__adapter }));
    }
    static getQueryXPage(props) {
        return new QueryXPage(Object.assign(Object.assign({}, props), { adapter: this.__adapter }));
    }
    static getQueryXRawPage(props) {
        return new QueryXRawPage(Object.assign(Object.assign({}, props), { adapter: this.__adapter }));
    }
    static getQueryXCacheSync(props) {
        return new QueryXCacheSync(this.__cache, Object.assign(Object.assign({}, props), { adapter: this.__adapter }));
    }
    static getQueryXStream(props) {
        return new QueryXStream(Object.assign(Object.assign({}, props), { adapter: this.__adapter }));
    }
    static getQueryXDistinct(field, props) {
        return new QueryXDistinct(field, Object.assign(Object.assign({}, props), { adapter: this.__adapter }));
    }
    static getQuery(selector) {
        return new Query(this.__adapter, this.__cache, selector);
    }
    static getQueryPage(selector) {
        return new QueryPage(this.__adapter, this.__cache, selector);
    }
    static get(id) {
        return this.__cache.get(id);
    }
    static async findById(id) {
        return this.__adapter.get(id);
    }
    static async find(selector) {
        return this.__adapter.find(selector);
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
        for (let field_name in this.model.__fields) {
            if (this[field_name] != this.__init_data[field_name]) {
                return true;
            }
        }
        return false;
    }
    async action(name, kwargs) { return await this.model.__adapter.action(this, name, kwargs); }
    async create() { return await this.model.__adapter.create(this); }
    async update() { return await this.model.__adapter.update(this); }
    async delete() { return await this.model.__adapter.delete(this); }
    async save() { return this.id === undefined ? this.create() : this.update(); }
    // update the object from the server
    async refresh() { return await this.model.__adapter.get(this.id); }
    /**
     * @deprecated use errors in the form and inputs
     */
    setError(error) {
        this.__errors = error;
    }
    refreshInitData() {
        if (this.__init_data === undefined)
            this.__init_data = {};
        for (let field_name in this.model.__fields) {
            this.__init_data[field_name] = this[field_name];
        }
    }
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
    observable,
    __metadata("design:type", Object)
], Model.prototype, "__errors", void 0);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Model.prototype, "setError", null);
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

class ReadOnlyModel extends Model {
    async create() { throw (`You cannot create the obj, ${this.model.name} is READ ONLY model`); }
    async update() { throw (`You cannot update the obj, ${this.model.name} is READ ONLY model`); }
    async delete() { throw (`You cannot delete the obj, ${this.model.name} is READ ONLY model`); }
    async save() { throw (`You cannot save the obj, ${this.model.name} is READ ONLY model`); }
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

class XFilter {
}

class BooleanInput extends Input {
    serialize(value) {
        if (value === undefined)
            return undefined;
        if (value === 'null')
            return null;
        if (value === null)
            return undefined;
        return value === 'true' ? true : value === 'false' ? false : undefined;
    }
    deserialize(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return 'null';
        return !!value ? 'true' : 'false';
    }
}

class DateInput extends Input {
    serialize(value) {
        if (value === undefined)
            return undefined;
        if (value === 'null')
            return null;
        return new Date(value);
    }
    deserialize(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return 'null';
        return value instanceof Date ? value.toISOString().split('T')[0] : "";
    }
}

class DateTimeInput extends Input {
    serialize(value) {
        if (value === undefined)
            return undefined;
        if (value === 'null')
            return null;
        return new Date(value);
    }
    deserialize(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return 'null';
        return value instanceof Date ? value.toISOString() : "";
    }
}

class EnumInput extends Input {
    constructor(args) {
        super(args);
        Object.defineProperty(this, "enum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.enum = args.enum;
        // TODO: convert enum to query? and use it as usual options?
    }
    serialize(value) {
        if (value === 'null')
            return null;
        if (value === undefined)
            return undefined;
        if (value === null)
            return null;
        return Object.values(this.enum).find(v => v == value);
    }
    deserialize(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return 'null';
        return value.toString();
    }
}

class ArrayNumberInput extends ArrayInput {
    serialize(value) {
        let result = [];
        if (value) {
            let converter = new NumberInput();
            for (const i of value.split(',')) {
                let tmp = converter.serialize(i);
                if (tmp !== undefined) {
                    result.push(tmp);
                }
            }
        }
        return result;
    }
    deserialize(value) {
        let result = [];
        if (value) {
            for (const i of value) {
                let converter = new NumberInput();
                let v = converter.deserialize(i);
                if (v !== undefined) {
                    result.push(v);
                }
            }
        }
        return result.length ? result.join(',') : undefined;
    }
}

function autoResetId(input) {
    var _a;
    if (!input.options) {
        console.warn('Input with autoResetId has no options', input);
        return;
    }
    // if value still in options, do nothing
    for (const item of input.options.items) {
        if (item.id === input.value) {
            input.set(input.value); // we need to set value to trigger reaction
            return;
        }
    }
    // otherwise set first available id or undefined
    input.set((_a = input.options.items[0]) === null || _a === void 0 ? void 0 : _a.id);
}

const autoResetArrayOfIDs = (input) => {
    if (!input.options) {
        console.warn('Input with autoResetArrayOfIDs has no options', input);
        return;
    }
    // if one of values not in options, reset the input 
    for (const id of input.value) {
        let found = false;
        for (const item of input.options.items) {
            if (item.id === id) {
                found = true;
                break;
            }
        }
        if (!found) {
            input.set([]);
            return;
        }
    }
    input.set(input.value);
};

const autoResetArrayToEmpty = (input) => {
    if (!input.options)
        input.set(input.value);
    else
        input.set([]);
};

class Form {
    constructor(inputs, submit, cancel) {
        Object.defineProperty(this, "inputs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isLoading", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "errors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "__submit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__cancel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.inputs = inputs;
        this.__submit = submit;
        this.__cancel = cancel;
    }
    get isReady() {
        return Object.values(this.inputs).every(input => input.isReady);
    }
    get isError() {
        return this.errors.length > 0 || Object.values(this.inputs).every(input => input.isError);
    }
    async submit() {
        if (!this.isReady) {
            // just ignore
            return;
        }
        this.isLoading = true;
        this.errors = [];
        try {
            await this.__submit();
        }
        catch (err) {
            for (const key in err.message) {
                if (key === config.NON_FIELD_ERRORS_KEY) {
                    this.errors = err.message[key];
                }
                else {
                    this.inputs[key].errors = err.message[key];
                }
            }
        }
        this.isLoading = false;
    }
    cancel() {
        this.__cancel();
    }
}
__decorate([
    observable,
    __metadata("design:type", Boolean)
], Form.prototype, "isLoading", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], Form.prototype, "errors", void 0);

class XSingleFilter extends XFilter {
    constructor(field, input) {
        super();
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.field = field;
        this.input = input;
        makeObservable(this);
    }
    get isReady() {
        return this.input.isReady;
    }
    get URLSearchParams() {
        let search_params = new URLSearchParams();
        let value = this.input.deserialize(this.input.value);
        !this.input.disabled && value !== undefined && search_params.set(this.URIField, value);
        return search_params;
    }
    isMatch(obj) {
        // it's always match if value of filter is undefined
        if (this.input === undefined || this.input.disabled)
            return true;
        return match(obj, this.field, this.input.value, this.operator);
    }
}
__decorate([
    observable,
    __metadata("design:type", Input)
], XSingleFilter.prototype, "input", void 0);
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

class XComboFilter extends XFilter {
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
    get isReady() {
        for (let filter of this.filters) {
            if (!filter.isReady)
                return false;
        }
        return true;
    }
    get URLSearchParams() {
        let search_params = new URLSearchParams();
        for (let filter of this.filters) {
            filter.URLSearchParams.forEach((value, key) => search_params.set(key, value));
        }
        return search_params;
    }
}

class XEQ_Filter extends XSingleFilter {
    get URIField() {
        return `${this.field}`;
    }
    operator(value_a, value_b) {
        return value_a === value_b;
    }
}
// EQV is a verbose version of EQ
class XEQV_Filter extends XEQ_Filter {
    get URIField() {
        return `${this.field}__eq`;
    }
}
function XEQ(field, value) {
    return new XEQ_Filter(field, value);
}
function XEQV(field, value) {
    return new XEQV_Filter(field, value);
}

class XNOT_EQ_Filter extends XSingleFilter {
    get URIField() {
        return `${this.field}__not_eq`;
    }
    operator(value_a, value_b) {
        return value_a !== value_b;
    }
}
function XNOT_EQ(field, value) {
    return new XNOT_EQ_Filter(field, value);
}

class XGT_Filter extends XSingleFilter {
    get URIField() {
        return `${this.field}__gt`;
    }
    operator(value_a, value_b) {
        return value_a > value_b;
    }
}
function XGT(field, value) {
    return new XGT_Filter(field, value);
}

class XGTE_Filter extends XSingleFilter {
    get URIField() {
        return `${this.field}__gte`;
    }
    operator(value_a, value_b) {
        return value_a >= value_b;
    }
}
function XGTE(field, value) {
    return new XGTE_Filter(field, value);
}

class XLT_Filter extends XSingleFilter {
    get URIField() {
        return `${this.field}__lt`;
    }
    operator(value_a, value_b) {
        return value_a < value_b;
    }
}
function XLT(field, value) {
    return new XLT_Filter(field, value);
}

class XLTE_Filter extends XSingleFilter {
    get URIField() {
        return `${this.field}__lte`;
    }
    operator(value_a, value_b) {
        return value_a <= value_b;
    }
}
function XLTE(field, value) {
    return new XLTE_Filter(field, value);
}

class XIN_Filter extends XSingleFilter {
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
function XIN(field, value) {
    return new XIN_Filter(field, value);
}

class XLIKE_Filter extends XSingleFilter {
    get URIField() {
        return `${this.field}__contains`;
    }
    operator(current_value, filter_value) {
        return current_value.includes(filter_value);
    }
}
function XLIKE(field, value) {
    return new XLIKE_Filter(field, value);
}

class XILIKE_Filter extends XSingleFilter {
    get URIField() {
        return `${this.field}__icontains`;
    }
    operator(current_value, filter_value) {
        return current_value.toLowerCase().includes(filter_value.toLowerCase());
    }
}
function XILIKE(field, value) {
    return new XILIKE_Filter(field, value);
}

class XAND_Filter extends XComboFilter {
    isMatch(obj) {
        for (let filter of this.filters) {
            if (!filter.isMatch(obj)) {
                return false;
            }
        }
        return true;
    }
}
function XAND(...filters) { return new XAND_Filter(filters); }

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
    async action(obj, name, kwargs, controller) {
        return await this.model.__adapter.__action(obj.id, name, kwargs, controller);
    }
    async create(obj, controller) {
        var _a;
        try {
            let raw_obj = await this.__create(obj.raw_data, controller);
            obj.updateFromRaw(raw_obj);
            obj.refreshInitData(); // backend can return default values and they should be in __init_data
            obj.setError(undefined);
        }
        catch (e) {
            obj.setError((_a = e.response) === null || _a === void 0 ? void 0 : _a.data);
            throw e;
        }
        return obj;
    }
    async update(obj, controller) {
        var _a;
        try {
            let raw_obj = await this.__update(obj.id, obj.only_changed_raw_data, controller);
            obj.updateFromRaw(raw_obj);
            obj.refreshInitData();
            obj.setError(undefined);
        }
        catch (e) {
            obj.setError((_a = e.response) === null || _a === void 0 ? void 0 : _a.data);
            throw e;
        }
        return obj;
    }
    async delete(obj, controller) {
        var _a;
        try {
            await this.__delete(obj.id, controller);
            runInAction(() => obj.id = undefined);
            obj.setError(undefined);
        }
        catch (e) {
            obj.setError((_a = e.response) === null || _a === void 0 ? void 0 : _a.data);
            throw e;
        }
        return obj;
    }
    async get(obj_id, controller) {
        let raw_obj = await this.__get(obj_id);
        const obj = this.model.updateCache(raw_obj, controller);
        obj.refreshInitData();
        return obj;
    }
    /* Returns ONE object */
    async find(selector, controller) {
        let raw_obj = await this.__find(selector);
        const obj = this.model.updateCache(raw_obj, controller);
        obj.refreshInitData();
        return obj;
    }
    /* Returns MANY objects */
    async load(selector, controller) {
        let raw_objs = await this.__load(selector, controller);
        let objs = [];
        // it should be happend in one big action
        runInAction(() => {
            for (let raw_obj of raw_objs) {
                const obj = this.model.updateCache(raw_obj);
                obj.refreshInitData();
                objs.push(obj);
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
    async __action(obj_id, name, kwargs) {
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
        let raw_obj = Object.values(local_store[this.store_name])[0];
        return raw_obj;
    }
    async __get(obj_id) {
        if (this.delay)
            await timeout(this.delay);
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
    async getDistinct(where, filed) {
        return [];
    }
}
// model decorator
function local() {
    return (cls) => {
        let adapter = new LocalAdapter(cls);
        cls.__proto__.__adapter = adapter;
    };
}

export { AND, AND_Filter, ASC, Adapter, ArrayInput, ArrayNumberInput, ArrayStringInput, BooleanInput, ComboFilter, DESC, DISPOSER_AUTOUPDATE, DateInput, DateTimeInput, EQ, EQV, EQV_Filter, EQ_Filter, EnumInput, Filter, Form, GT, GTE, GTE_Filter, GT_Filter, ILIKE, ILIKE_Filter, IN, IN_Filter, Input, LIKE, LIKE_Filter, LT, LTE, LTE_Filter, LT_Filter, LocalAdapter, Model, NOT_EQ, NOT_EQ_Filter, NumberInput, OrderByInput, Query, QueryBase, QueryPage, QueryX, QueryXCacheSync, QueryXDistinct, QueryXPage, QueryXRaw, QueryXRawPage, QueryXStream, ReadOnlyModel, SingleFilter, StringInput, ValueType, XAND, XAND_Filter, XComboFilter, XEQ, XEQV, XEQV_Filter, XEQ_Filter, XFilter, XGT, XGTE, XGTE_Filter, XGT_Filter, XILIKE, XILIKE_Filter, XIN, XIN_Filter, XLIKE, XLIKE_Filter, XLT, XLTE, XLTE_Filter, XLT_Filter, XNOT_EQ, XNOT_EQ_Filter, XSingleFilter, autoResetArrayOfIDs, autoResetArrayToEmpty, autoResetId, config, field, field_field, foreign, local, local_store, many, match$1 as match, model, one, waitIsFalse, waitIsTrue };
//# sourceMappingURL=mobx-orm.es2015.js.map
