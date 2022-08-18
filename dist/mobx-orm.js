
  /**
   * @license
   * author: Andrey Omelyanuk
   * mobx-orm.js v1.0.36
   * Released under the MIT license.
   */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('mobx')) :
    typeof define === 'function' && define.amd ? define(['exports', 'mobx'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["mobx-orm"] = {}, global.mobx));
})(this, (function (exports, mobx) { 'use strict';

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
    exports.ValueType = void 0;
    (function (ValueType) {
        ValueType[ValueType["STRING"] = 0] = "STRING";
        ValueType[ValueType["NUMBER"] = 1] = "NUMBER";
        ValueType[ValueType["BOOL"] = 2] = "BOOL";
    })(exports.ValueType || (exports.ValueType = {}));
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
                        this.value_type = exports.ValueType.NUMBER;
                        break;
                    case 'boolean':
                        this.value_type = exports.ValueType.BOOL;
                        break;
                    default:
                        this.value_type = exports.ValueType.STRING;
                }
            }
            else {
                this.value_type = value_type;
            }
            this.value = value;
            mobx.makeObservable(this);
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
                case exports.ValueType.STRING:
                    result = value;
                    break;
                case exports.ValueType.NUMBER:
                    result = parseInt(value);
                    if (isNaN(result))
                        result = undefined;
                    break;
                case exports.ValueType.BOOL:
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
                case exports.ValueType.STRING:
                    return '' + value;
                case exports.ValueType.NUMBER:
                    if (isNaN(value) || value === true || value === false) {
                        return undefined;
                    }
                    else {
                        return '' + value;
                    }
                case exports.ValueType.BOOL:
                    // I'm not shure that it is string
                    return !!value ? 'true' : 'false';
            }
        }
    }
    __decorate([
        mobx.observable,
        __metadata("design:type", Object)
    ], SingleFilter.prototype, "value", void 0);
    __decorate([
        mobx.action,
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
    class Query$2 {
        constructor(adapter, base_cache, filters, order_by, page, page_size) {
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
            Object.defineProperty(this, "page", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "page_size", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "need_to_update", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
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
            this.order_by = order_by ? order_by : new Map();
            if (filters)
                this.filters = filters;
            if (page)
                this.page = page;
            if (page_size)
                this.page_size = page_size;
            mobx.makeObservable(this);
            this.__disposers.push(mobx.reaction(() => {
                var _a;
                return {
                    filter: (_a = this.filters) === null || _a === void 0 ? void 0 : _a.URLSearchParams,
                    order_by: this.order_by,
                    page: this.page,
                    page_size: this.page_size,
                };
            }, () => { mobx.runInAction(() => this.need_to_update = true); }));
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
                mobx.runInAction(() => this.__is_loading = false);
            }
        }
        // use it if nobody should know that you load data for the query
        // for example you need to update the current data on the page and you don't want to show a spinner
        async shadowLoad() {
            try {
                let objs = await this.__adapter.load(this.filters, this.order_by, this.page_size, this.page * this.page_size);
                this.__load(objs);
                // we have to wait a next tick before set __is_ready to true, mobx recalculation should be done before
                await new Promise(resolve => setTimeout(resolve));
                mobx.runInAction(() => {
                    this.__is_ready = true;
                    this.need_to_update = false;
                });
            }
            catch (e) {
                mobx.runInAction(() => this.__error = e);
                throw e;
            }
        }
        // use it if you need use promise instead of observe is_ready
        ready() {
            return new Promise((resolve, reject) => {
                mobx.autorun((reaction) => {
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
                mobx.autorun((reaction) => {
                    if (!this.__is_loading) {
                        reaction.dispose();
                        resolve(!this.__is_loading);
                    }
                });
            });
        }
    }
    __decorate([
        mobx.observable,
        __metadata("design:type", Filter)
    ], Query$2.prototype, "filters", void 0);
    __decorate([
        mobx.observable,
        __metadata("design:type", Object)
    ], Query$2.prototype, "order_by", void 0);
    __decorate([
        mobx.observable,
        __metadata("design:type", Number)
    ], Query$2.prototype, "page", void 0);
    __decorate([
        mobx.observable,
        __metadata("design:type", Number)
    ], Query$2.prototype, "page_size", void 0);
    __decorate([
        mobx.observable,
        __metadata("design:type", Boolean)
    ], Query$2.prototype, "need_to_update", void 0);
    __decorate([
        mobx.observable,
        __metadata("design:type", Array)
    ], Query$2.prototype, "__items", void 0);
    __decorate([
        mobx.observable,
        __metadata("design:type", Boolean)
    ], Query$2.prototype, "__is_loading", void 0);
    __decorate([
        mobx.observable,
        __metadata("design:type", Boolean)
    ], Query$2.prototype, "__is_ready", void 0);
    __decorate([
        mobx.observable,
        __metadata("design:type", String)
    ], Query$2.prototype, "__error", void 0);
    __decorate([
        mobx.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], Query$2.prototype, "load", null);
    __decorate([
        mobx.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], Query$2.prototype, "shadowLoad", null);

    /*
    Reactive items:
    - delete from the cache -> delete from items
    - add to the cache
        - the new obj is match the filters  -> add the obj to items
    - obj was changed
        - не было но уже    попадание по фильтрам -> add the obj to items
        -    было но уже не попадание по фильтрам -> remove the obj from items
    */
    class Query$1 extends Query$2 {
        constructor(adapter, base_cache, filters, order_by) {
            super(adapter, base_cache, filters, order_by);
            // watch the cache for changes, and update items if needed
            this.__disposers.push(mobx.observe(this.__base_cache, (change) => {
                if (change.type == 'add') {
                    this.__watch_obj(change.newValue);
                }
                if (change.type == "delete") {
                    let __id = change.name;
                    let obj = change.oldValue;
                    this.__disposer_objects[__id]();
                    delete this.__disposer_objects[__id];
                    let i = this.__items.indexOf(obj);
                    if (i != -1)
                        mobx.runInAction(() => {
                            this.__items.splice(i, 1);
                        });
                }
            }));
            // I think it does not make sense, but it make sense for QueryPage!
            // this.__disposers.push(reaction(
            //     () => this.need_to_update,
            //     (value) => {
            //         if (value && !this.__is_loading)
            //             for(let [id, obj] of this.__base_cache) {
            //                 this.__watch_obj(obj)
            //             }
            //     }
            // ))
            // ch all exist objects of model 
            for (let [id, obj] of this.__base_cache) {
                this.__watch_obj(obj);
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
            if (this.__disposer_objects[obj.__id])
                this.__disposer_objects[obj.__id]();
            this.__disposer_objects[obj.__id] = mobx.autorun(() => {
                let should = !this.filters || this.filters.isMatch(obj);
                let i = this.__items.indexOf(obj);
                // should be in the items and it is not in the items? add it to the items
                if (should && i == -1)
                    mobx.runInAction(() => this.__items.push(obj));
                // should not be in the items and it is in the items? remove it from the items
                if (!should && i != -1)
                    mobx.runInAction(() => this.__items.splice(i, 1));
            });
        }
    }
    __decorate([
        mobx.computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], Query$1.prototype, "items", null);

    // TODO: implement need_to_update
    class Query extends Query$2 {
        __load(objs) {
            mobx.runInAction(() => {
                this.__items.splice(0, this.__items.length);
                this.__items.push(...objs);
            });
        }
        get items() { return this.__items; }
        // TODO: add actions for QueryBase and QueryPage
        // TODO: Query should know nothing about pages!
        // @action setFilters(filters : any     ) { this.filters  = filters  }
        // @action setOrderBy(order_by: string[]) { this.order_by = order_by }
        // @action firstPage() { this.page = 0 }
        // @action prevPage () { this.page = this.page < 0 ? this.page - 1 : 0 }
        // @action nextPage () { this.page = this.page + 1 }
        // @action lastPage () { this.page = 9999 } // TODO: need to know total row count
        // @action setPageSize(page_size: number) { this.page_size = page_size }
        constructor(adapter, base_cache, filters, order_by, page, page_size) {
            super(adapter, base_cache, filters, order_by);
            mobx.runInAction(() => {
                if (this.page === undefined)
                    this.page = 0;
                if (this.page_size === undefined)
                    this.page_size = 50;
            });
        }
    }

    // NOTE:
    // the __  prefix of naming - I borrow it from python. 
    // It means don't use it but if you have no choice then you can use it.
    class Model {
        constructor(...args) {
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
            if (obj.__id === null)
                throw new Error(`Object should have id!`);
            if (this.__cache.has(obj.__id)) {
                throw new Error(`Object with id "${obj.__id}" already exist in the cache of model: "${this.name}")`);
            }
            this.__cache.set(obj.__id, obj);
        }
        // remove obj from the cache
        static eject(obj) {
            if (obj.__id === null)
                return;
            if (!this.__cache.has(obj.__id))
                throw new Error(`Object with id "${obj.__id}" not exist in the cache of model: ${this.name}")`);
            this.__cache.delete(obj.__id);
        }
        // TODO: implement find method, it should load single object from Adapter
        // and add find method to Adapter too
        static async find(filters) {
            return this.__adapter.find(filters);
        }
        static getQuery(filters, order_by) {
            return new Query$1(this.__adapter, this.__cache, filters, order_by);
        }
        static getQueryPage(filter, order_by, page, page_size) {
            return new Query(this.__adapter, this.__cache, filter, order_by, page, page_size);
        }
        // return obj from the cache
        static get(__id) {
            return this.__cache.get(__id);
        }
        // TODO: what is it?
        static filter() {
            let objs = [];
            return objs;
        }
        static updateCache(raw_obj) {
            let __id = this.__id(raw_obj);
            let obj;
            if (this.__cache.has(__id)) {
                mobx.runInAction(() => {
                    obj = this.__cache.get(__id);
                    obj.updateFromRaw(raw_obj);
                });
            }
            else {
                obj = new this(raw_obj);
            }
            return obj;
        }
        static clearCache() {
            mobx.runInAction(() => {
                // for clear cache we need just to set null into id fields
                for (let obj of this.__cache.values()) {
                    for (let id_field_name of this.__ids.keys()) {
                        obj[id_field_name] = null;
                    }
                }
            });
        }
        static __id(obj, ids) {
            let id = '';
            if (ids === undefined)
                ids = Array.from(this.__ids.keys());
            for (let id_field_name of ids) {
                // if any id field is null then we should return null because id is not complite
                if (obj[id_field_name] === null || obj[id_field_name] === undefined)
                    return null;
                id += `${obj[id_field_name]}${this.__id_separator}`;
            }
            id = id.slice(0, -(this.__id_separator.length));
            return id;
        }
        get __id() {
            return this.model.__id(this);
        }
        get model() {
            return this.constructor.__proto__;
        }
        // it is raw_data + ids
        get raw_obj() {
            let raw_obj = this.raw_data;
            for (let id_field_name of this.model.__ids.keys()) {
                if (this[id_field_name] !== undefined) {
                    raw_obj[id_field_name] = this[id_field_name];
                }
            }
            raw_obj.__id = this.__id;
            return raw_obj;
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
        async save() { return this.__id === null ? this.create() : this.update(); }
        refresh_init_data() {
            if (this.__init_data === undefined)
                this.__init_data = {};
            for (let field_name in this.model.__fields) {
                this.__init_data[field_name] = this[field_name];
            }
        }
        updateFromRaw(raw_obj) {
            // update the keys only if they are not defined
            for (let id_field_name of this.model.__ids.keys()) {
                if (this[id_field_name] === null || this[id_field_name] === undefined) {
                    this[id_field_name] = raw_obj[id_field_name];
                }
            }
            // update the fields if the raw data is exist and it is different 
            for (let field_name in this.model.__fields) {
                if (raw_obj[field_name] !== undefined && raw_obj[field_name] !== this[field_name]) {
                    this[field_name] = raw_obj[field_name];
                }
            }
        }
    }
    Object.defineProperty(Model, "__id_separator", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: '-'
    });
    __decorate([
        mobx.computed,
        __metadata("design:type", String),
        __metadata("design:paramtypes", [])
    ], Model.prototype, "__id", null);
    __decorate([
        mobx.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Model.prototype, "refresh_init_data", null);
    __decorate([
        mobx.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], Model.prototype, "updateFromRaw", null);
    __decorate([
        mobx.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Model]),
        __metadata("design:returntype", void 0)
    ], Model, "inject", null);
    __decorate([
        mobx.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Model]),
        __metadata("design:returntype", void 0)
    ], Model, "eject", null);
    __decorate([
        mobx.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Model)
    ], Model, "updateCache", null);
    // Decorator
    function model(constructor) {
        var original = constructor;
        original.__cache = mobx.observable(new Map());
        // the new constructor
        let f = function (...args) {
            let c = class extends original {
                constructor(...args) { super(...args); }
            };
            c.__proto__ = original;
            let obj = new c();
            let model = obj.model;
            mobx.makeObservable(obj);
            if (model.__ids === undefined)
                throw (`No one id field was declared on model ${model.name}`);
            // apply id-fields decorators
            for (let id_field_name of model.__ids.keys()) {
                model.__ids.get(id_field_name).decorator(obj, id_field_name);
            }
            // apply fields decorators
            for (let field_name in model.__fields) {
                model.__fields[field_name].decorator(obj, field_name);
            }
            // apply __relations decorators
            for (let field_name in model.__relations) {
                model.__relations[field_name].decorator(obj, field_name);
            }
            mobx.runInAction(() => {
                // update the object from args
                if (args[0]) {
                    let raw_obj = args[0];
                    // id-fields
                    for (let id_field_name of model.__ids.keys()) {
                        if (raw_obj[id_field_name] !== undefined) {
                            obj[id_field_name] = raw_obj[id_field_name];
                        }
                    }
                    // fields 
                    for (let field_name in model.__fields) {
                        if (raw_obj[field_name] !== undefined) {
                            obj[field_name] = raw_obj[field_name];
                        }
                    }
                }
            });
            obj.refresh_init_data();
            return obj;
        };
        f.__proto__ = original;
        f.prototype = original.prototype; // copy prototype so intanceof operator still works
        return f; // return new constructor (will override original)
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
            obj.refresh_init_data(); // backend can return default values and they should be in __init_data
            return obj;
        }
        async update(obj) {
            let raw_obj = await this.__update(obj.__id, obj.only_changed_raw_data);
            obj.updateFromRaw(raw_obj);
            obj.refresh_init_data();
            return obj;
        }
        async delete(obj) {
            await this.__delete(obj.__id);
            for (let id_field_name of this.model.__ids.keys())
                obj[id_field_name] = null;
            return obj;
        }
        /* Returns ONE object */
        async find(where) {
            let raw_obj = await this.__find(where);
            return this.model.updateCache(raw_obj);
        }
        /* Returns MANY objects */
        async load(where, order_by, limit, offset) {
            let raw_objs = await this.__load(where, order_by, limit, offset);
            let objs = [];
            // it should be happend in one big action
            // runInAction(() => {
            for (let raw_obj of raw_objs) {
                objs.push(this.model.updateCache(raw_obj));
            }
            // })
            return objs;
        }
    }

    /*
    You can use this adapter for mock data or for unit test
    */
    let store = {};
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
            store[this.store_name] = {};
        }
        init_local_data(data) {
            let objs = {};
            for (let obj of data) {
                objs[this.model.__id(obj)] = obj;
            }
            store[this.store_name] = objs;
        }
        async __create(raw_data) {
            if (this.delay)
                await timeout(this.delay);
            // calculate and set new ID
            let ids = [0];
            for (let id of Object.keys(store[this.store_name])) {
                ids.push(parseInt(id));
            }
            let max = Math.max.apply(null, ids);
            for (let field_name_id of this.model.__ids.keys()) {
                raw_data[field_name_id] = max + 1;
            }
            raw_data.__id = this.model.__id(raw_data);
            store[this.store_name][raw_data.__id] = raw_data;
            return raw_data;
        }
        async __update(obj_id, only_changed_raw_data) {
            if (this.delay)
                await timeout(this.delay);
            let raw_obj = store[this.store_name][obj_id];
            for (let field of Object.keys(only_changed_raw_data)) {
                raw_obj[field] = only_changed_raw_data[field];
            }
            return raw_obj;
        }
        async __delete(obj_id) {
            if (this.delay)
                await timeout(this.delay);
            delete store[this.store_name][obj_id];
        }
        async __find(where) {
            if (this.delay)
                await timeout(this.delay);
            // TODO: apply where, and throw error if no obj or multi objs
            let raw_obj = Object.values(store[this.store_name])[0];
            return raw_obj;
        }
        async __load(where, order_by, limit, offset) {
            if (this.delay)
                await timeout(this.delay);
            let raw_objs = [];
            // filter
            if (where) {
                for (let raw_obj of Object.values(store[this.store_name])) {
                }
            }
            else {
                raw_objs = Object.values(store[this.store_name]);
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
            let objs = [];
            // Object.values(store[this.store_name])
            return objs.length;
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

    /*
    1. you can setup id only once!
    using obj.id = x, new Obj({id: x}) or obj.save()

    2. save() has two behavior depend on id
     - id === undefined or null -> create object on remote storage and get it
     - id === some number       -> save object in remote storage

    3. if you want just load data to cache then you can use this
    new Obj({id: x, ...})
    */
    function field_ID(obj, field_name) {
        // make observable and set default value
        mobx.extendObservable(obj, {
            [field_name]: null
        });
        // before changes
        mobx.intercept(obj, field_name, (change) => {
            if (change.newValue !== null && obj[field_name] !== null)
                throw new Error(`You cannot change id field: ${field_name}. ${obj[field_name]} to ${change.newValue}`);
            if (obj[field_name] !== null && change.newValue === null) {
                try {
                    obj.model.eject(obj);
                }
                catch (err) {
                    let ignore_error = `Object with id "${obj.__id}" not exist in the model cache: ${obj.model.name}")`;
                    if (err.name !== ignore_error)
                        throw err;
                }
            }
            return change;
        });
        // after changes
        mobx.observe(obj, field_name, (change) => {
            // if id is complete
            if (obj.__id !== null)
                obj.model.inject(obj);
        });
    }
    function id(cls, field_name) {
        let model = cls.constructor;
        if (model.__ids === undefined)
            model.__ids = new Map();
        model.__ids.set(field_name, { decorator: field_ID });
    }
    class ModelX {
        get raw_obj() {
            return {};
        }
    }
    function ModelExt() {
        class Model extends ModelX {
            static async fetch() {
                return null;
            }
            /*  instance methods */
            save() {
                return null;
            }
        }
        /* static methods */
        Object.defineProperty(Model, "list", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        return Model;
    }
    class User extends ModelExt() {
    }
    User.fetch();

    function field_field(obj, field_name) {
        // make observable and set default value
        mobx.extendObservable(obj, { [field_name]: obj[field_name] });
    }
    function field(cls, field_name) {
        let model = cls.constructor;
        if (model.__fields === undefined)
            model.__fields = {};
        model.__fields[field_name] = { decorator: field_field }; // register field 
    }

    function field_foreign(obj, field_name) {
        let edit_mode = false;
        let settings = obj.model.__relations[field_name].settings;
        let foreign_model = settings.foreign_model;
        let foreign_ids_names = settings.foreign_ids_names;
        // make observable and set default value
        mobx.extendObservable(obj, {
            [field_name]: null
        });
        mobx.reaction(
        // watch on foreign cache for foreign object
        () => {
            let __id = foreign_model.__id(obj, foreign_ids_names);
            return __id ? foreign_model.__cache.get(__id) : null;
        }, 
        // update foreign field
        (foreign_obj, prev, reaction) => {
            obj[field_name] = foreign_obj ? foreign_obj : null;
        });
        // Setter
        // 1. checks before set new changes
        mobx.intercept(obj, field_name, (change) => {
            if (change.newValue !== null && !(change.newValue.model == foreign_model)) {
                throw new Error(`You can set only instance of "${foreign_model.name}" or null`);
            }
            return change;
        });
        // 2. after changes run trigger for "change foreign_id"
        mobx.observe(obj, field_name, (change) => {
            let new_foreign_obj = change.newValue;
            let old_foreign_obj = change.oldValue;
            if (new_foreign_obj === old_foreign_obj || edit_mode)
                return; // it will help stop endless loop A.b -> A.b_id -> A.b -> A.b_id ...
            edit_mode = true;
            try {
                if (change.newValue === null) {
                    // if foreign set to null then reset ids on the obj
                    for (let id_name of foreign_ids_names) {
                        obj[id_name] = null;
                    }
                }
                else {
                    // if foreign set to obj then update ids from the obj's ids
                    let obj_ids = Array.from(change.newValue.model.__ids.keys());
                    for (var i = 0; i < foreign_ids_names.length; i++) {
                        // do not touch if it the same
                        if (obj[foreign_ids_names[i]] != change.newValue[obj_ids[i]])
                            obj[foreign_ids_names[i]] = change.newValue[obj_ids[i]];
                    }
                }
                edit_mode = false;
            }
            catch (e) {
                // rollback changes!
                if (change.oldValue === null) {
                    for (var i = 0; i < foreign_ids_names.length; i++) {
                        obj[foreign_ids_names[i]] = null;
                    }
                }
                else {
                    let obj_ids = change.oldValue.model.__ids;
                    for (var i = 0; i < foreign_ids_names.length; i++) {
                        obj[foreign_ids_names[i]] = change.oldValue[obj_ids[i]];
                    }
                }
                edit_mode = false;
                throw e;
            }
            // if foreign have the one then update the one
            if (settings.one) {
                if (old_foreign_obj) {
                    old_foreign_obj[settings.one] = null;
                }
                if (new_foreign_obj) {
                    new_foreign_obj[settings.one] = obj;
                }
            }
        });
    }
    function foreign(foreign_model, ...foreign_ids_names) {
        foreign_model = foreign_model.__proto__; // TODO: band-aid
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
                    foreign_ids_names: foreign_ids_names.length ? foreign_ids_names : [`${field_name}_id`]
                }
            };
        };
    }

    function field_one(obj, field_name) {
        let edit_mode = false;
        let remote_model = obj.model.__relations[field_name].settings.remote_model;
        let remote_foreign_ids_name = obj.model.__relations[field_name].settings.remote_foreign_ids_names;
        // make observable and set default value
        mobx.extendObservable(obj, {
            [field_name]: null
        });
        // 1. checks before set new changes
        mobx.intercept(obj, field_name, (change) => {
            if (change.newValue !== null && !(change.newValue.model === remote_model))
                throw new Error(`You can set only instance of "${remote_model.name}" or null`);
            return change;
        });
        // 2. after changes run trigger for "change foreign_id"
        mobx.observe(obj, field_name, (change) => {
            let old_remote_obj = change.oldValue;
            let new_remote_obj = change.newValue;
            if (new_remote_obj === old_remote_obj || edit_mode)
                return; // it will help stop endless loop A.b -> B.a_id -> A.b -> B.a_id ...
            edit_mode = true;
            try {
                // remove foreign ids on the old remote obj
                if (old_remote_obj) {
                    for (let id_name of remote_foreign_ids_name) {
                        old_remote_obj[id_name] = null;
                    }
                }
                // set foreign ids on the remote obj 
                if (new_remote_obj) {
                    let obj_ids = Array.from(obj.model.__ids.keys());
                    for (var i = 0; i < remote_foreign_ids_name.length; i++) {
                        // do not touch if it the same
                        if (new_remote_obj[remote_foreign_ids_name[i]] != obj[obj_ids[i]])
                            new_remote_obj[remote_foreign_ids_name[i]] = obj[obj_ids[i]];
                    }
                }
                edit_mode = false;
            }
            catch (e) {
                // TODO: we need to test rallback
                // // rollback changes!
                // if (change.oldValue === null) {
                //     for (var i = 0; i < foreign_ids_names.length; i++) {
                //         obj[foreign_ids_names[i]] = null 
                //     }
                // }
                // else {
                //     let obj_ids = change.oldValue.model.ids
                //     for (var i = 0; i < foreign_ids_names.length; i++) {
                //         obj[foreign_ids_names[i]] = change.oldValue[obj_ids[i]]
                //     }
                // }
                // edit_mode = false
                // throw e
            }
        });
    }
    function one(remote_model, ...remote_foreign_ids_names) {
        remote_model = remote_model.__proto__; // band-aid
        return function (cls, field_name) {
            let model = cls.prototype.constructor;
            if (model.__relations === undefined)
                model.__relations = {};
            // if it is empty then try auto detect it (it works only with single id) 
            remote_foreign_ids_names = remote_foreign_ids_names.length ? remote_foreign_ids_names : [`${model.name.toLowerCase()}_id`];
            model.__relations[field_name] = {
                decorator: field_one,
                settings: {
                    remote_model: remote_model,
                    remote_foreign_ids_names: remote_foreign_ids_names
                }
            };
            // watch for remote object in the cache 
            mobx.observe(remote_model.__cache, (remote_change) => {
                let remote_obj;
                switch (remote_change.type) {
                    case 'add':
                        remote_obj = remote_change.newValue;
                        remote_obj.__disposers.set(`one ${field_name}`, mobx.autorun(() => {
                            let obj = model.__cache.get(model.__id(remote_obj, remote_foreign_ids_names));
                            if (obj) {
                                // TODO: is it not bad?
                                // if (obj[field_name])
                                //     // TODO better name of error
                                //     // TODO add test for this case
                                //     throw ('One: bad')
                                mobx.runInAction(() => { obj[field_name] = remote_obj; });
                            }
                        }));
                        break;
                    case 'delete':
                        remote_obj = remote_change.oldValue;
                        if (remote_obj.__disposers.get(`one ${field_name}`)) {
                            remote_obj.__disposers.get(`one ${field_name}`)();
                            remote_obj.__disposers.delete(`one ${field_name}`);
                        }
                        let obj = model.__cache.get(model.__id(remote_obj, remote_foreign_ids_names));
                        if (obj)
                            mobx.runInAction(() => { obj[field_name] = null; });
                        break;
                }
            });
        };
    }

    function field_many(obj, field_name) {
        let edit_mode = false;
        obj.model.__relations[field_name].settings.remote_model;
        let remote_foreign_ids_name = obj.model.__relations[field_name].settings.remote_foreign_ids_names;
        // make observable and set default value
        mobx.extendObservable(obj, {
            [field_name]: []
        });
        // 1. checks before set new changes
        mobx.intercept(obj[field_name], (change) => {
            // TODO
            // if (change.newValue !== null && !(change.newValue.constructor && change.newValue.constructor === remote_model.__proto__))
            //         throw new Error(`You can set only instance of "${remote_model.__proto__.name}" or null`)
            // TODO: if we push exist obj then ignore it? and not duplicate
            // TODO: create a test for this case 
            // remote obj can be in the many 
            // for (let new_remote_obj of change.added) {
            //     const i = obj[field_name].indexOf(new_remote_obj)
            //     if (i == -1)
            //         throw new Error(`"${new_remote_obj.model.name}" id:"${new_remote_obj.__id}" alredy in many "${obj.model.name}" id:"${field_name}"`)
            // }
            return change;
        });
        // 2. after changes run trigger for "change foreign_id"
        mobx.observe(obj[field_name], (change) => {
            if (change.type !== 'splice')
                return;
            let old_remote_objs = change.removed;
            let new_remote_objs = change.added;
            edit_mode = true;
            try {
                // remove foreign ids on the old remote objs
                for (let old_remote_obj of old_remote_objs)
                    for (let id_name of remote_foreign_ids_name)
                        old_remote_obj[id_name] = null;
                // set foreign ids on the remote objs 
                let obj_ids = Array.from(obj.model.__ids.keys());
                for (let new_remote_obj of new_remote_objs) {
                    for (var i = 0; i < remote_foreign_ids_name.length; i++) {
                        // do not touch if it the same
                        if (new_remote_obj[remote_foreign_ids_name[i]] != obj[obj_ids[i]])
                            new_remote_obj[remote_foreign_ids_name[i]] = obj[obj_ids[i]];
                    }
                }
                edit_mode = false;
            }
            catch (e) {
                // TODO: we need to test rallback
                // // rollback changes!
                // if (change.oldValue === null) {
                //     for (var i = 0; i < foreign_ids_names.length; i++) {
                //         obj[foreign_ids_names[i]] = null 
                //     }
                // }
                // else {
                //     let obj_ids = change.oldValue.model.ids
                //     for (var i = 0; i < foreign_ids_names.length; i++) {
                //         obj[foreign_ids_names[i]] = change.oldValue[obj_ids[i]]
                //     }
                // }
                // edit_mode = false
                // throw e
            }
        });
    }
    function many(remote_model, ...remote_foreign_ids_names) {
        return function (cls, field_name) {
            let model = cls.prototype.constructor;
            if (model.__relations === undefined)
                model.__relations = {};
            // if it is empty then try auto detect it (it works only with single id) 
            remote_foreign_ids_names = remote_foreign_ids_names.length ? remote_foreign_ids_names : [`${model.name.toLowerCase()}_id`];
            model.__relations[field_name] = {
                decorator: field_many,
                settings: {
                    remote_model: remote_model,
                    remote_foreign_ids_names: remote_foreign_ids_names
                }
            };
            // watch for remote object in the cache 
            mobx.observe(remote_model.__cache, (remote_change) => {
                let remote_obj;
                switch (remote_change.type) {
                    case 'add':
                        remote_obj = remote_change.newValue;
                        remote_obj.__disposers.set(`many ${field_name}`, mobx.autorun(() => {
                            let obj = model.__cache.get(model.__id(remote_obj, remote_foreign_ids_names));
                            if (obj) {
                                const i = obj[field_name].indexOf(remote_obj);
                                if (i == -1)
                                    mobx.runInAction(() => { obj[field_name].push(remote_obj); });
                            }
                        }));
                        break;
                    case 'delete':
                        remote_obj = remote_change.oldValue;
                        if (remote_obj.__disposers.get(`many ${field_name}`)) {
                            remote_obj.__disposers.get(`many ${field_name}`)();
                            remote_obj.__disposers.delete(`many ${field_name}`);
                        }
                        let obj = model.__cache.get(model.__id(remote_obj, remote_foreign_ids_names));
                        if (obj) {
                            const i = obj[field_name].indexOf(remote_obj);
                            if (i > -1)
                                mobx.runInAction(() => { obj[field_name].splice(i, 1); });
                        }
                        break;
                }
            });
        };
    }

    exports.AND = AND;
    exports.ASC = ASC;
    exports.Adapter = Adapter;
    exports.ComboFilter = ComboFilter;
    exports.DESC = DESC;
    exports.EQ = EQ;
    exports.Filter = Filter;
    exports.IN = IN;
    exports.LocalAdapter = LocalAdapter;
    exports.Model = Model;
    exports.NOT_EQ = NOT_EQ;
    exports.Query = Query$1;
    exports.QueryBase = Query$2;
    exports.QueryPage = Query;
    exports.SingleFilter = SingleFilter;
    exports.field = field;
    exports.foreign = foreign;
    exports.id = id;
    exports.local = local;
    exports.many = many;
    exports.model = model;
    exports.one = one;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=mobx-orm.js.map
