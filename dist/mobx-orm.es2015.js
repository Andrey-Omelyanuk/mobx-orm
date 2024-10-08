
  /**
   * @license
   * author: Andrey Omelyanuk
   * mobx-orm.js v2.0.11
   * Released under the MIT license.
   */

import { observable, action, makeObservable, runInAction, autorun, reaction, computed, observe, intercept, extendObservable } from 'mobx';
import _ from 'lodash';

// Global config of Mobx-ORM
const config = {
    DEFAULT_PAGE_SIZE: 50,
    AUTO_UPDATE_DELAY: 100, // ms
    NON_FIELD_ERRORS_KEY: 'non_field_errors',
    // NOTE: React router manage URL by own way. 
    // change UPDATE_SEARCH_PARAMS and WATCTH_URL_CHANGES in this case
    UPDATE_SEARCH_PARAMS: (search_params) => {
        window.history.pushState(null, '', `${window.location.pathname}?${search_params.toString()}`);
    },
    WATCTH_URL_CHANGES: (callback) => {
        window.addEventListener('popstate', callback);
        return () => { window.removeEventListener('popstate', callback); };
    },
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

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class Cache {
    constructor(model, name) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // TODO: type
        Object.defineProperty(this, "store", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = name ? name : model.name;
        this.model = model;
        this.store = new Map();
        makeObservable(this);
    }
    get(id) {
        return this.store.get(id);
    }
    inject(obj) {
        if (obj.id === undefined)
            throw new Error(`Object should have id!`);
        const exist_obj = this.store.get(obj.id);
        if (exist_obj && exist_obj !== obj)
            throw new Error(`Object ${obj.constructor.name}: ${obj.id} already exist in the cache. ${this.name}`);
        this.store.set(obj.id, obj);
    }
    eject(obj) {
        return this.store.delete(obj.id);
    }
    update(raw_obj) {
        let obj = this.store.get(raw_obj.id);
        if (obj)
            obj.updateFromRaw(raw_obj);
        else {
            obj = new this.model(raw_obj);
            this.inject(obj);
        }
        return obj;
    }
    clear() {
        for (let obj of this.store.values())
            obj.destroy();
        this.store.clear();
    }
}
__decorate([
    observable,
    __metadata("design:type", Map)
], Cache.prototype, "store", void 0);
__decorate([
    action('cache - inject'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Cache.prototype, "inject", null);
__decorate([
    action('cache - eject'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Cache.prototype, "eject", null);
__decorate([
    action('cache - update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], Cache.prototype, "update", null);
__decorate([
    action('cache - clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Cache.prototype, "clear", null);

class Repository {
    constructor(model, adapter, cache) {
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cache", {
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
        this.model = model;
        this.adapter = adapter;
        this.cache = cache ? cache : new Cache(model);
    }
    async action(obj, name, kwargs, controller) {
        return await this.adapter.action(obj.id, name, kwargs, controller);
    }
    async create(obj, controller) {
        let raw_obj = await this.adapter.create(obj.raw_data, controller);
        obj.updateFromRaw(raw_obj); // update id and other fields
        obj.refreshInitData(); // backend can return default values and they should be in __init_data
        return obj;
    }
    async update(obj, controller) {
        let raw_obj = await this.adapter.update(obj.id, obj.only_changed_raw_data, controller);
        obj.updateFromRaw(raw_obj);
        obj.refreshInitData();
        return obj;
    }
    async delete(obj, controller) {
        await this.adapter.delete(obj.id, controller);
        obj.destroy();
        this.cache.eject(obj);
        return obj;
    }
    async get(obj_id, controller) {
        let raw_obj = await this.adapter.get(obj_id, controller);
        if (this.cache) {
            const obj = this.cache.update(raw_obj);
            obj.refreshInitData();
            return obj;
        }
        return new this.model(raw_obj);
    }
    /* Returns ONE object */
    async find(query, controller) {
        let raw_obj = await this.adapter.find(query, controller);
        if (this.cache) {
            const obj = this.cache.update(raw_obj);
            obj.refreshInitData();
            return obj;
        }
        return new this.model(raw_obj);
    }
    /* Returns MANY objects */
    async load(query, controller) {
        let raw_objs = await this.adapter.load(query, controller);
        let objs = [];
        // it should invoke in one big action
        runInAction(() => {
            if (this.cache) {
                for (let raw_obj of raw_objs) {
                    const obj = this.cache.update(raw_obj);
                    obj.refreshInitData();
                    objs.push(obj);
                }
            }
            else {
                for (let raw_obj of raw_objs) {
                    objs.push(new this.model(raw_obj));
                }
            }
        });
        return objs;
    }
    async getTotalCount(filter, controller) {
        return await this.adapter.getTotalCount(filter, controller);
    }
    async getDistinct(filter, field, controller) {
        return await this.adapter.getDistinct(filter, field, controller);
    }
}
// Model.repository is readonly, use decorator to customize repository 
function repository(adapter, cache) {
    return (cls) => {
        let repository = new Repository(cls, adapter, cache);
        cls.__proto__.repository = repository;
    };
}

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
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Input {
    constructor(args) {
        var _a;
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
        this.__isReady = !(this.required && ((_a = this.options) === null || _a === void 0 ? void 0 : _a.needToUpdate) === true);
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
                    || !this.options.needToUpdate));
    }
    get isError() {
        return this.errors.length > 0;
    }
    set(value) {
        this.value = value;
        // if debounce is on then set __isReady to false and then to true after debounce
        if (this.debounce)
            this.__isReady = false;
        if (!this.required || !(this.required && value === undefined)) {
            this.__setReadyTrue();
        }
        if (!this.isInit && (!this.options || !this.options.needToUpdate)) {
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
        return this.deserialize();
    }
    // Any changes in options should reset __isReady
    __doOptions() {
        this.__disposers.push(reaction(() => this.options.needToUpdate, () => this.__isReady = false));
    }
    __doAutoReset() {
        this.__disposers.push(reaction(() => !this.options.needToUpdate && !this.disabled, (is_ready) => {
            if (is_ready)
                this.autoReset(this);
        }, { fireImmediately: true }));
    }
    __doSyncURLSearchParams() {
        // init from URL Search Params
        const name = this.syncURLSearchParams;
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has(name)) {
            this.serialize(searchParams.get(name));
        }
        // watch for URL changes and update Input
        function updataInputFromURL() {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has(name)) {
                const raw_value = searchParams.get(name);
                const exist_raw_value = this.deserialize();
                if (raw_value !== exist_raw_value) {
                    this.serialize(raw_value);
                }
            }
            else if (this.value !== undefined) {
                this.set(undefined);
            }
        }
        this.__disposers.push(config.WATCTH_URL_CHANGES(updataInputFromURL.bind(this)));
        // watch for Input changes and update URL
        this.__disposers.push(reaction(() => this.deserialize(), // I cannot use this.value because it can be a Map
        () => {
            const searchParams = new URLSearchParams(window.location.search);
            const _value = this.deserialize();
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
        const raw_value = localStorage.getItem(name);
        const exist_raw_value = this.deserialize();
        if (exist_raw_value !== raw_value) {
            this.serialize(raw_value);
        }
        this.__disposers.push(reaction(() => this.value, (value) => {
            if (value !== undefined) {
                localStorage.setItem(name, this.deserialize());
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

class StringInput extends Input {
    serialize(value) {
        if (value === undefined)
            this.set(undefined);
        else if (value === 'null')
            this.set(null);
        else if (value === null)
            this.set(undefined);
        else
            this.set(value);
    }
    deserialize() {
        if (this.value === undefined)
            return undefined;
        if (this.value === null)
            return 'null';
        return this.value;
    }
}

class NumberInput extends Input {
    serialize(value) {
        if (value === undefined)
            this.set(undefined);
        else if (value === 'null')
            this.set(null);
        else if (value === null)
            this.set(undefined);
        else {
            let result = parseInt(value);
            if (isNaN(result))
                result = undefined;
            this.set(result);
        }
    }
    deserialize() {
        if (this.value === undefined)
            return undefined;
        if (this.value === null)
            return 'null';
        return '' + this.value;
    }
}

class BooleanInput extends Input {
    serialize(value) {
        if (value === undefined)
            this.set(undefined);
        if (value === 'null')
            this.set(null);
        if (value === null)
            this.set(undefined);
        else
            this.set(value === 'true' ? true : value === 'false' ? false : undefined);
    }
    deserialize() {
        if (this.value === undefined)
            return undefined;
        if (this.value === null)
            return 'null';
        return !!this.value ? 'true' : 'false';
    }
}

class DateInput extends Input {
    serialize(value) {
        if (value === undefined)
            this.set(undefined);
        else if (value === 'null')
            this.set(null);
        else if (value === null)
            this.set(null);
        else
            this.set(new Date(value));
    }
    deserialize() {
        if (this.value === undefined)
            return undefined;
        if (this.value === null)
            return 'null';
        return this.value instanceof Date ? this.value.toISOString().split('T')[0] : "";
    }
}

class DateTimeInput extends Input {
    serialize(value) {
        if (value === undefined)
            this.set(undefined);
        else if (value === 'null')
            this.set(null);
        else if (value === null)
            this.set(null);
        else
            this.set(new Date(value));
    }
    deserialize() {
        if (this.value === undefined)
            return undefined;
        if (this.value === null)
            return 'null';
        return this.value instanceof Date ? this.value.toISOString() : "";
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
    }
    serialize(value) {
        if (value === 'null')
            this.set(null);
        else if (value === undefined)
            this.set(undefined);
        else if (value === null)
            this.set(null);
        else
            this.set(Object.values(this.enum).find(v => v == value));
    }
    deserialize() {
        if (this.value === undefined)
            return undefined;
        if (this.value === null)
            return 'null';
        return this.value.toString();
    }
}

class ArrayInput extends Input {
    constructor(args) {
        if (args === undefined || args.value === undefined)
            args = Object.assign(Object.assign({}, args), { value: [] });
        super(args);
    }
}

class ArrayStringInput extends ArrayInput {
    serialize(value) {
        let result = [];
        if (value) {
            let converter = new StringInput();
            for (const i of value.split(',')) {
                converter.serialize(i);
                if (converter.value !== undefined) {
                    result.push(converter.value);
                }
            }
        }
        this.set(result);
    }
    deserialize() {
        let result = [];
        if (this.value) {
            for (const i of this.value) {
                let converter = new StringInput({ value: i });
                let v = converter.deserialize();
                if (v !== undefined) {
                    result.push(v);
                }
            }
        }
        return result.length ? result.join(',') : undefined;
    }
}

class ArrayNumberInput extends ArrayInput {
    serialize(value) {
        let result = [];
        if (value) {
            let converter = new NumberInput();
            for (const i of value.split(',')) {
                converter.serialize(i);
                if (converter.value !== undefined) {
                    result.push(converter.value);
                }
            }
        }
        this.set(result);
    }
    deserialize() {
        let result = [];
        if (this.value) {
            for (const i of this.value) {
                let converter = new NumberInput({ value: i });
                let v = converter.deserialize();
                if (v !== undefined) {
                    result.push(v);
                }
            }
        }
        return result.length ? result.join(',') : undefined;
    }
}

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
        this.value = result;
    }
    deserialize() {
        if (this.value) {
            let result = '';
            for (const [key, val] of this.value) {
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

class ObjectInput extends NumberInput {
    constructor(args) {
        super(args);
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.model = args.model;
    }
    get obj() {
        return this.model.get(this.value);
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

const DISPOSER_AUTOUPDATE = "__autoupdate";
const ASC = true;
const DESC = false;
class Query {
    get items() { return this.__items; } // the items can be changed after the load (post processing)
    constructor(props) {
        Object.defineProperty(this, "repository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "filter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "orderBy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        Object.defineProperty(this, "relations", {
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
        Object.defineProperty(this, "__items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        }); // items from the server
        Object.defineProperty(this, "total", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // total count of items on the server, usefull for pagination
        Object.defineProperty(this, "isLoading", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        }); // query is loading the data
        Object.defineProperty(this, "needToUpdate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        }); // query was changed and we need to update the data
        Object.defineProperty(this, "timestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // timestamp of the last update, usefull to aviod to trigger react hooks twise
        Object.defineProperty(this, "error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // error message
        Object.defineProperty(this, "controller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "disposerObjects", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        // use it if you need use promise instead of observe is_loading
        Object.defineProperty(this, "loading", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => waitIsFalse(this, 'is_loading')
        });
        let { repository, filter, orderBy, offset, limit, relations, fields, omit, autoupdate = false } = props;
        this.repository = repository;
        this.filter = filter;
        this.orderBy = orderBy ? orderBy : new OrderByInput();
        this.offset = offset ? offset : new NumberInput();
        this.limit = limit ? limit : new NumberInput();
        this.relations = relations ? relations : new ArrayStringInput();
        this.fields = fields ? fields : new ArrayStringInput();
        this.omit = omit ? omit : new ArrayStringInput();
        this.autoupdate = autoupdate;
        makeObservable(this);
        this.disposers.push(reaction(() => { var _a; return { isReady: this.isReady, url: (_a = this.repository.adapter) === null || _a === void 0 ? void 0 : _a.getURLSearchParams(this).toString() }; }, action('MO: Query Base - need to update', ({ isReady }) => { if (isReady)
            this.needToUpdate = true; }), { fireImmediately: true }));
    }
    destroy() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.abort();
        while (this.disposers.length) {
            this.disposers.pop()();
        }
        for (let __id in this.disposerObjects) {
            this.disposerObjects[__id]();
            delete this.disposerObjects[__id];
        }
    }
    // use it if everybody should know that the query data is updating
    async load() {
        this.isLoading = true;
        try {
            await this.shadowLoad();
        }
        finally {
            runInAction(() => {
                // the loading can be canceled by another load
                // in this case we should not touch the __is_loading
                if (!this.controller)
                    this.isLoading = false;
            });
        }
    }
    // use it if nobody should know that the query data is updating
    // for example you need to update the current data on the page and you don't want to show a spinner
    async shadowLoad() {
        try {
            this.needToUpdate = false;
            this.error = undefined;
            // NOTE: Date.now() is used to get the current timestamp
            //       and it can be the same in the same tick 
            //       in this case we should increase the timestamp by 1
            const now = Date.now();
            if (this.timestamp === now)
                this.timestamp += 1;
            else
                this.timestamp = now;
            await this.__load();
        }
        catch (e) {
            runInAction(() => this.error = e.message);
        }
    }
    get autoupdate() {
        return !!this.disposerObjects[DISPOSER_AUTOUPDATE];
    }
    set autoupdate(value) {
        if (value !== this.autoupdate) { // indepotent guarantee
            // on 
            if (value) {
                setTimeout(() => {
                    this.disposerObjects[DISPOSER_AUTOUPDATE] = reaction(() => this.needToUpdate && this.isReady, (needToUpdate) => {
                        if (needToUpdate)
                            this.load();
                    }, { fireImmediately: true });
                }, config.AUTO_UPDATE_DELAY);
            }
            // off
            else {
                this.disposerObjects[DISPOSER_AUTOUPDATE]();
                delete this.disposerObjects[DISPOSER_AUTOUPDATE];
            }
        }
    }
    // check if all dependecies are ready
    get isReady() {
        return (this.filter === undefined || this.filter.isReady)
            && this.orderBy.isReady
            && this.offset.isReady
            && this.limit.isReady
            && this.relations.isReady
            && this.fields.isReady
            && this.omit.isReady;
    }
    async __wrap_controller(func) {
        if (this.controller) {
            this.controller.abort();
        }
        this.controller = new AbortController();
        let response;
        try {
            response = await func();
        }
        catch (e) {
            if (e.name !== 'AbortError' && e.message !== 'canceled')
                throw e;
        }
        finally {
            this.controller = undefined;
        }
        return response;
    }
    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.repository.load(this, this.controller);
            runInAction(() => {
                this.__items = objs;
            });
        });
    }
}
__decorate([
    observable,
    __metadata("design:type", Array)
], Query.prototype, "__items", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], Query.prototype, "total", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], Query.prototype, "isLoading", void 0);
__decorate([
    observable,
    __metadata("design:type", Boolean)
], Query.prototype, "needToUpdate", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], Query.prototype, "timestamp", void 0);
__decorate([
    observable,
    __metadata("design:type", String)
], Query.prototype, "error", void 0);
__decorate([
    action('MO: Query Base - load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Query.prototype, "load", null);
__decorate([
    action('MO: Query Base - shadow load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Query.prototype, "shadowLoad", null);

class QueryPage extends Query {
    setPage(n) { this.offset.set(this.limit.value * (n > 0 ? n - 1 : 0)); }
    setPageSize(size) { this.limit.set(size); this.offset.set(0); }
    goToFirstPage() { this.setPage(1); }
    goToPrevPage() { this.setPage(this.current_page - 1); }
    goToNextPage() { this.setPage(this.current_page + 1); }
    goToLastPage() { this.setPage(this.total_pages); }
    get is_first_page() { return this.offset.value === 0; }
    get is_last_page() { return this.offset.value + this.limit.value >= this.total; }
    get current_page() { return this.offset.value / this.limit.value + 1; }
    get total_pages() { return this.total ? Math.ceil(this.total / this.limit.value) : 1; }
    // for compatibility with js code style
    get isFirstPage() { return this.is_first_page; }
    get isLastPage() { return this.is_last_page; }
    get currentPage() { return this.current_page; }
    get totalPages() { return this.total_pages; }
    constructor(props) {
        super(props);
        runInAction(() => {
            if (this.offset.value === undefined)
                this.offset.set(0);
            if (this.limit.value === undefined)
                this.limit.set(config.DEFAULT_PAGE_SIZE);
        });
    }
    async __load() {
        return this.__wrap_controller(async () => {
            const [objs, total] = await Promise.all([
                this.repository.load(this, this.controller),
                this.repository.getTotalCount(this.filter, this.controller)
            ]);
            runInAction(() => {
                this.__items = objs;
                this.total = total;
            });
        });
    }
}
__decorate([
    action('MO: set page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "setPage", null);
__decorate([
    action('MO: set page size'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QueryPage.prototype, "setPageSize", null);

class QueryCacheSync extends Query {
    constructor(props) {
        super(props);
        // watch the cache for changes, and update items if needed
        this.disposers.push(observe(props.repository.cache.store, action('MO: Query - update from cache changes', (change) => {
            if (change.type == 'add') {
                this.__watch_obj(change.newValue);
            }
            if (change.type == "delete") {
                let id = change.name;
                let obj = change.oldValue;
                this.disposerObjects[id]();
                delete this.disposerObjects[id];
                let i = this.__items.indexOf(obj);
                if (i != -1) {
                    this.__items.splice(i, 1);
                    this.total = this.__items.length;
                }
            }
        })));
        // ch all exist objects of model 
        for (let [id, obj] of props.repository.cache.store) {
            this.__watch_obj(obj);
        }
    }
    async __load() {
        if (this.controller)
            this.controller.abort();
        this.controller = new AbortController();
        try {
            await this.repository.load(this, this.controller);
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
        if (this.orderBy.value && this.orderBy.value.size) {
            let compare = (a, b) => {
                for (const [key, value] of this.orderBy.value) {
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
        if (this.disposerObjects[obj.id])
            this.disposerObjects[obj.id]();
        this.disposerObjects[obj.id] = reaction(() => !this.filter || this.filter.isMatch(obj), action('MO: Query - obj was changed', (should) => {
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
], QueryCacheSync.prototype, "items", null);

class QueryStream extends Query {
    // you can reset all and start from beginning
    goToFirstPage() { this.__items = []; this.offset.set(0); }
    // you can scroll only forward
    goToNextPage() { this.offset.set(this.offset.value + this.limit.value); }
    constructor(props) {
        super(props);
        runInAction(() => {
            if (this.offset.value === undefined)
                this.offset.set(0);
            if (this.limit.value === undefined)
                this.limit.set(config.DEFAULT_PAGE_SIZE);
        });
    }
    async __load() {
        if (this.controller)
            this.controller.abort();
        this.controller = new AbortController();
        try {
            const objs = await this.repository.load(this, this.controller);
            runInAction(() => {
                this.__items.push(...objs);
                // total is not make sense for infinity queries
                // total = 1 show that last page is reached
                if (objs.length < this.limit.value)
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
], QueryStream.prototype, "goToFirstPage", null);
__decorate([
    action('MO: next page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryStream.prototype, "goToNextPage", null);

/**
 * QueryRaw is a class to load raw objects from the server
 * without converting them to models using the repository.
 */
class QueryRaw extends Query {
    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.repository.adapter.load(this, this.controller);
            runInAction(() => {
                this.__items = objs;
            });
        });
    }
}

/**
 * QueryRawPage is a class to load raw objects from the server
 * without converting them to models using the repository.
 */
class QueryRawPage extends QueryPage {
    async __load() {
        return this.__wrap_controller(async () => {
            const objs = await this.repository.adapter.load(this);
            const total = await this.repository.getTotalCount(this.filter);
            runInAction(() => {
                this.__items = objs;
                this.total = total;
            });
        });
    }
}

class QueryDistinct extends Query {
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
            const objs = await this.repository.getDistinct(this.filter, this.field, this.controller);
            runInAction(() => {
                this.__items = objs;
            });
        });
    }
}

class Model {
    static getQuery(props) {
        return new Query(Object.assign(Object.assign({}, props), { repository: this.repository }));
    }
    static getQueryPage(props) {
        return new QueryPage(Object.assign(Object.assign({}, props), { repository: this.repository }));
    }
    static getQueryRaw(props) {
        return new QueryRaw(Object.assign(Object.assign({}, props), { repository: this.repository }));
    }
    static getQueryRawPage(props) {
        return new QueryRawPage(Object.assign(Object.assign({}, props), { repository: this.repository }));
    }
    static getQueryCacheSync(props) {
        return new QueryCacheSync(Object.assign(Object.assign({}, props), { repository: this.repository }));
    }
    static getQueryStream(props) {
        return new QueryStream(Object.assign(Object.assign({}, props), { repository: this.repository }));
    }
    static getQueryDistinct(field, props) {
        return new QueryDistinct(field, Object.assign(Object.assign({}, props), { repository: this.repository }));
    }
    static get(id) {
        return this.repository.cache.get(id);
    }
    static async findById(id) {
        return this.repository.get(id);
    }
    static async find(query) {
        return this.repository.find(query);
    }
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
        Object.defineProperty(this, "__disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    destroy() {
        while (this.__disposers.size) {
            this.__disposers.forEach((disposer, key) => {
                disposer();
                this.__disposers.delete(key);
            });
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
    async action(name, kwargs) { return await this.model.repository.action(this, name, kwargs); }
    async create() { return await this.model.repository.create(this); }
    async update() { return await this.model.repository.update(this); }
    async delete() { return await this.model.repository.delete(this); }
    async save() { return this.id === undefined ? this.create() : this.update(); }
    // update the object from the server
    async refresh() { return await this.model.repository.get(this.id); }
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
        if (this.id === undefined && raw_obj.id !== undefined && this.model.repository) {
            // Note: object with equal id can be already in the cache (race condition)
            // I have got the object from websocket before the response from the server
            // Solution: remove the object (that came from websocket) from the cache
            let exist_obj = this.model.repository.cache.get(raw_obj.id);
            if (exist_obj) {
                exist_obj.id = undefined;
            }
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
                settings.foreign_model.repository.cache.update(raw_obj[relation]);
                this[settings.foreign_id_name] = raw_obj[relation].id;
            }
            else if (settings.remote_model && raw_obj[relation]) {
                // many
                if (Array.isArray(raw_obj[relation])) {
                    for (const i of raw_obj[relation]) {
                        settings.remote_model.repository.cache.update(i);
                    }
                }
                // one
                else {
                    settings.remote_model.repository.cache.update(raw_obj[relation]);
                }
            }
        }
    }
}
// Original Class will be decorated by model decorator,
// use this flag to detect original class 
Object.defineProperty(Model, "isOriginalClass", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: true
});
__decorate([
    observable,
    __metadata("design:type", Object)
], Model.prototype, "id", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], Model.prototype, "__init_data", void 0);
__decorate([
    action('model - destroy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Model.prototype, "destroy", null);
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
// Decorator
function model(constructor) {
    var original = constructor;
    // the new constructor
    let f = function (...args) {
        let c = class extends original {
            constructor(...args) { super(...args); }
        };
        c.__proto__ = original;
        let obj = new c();
        makeObservable(obj);
        // id field reactions
        obj.__disposers.set('before changes', intercept(obj, 'id', (change) => {
            if (change.newValue !== undefined && obj.id !== undefined)
                throw new Error(`You cannot change id field: ${obj.id} to ${change.newValue}`);
            if (obj.id !== undefined && change.newValue === undefined)
                obj.model.repository.cache.eject(obj);
            return change;
        }));
        obj.__disposers.set('after changes', observe(obj, 'id', (change) => {
            if (obj.id !== undefined)
                obj.model.repository.cache.inject(obj);
        }));
        // apply fields decorators
        for (let field_name in obj.model.__fields) {
            obj.model.__fields[field_name].decorator(obj, field_name);
        }
        // apply __relations decorators
        for (let field_name in obj.model.__relations) {
            obj.model.__relations[field_name].decorator(obj, field_name);
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
        return foreign_model.repository.cache.get(obj[foreign_id_name]);
    }, 
    // update foreign field
    action('MO: Foreign - update', (_new, _old) => obj[field_name] = _new), { fireImmediately: true });
}
function foreign(foreign_model, foreign_id_name) {
    return function (cls, field_name) {
        var _a;
        // if cls already was decorated by model decorator then use original constructor
        let model = ((_a = cls.prototype) === null || _a === void 0 ? void 0 : _a.constructor.isOriginalClass) ? cls.prototype.constructor : cls.constructor;
        // let model = cls.prototype.constructor
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
        observe(remote_model.repository.cache.store, (change) => {
            let remote_obj;
            switch (change.type) {
                case 'add':
                    remote_obj = change.newValue;
                    remote_obj.__disposers.set(disposer_name, reaction(() => {
                        return {
                            id: remote_obj[remote_foreign_id_name],
                            obj: model.repository.cache.get(remote_obj[remote_foreign_id_name])
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
                    let obj = model.repository.cache.get(remote_obj[remote_foreign_id_name]);
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
        observe(remote_model.repository.cache.store, (remote_change) => {
            let remote_obj;
            switch (remote_change.type) {
                case 'add':
                    remote_obj = remote_change.newValue;
                    remote_obj.__disposers.set(disposer_name, reaction(() => model.repository.cache.get(remote_obj[remote_foreign_id_name]), action(disposer_name, (_new, _old) => {
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
                    let obj = model.repository.cache.get(remote_obj[remote_foreign_id_name]);
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

class Filter {
}

class SingleFilter extends Filter {
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
        // TODO: is __disposers deprecated? I don't find any usage of it and I don't how it can be used
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
        let value = this.input.deserialize();
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
], SingleFilter.prototype, "input", void 0);
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

class EQ_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}`;
    }
    operator(value_a, value_b) {
        return value_a === value_b;
    }
}
// EQV is a verbose version of EQ that add __eq to the URIField
class EQV_Filter extends EQ_Filter {
    get URIField() {
        return `${this.field}__eq`;
    }
}
function EQ(field, value) {
    return new EQ_Filter(field, value);
}
function EQV(field, value) {
    return new EQV_Filter(field, value);
}

class NOT_EQ_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__not_eq`;
    }
    operator(value_a, value_b) {
        return value_a !== value_b;
    }
}
function NOT_EQ(field, value) {
    return new NOT_EQ_Filter(field, value);
}

class GT_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__gt`;
    }
    operator(value_a, value_b) {
        return value_a > value_b;
    }
}
function GT(field, value) {
    return new GT_Filter(field, value);
}

class GTE_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__gte`;
    }
    operator(value_a, value_b) {
        return value_a >= value_b;
    }
}
function GTE(field, value) {
    return new GTE_Filter(field, value);
}

class LT_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__lt`;
    }
    operator(value_a, value_b) {
        return value_a < value_b;
    }
}
function LT(field, value) {
    return new LT_Filter(field, value);
}

class LTE_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__lte`;
    }
    operator(value_a, value_b) {
        return value_a <= value_b;
    }
}
function LTE(field, value) {
    return new LTE_Filter(field, value);
}

class IN_Filter extends SingleFilter {
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
function IN(field, value) {
    return new IN_Filter(field, value);
}

class LIKE_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__contains`;
    }
    operator(current_value, filter_value) {
        return current_value.includes(filter_value);
    }
}
function LIKE(field, value) {
    return new LIKE_Filter(field, value);
}

class ILIKE_Filter extends SingleFilter {
    get URIField() {
        return `${this.field}__icontains`;
    }
    operator(current_value, filter_value) {
        return current_value.toLowerCase().includes(filter_value.toLowerCase());
    }
}
function ILIKE(field, value) {
    return new ILIKE_Filter(field, value);
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

class Adapter {
}

class ReadOnlyAdapter extends Adapter {
    async create() { throw (`You cannot create using READ ONLY adapter.`); }
    async update() { throw (`You cannot update using READ ONLY adapter.`); }
    async delete() { throw (`You cannot delete using READ ONLY adapter.`); }
}

/*
You can use this adapter for mock data or for unit test
*/
let local_store = {};
class LocalAdapter {
    init_local_data(data) {
        let objs = {};
        for (let obj of data) {
            objs[obj.id] = obj;
        }
        local_store[this.store_name] = objs;
    }
    constructor(store_name) {
        Object.defineProperty(this, "store_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "delay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // delays for simulate real usage, use it only for tests
        this.store_name = store_name;
        local_store[this.store_name] = {};
    }
    async action(obj_id, name, kwargs) {
    }
    async create(raw_data) {
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
    async get(obj_id) {
        if (this.delay)
            await timeout(this.delay);
        let raw_obj = Object.values(local_store[this.store_name])[0];
        return raw_obj;
    }
    async update(obj_id, only_changed_raw_data) {
        if (this.delay)
            await timeout(this.delay);
        let raw_obj = local_store[this.store_name][obj_id];
        for (let field of Object.keys(only_changed_raw_data)) {
            raw_obj[field] = only_changed_raw_data[field];
        }
        return raw_obj;
    }
    async delete(obj_id) {
        if (this.delay)
            await timeout(this.delay);
        delete local_store[this.store_name][obj_id];
    }
    async find(query) {
        if (this.delay)
            await timeout(this.delay);
        let raw_obj = Object.values(local_store[this.store_name])[0];
        return raw_obj;
    }
    async load(query) {
        if (this.delay)
            await timeout(this.delay);
        let raw_objs = [];
        if (query.filter) {
            for (let raw_obj of Object.values(local_store[this.store_name])) {
            }
        }
        else {
            raw_objs = Object.values(local_store[this.store_name]);
        }
        // order_by (sort)
        if (query.orderBy.value) {
            raw_objs = raw_objs.sort((obj_a, obj_b) => {
                for (let sort_by_field of query.orderBy.value) {
                }
                return 0;
            });
        }
        // page
        if (query.limit.value !== undefined && query.offset.value !== undefined) {
            raw_objs = raw_objs.slice(query.offset.value, query.offset.value + query.limit.value);
        }
        return raw_objs;
    }
    async getTotalCount(filter) {
        return Object.values(local_store[this.store_name]).length;
    }
    async getDistinct(filter, filed) {
        return [];
    }
    getURLSearchParams(query) {
        return new URLSearchParams();
    }
}
// model decorator
function local() {
    return (cls) => {
        let repository = new Repository(cls, new LocalAdapter(cls.name));
        cls.__proto__.repository = repository;
    };
}

class MockAdapter {
    async action(obj_id, name, kwargs) { }
    async create(raw_data) { return raw_data; }
    async get(obj_id) { return obj_id; }
    async update(obj_id, only_changed_raw_data) { return only_changed_raw_data; }
    async delete(obj_id) { }
    async find(query) { return {}; }
    async load(query) { return []; }
    async getTotalCount(filter) { return 0; }
    async getDistinct(filter, filed) { return []; }
    getURLSearchParams(query) { return new URLSearchParams(); }
}
// model decorator
function mock() {
    return (cls) => {
        let repository = new Repository(cls, new MockAdapter());
        cls.__proto__.repository = repository;
    };
}

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
                    if (this.inputs[key])
                        this.inputs[key].errors = err.message[key];
                    else
                        throw err;
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

class ObjectForm extends Form {
    constructor(inputs, onSubmitted, onCancelled) {
        super(inputs, async () => {
            if (!this.obj) {
                // console.error('ObjectForm error: obj is not set', this)
                throw new Error('ObjectForm error: obj is not set');
            }
            const fieldsNames = Object.keys(this.obj);
            for (let fieldName of Object.keys(this.inputs)) {
                if (!fieldsNames.includes(fieldName)) {
                    // console.error(`ObjectForm error: object has no field ${fieldName}`, this)
                    throw new Error(`ObjectForm error: object has no field ${fieldName}`);
                }
            }
            // move all values from inputs to obj
            for (let fieldName of Object.keys(inputs)) {
                this.obj[fieldName] = inputs[fieldName].value;
            }
            const response = await this.obj.save();
            if (onSubmitted)
                onSubmitted(response);
        }, onCancelled);
        Object.defineProperty(this, "obj", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}

export { AND, AND_Filter, ASC, Adapter, ArrayInput, ArrayNumberInput, ArrayStringInput, BooleanInput, Cache, ComboFilter, DESC, DISPOSER_AUTOUPDATE, DateInput, DateTimeInput, EQ, EQV, EQV_Filter, EQ_Filter, EnumInput, Filter, Form, GT, GTE, GTE_Filter, GT_Filter, ILIKE, ILIKE_Filter, IN, IN_Filter, Input, LIKE, LIKE_Filter, LT, LTE, LTE_Filter, LT_Filter, LocalAdapter, MockAdapter, Model, NOT_EQ, NOT_EQ_Filter, NumberInput, ObjectForm, ObjectInput, OrderByInput, Query, QueryCacheSync, QueryDistinct, QueryPage, QueryRaw, QueryRawPage, QueryStream, ReadOnlyAdapter, Repository, SingleFilter, StringInput, autoResetArrayOfIDs, autoResetArrayToEmpty, autoResetId, config, field, field_field, foreign, local, local_store, many, mock, model, one, repository, timeout, waitIsFalse, waitIsTrue };
//# sourceMappingURL=mobx-orm.es2015.js.map
