import{observable as e,intercept as o,observe as t,autorun as n}from"mobx";var r=new(function(){function o(){this.debug=!1,this.models={},this.field_types={}}return o.prototype.registerModel=function(o){if(this.models[o])throw new Error('Model "'+o+'" already registered.');var t=0;this.models[o]={objects:{},fields:{},unique:{},getNewId:function(){return t+=1},save:void 0,delete:void 0,load:void 0},this.models[o].objects=e(this.models[o].objects)},o.prototype.registerFieldType=function(e,o){if(this.field_types[e])throw new Error('Field type "'+e+'" already registered.');this.field_types[e]=o},o.prototype.registerModelField=function(e,o,t,n,r,i){void 0===n&&(n={}),void 0===r&&(r=null),void 0===i&&(i=null),this.models[e]||this.registerModel(e);var l=this.models[e];if(l.fields[t])throw'Field "'+t+'" on "'+e+'" already registered.';l.fields[t]={type:o,settings:n,serialize:r,deserialize:i}},o.prototype.inject=function(e,o){var t=this.models[e];if(!(e in this.models))throw new Error('Model name "'+e+" is not registered in the store");if(!o||!o.constructor)throw new Error("object should be a object with constructor");if(!o.id)throw new Error("Object should have id!");if(o.constructor.name!=e)throw new Error('You can inject only instance of "'+e+'"');if(t.objects[o.id])throw new Error('Object with id="'+o.id+'" already exist in model "'+e+'".');t.objects[o.id]=o},o.prototype.eject=function(e,o){var t=this.models[e];if(!(e in this.models))throw new Error('Model name "'+e+" is not registered in the store");if(!o||!o.constructor)throw new Error("object should be a object with constructor");if(!o.id)throw new Error("Object should have id!");if(o.constructor.name!=e)throw new Error('You can eject only instance of "'+e+'"');if(!t.objects[o.id])throw new Error("Object with id "+o.id+' not exist in model "'+e+'"');delete t.objects[o.id]},o.prototype.clear=function(){for(var e=0,o=Object.keys(this.models);e<o.length;e++)for(var t=o[e],n=0,r=Object.values(this.models[t].objects);n<r.length;n++){var i=r[n];i.delete&&i.delete()}this.models={}},o.prototype.clearModel=function(e){for(var o=0,t=Object.values(this.models[e].objects);o<t.length;o++){var n=t[o];n.delete&&n.delete()}},o}());function i(e,o,t,n){return new(t||(t=Promise))(function(r,i){function l(e){try{a(n.next(e))}catch(e){i(e)}}function u(e){try{a(n.throw(e))}catch(e){i(e)}}function a(e){e.done?r(e.value):new t(function(o){o(e.value)}).then(l,u)}a((n=n.apply(e,o||[])).next())})}function l(e,o){var t,n,r,i,l={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(t)throw new TypeError("Generator is already executing.");for(;l;)try{if(t=1,n&&(r=2&i[0]?n.return:i[0]?n.throw||((r=n.return)&&r.call(n),0):n.next)&&!(r=r.call(n,i[1])).done)return r;switch(n=0,r&&(i=[2&i[0],r.value]),i[0]){case 0:case 1:r=i;break;case 4:return l.label++,{value:i[1],done:!1};case 5:l.label++,n=i[1],i=[0];continue;case 7:i=l.ops.pop(),l.trys.pop();continue;default:if(!(r=(r=l.trys).length>0&&r[r.length-1])&&(6===i[0]||2===i[0])){l=0;continue}if(3===i[0]&&(!r||i[1]>r[0]&&i[1]<r[3])){l.label=i[1];break}if(6===i[0]&&l.label<r[1]){l.label=r[1],r=i;break}if(r&&l.label<r[2]){l.label=r[2],l.ops.push(i);break}r[2]&&l.ops.pop(),l.trys.pop();continue}i=o.call(e,l)}catch(e){i=[6,e],n=0}finally{t=r=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}}window.mobx_orm_store=r;var u=function(){function e(e){this._init_data=e}return e.get=function(e){var o=this.prototype.constructor.name;return r.models[o].objects[e]},e.all=function(){var e=this.prototype.constructor.name;return Object.values(r.models[e].objects)},e.load=function(e,o,t,n){return void 0===e&&(e={}),void 0===o&&(o={}),void 0===t&&(t=0),void 0===n&&(n=0),i(this,void 0,void 0,function(){var i,u;return l(this,function(l){if(i=this.prototype.constructor.name,(u=r.models[i]).load)return[2,u.load(this,e,o,t,n)];throw Error("load function is not defined for "+i)})})},e.getFieldsMeta=function(){var e=this.prototype.constructor.name;return r.models[e].fields},e.prototype.save=function(){return i(this,void 0,void 0,function(){var e,o,t;return l(this,function(n){return e=this.constructor.name,(o=r.models[e]).save?[2,o.save(this)]:((t=this).id||(t.id=o.getNewId()),[2,Promise.resolve(t)])})})},e.prototype.delete=function(){return i(this,void 0,void 0,function(){var e,o;return l(this,function(t){return e=this.constructor.name,(o=r.models[e]).delete?[2,o.delete(this)]:(this.id=null,[2,Promise.resolve(this)])})})},e}();function a(e){for(var o=function(){for(var o=[],t=0;t<arguments.length;t++)o[t]=arguments[t];var n=function(){return e.apply(this,o)};n.__proto__=e.__proto__,n.prototype=e.prototype;var i=e.name,l=r.models[i],u=new n,a=u._init_data;for(var s in delete u._init_data,l.fields)void 0!==u[s]&&void 0===a[s]&&(a[s]=u[s]);for(var s in l.fields){var c=l.fields[s].type;r.field_types[c](i,s,u)}if(a)for(var s in a)u[s]=a[s];return u},t=0,n=Object.getOwnPropertyNames(e);t<n.length;t++){var i=n[t];null==o[i]&&(o[i]=e[i])}return o.__proto__=e.__proto__,o.prototype=e.prototype,o}var s="id";function c(o,t){var n="Function"===o.constructor.name?o.prototype.constructor.name:o.constructor.name;if("id"!=t)throw new Error("id field should named by 'id'");r.registerModelField(n,s,t),e(o,t)}r.registerFieldType(s,function(e,n,i){o(i,n,function(o){if(null!=o.newValue){if(null!=i.id)throw new Error("You cannot change id.");if(!Number.isInteger(o.newValue))throw new Error("Id can be only integer or null.")}return i.id&&null==o.newValue&&r.eject(e,i),o}),t(i,n,function(o){o.newValue&&r.inject(e,i)}),void 0===i[n]&&(i[n]=null)});var d="field";function f(o,t){var n="Function"===o.constructor.name?o.prototype.constructor.name:o.constructor.name;r.registerModelField(n,d,t),e(o,t)}r.registerFieldType(d,function(e,o,t){});var m="foreign";function h(o,t){return function(n,i){var l="Function"===n.constructor.name?n.prototype.constructor.name:n.constructor.name;"function"==typeof o&&(o="Function"==o.constructor.name?o.prototype.constructor.name:o.constructor.name),r.registerModelField(l,m,i,{foreign_model_name:o,foreign_id_field_name:t||i+"_id"}),e(n,i)}}function w(o,n){return function(i,l){var u="Function"==i.constructor.name?i.prototype.constructor.name:i.constructor.name;"function"==typeof o&&(o="Function"==o.constructor.name?o.prototype.constructor.name:o.constructor.name),r.models[u]||r.registerModel(u),r.models[o]||r.registerModel(o),r.registerModelField(u,"one",l,{foreign_model_name:o,foreign_id_field_name:n}),e(i,l),t(r.models[u].objects,function(e){if("add"==e.type)for(var t=0,i=Object.values(r.models[o].objects);t<i.length;t++){var u=i[t];u[n]==e.newValue.id&&(e.newValue[l]=u)}}),t(r.models[o].objects,function(e){switch(e.type){case"add":var o=r.models[u].objects[e.newValue[n]];o&&(o[l]=e.newValue),t(e.newValue,n,function(o){o.oldValue&&(r.models[u].objects[o.oldValue][l]=null);if(o.newValue){var t=r.models[u].objects[o.newValue];t&&(t[l]=e.newValue)}});break;case"remove":var i=r.models[u].objects[e.oldValue[n]];i&&(i[l]=null)}})}}function p(o,n){return function(i,l){var u="Function"===i.constructor.name?i.prototype.constructor.name:i.constructor.name;"function"==typeof o&&(o="Function"==o.constructor.name?o.prototype.constructor.name:o.constructor.name),r.models[u]||r.registerModel(u),r.models[o]||r.registerModel(o),r.registerModelField(u,"many",l,{foreign_model_name:o,foreign_id_field_name:n}),e(i,l),t(r.models[u].objects,function(e){if("add"===e.type)for(var t=0,i=Object.values(r.models[o].objects);t<i.length;t++){var u=i[t];u[n]==e.newValue.id&&e.newValue[l].push(u)}}),t(r.models[o].objects,function(e){var o,i;switch(e.type){case"add":o=e.newValue,(i=r.models[u].objects[o[n]])&&(r.debug&&console.log("many "+u+"."+l+" of "+i.id+" add "+o.id+" start"),i[l].push(o),r.debug&&console.log("many "+u+"."+l+" of "+i.id+" add "+o.id+" finish")),t(o,n,function(e){if(e.newValue){var t=e.newValue,n=r.models[u].objects[t];n&&(r.debug&&console.log("many "+u+"."+l+" of "+t+" add "+o.id+" start"),n[l].push(o),r.debug&&console.log("many "+u+"."+l+" of "+t+" add "+o.id+" finish"))}if(e.oldValue){t=e.oldValue;var i=r.models[u].objects[t];if(i){var a=i[l].indexOf(o);a>-1&&(r.debug&&console.log("many "+u+"."+l+" of "+t+" remove "+o.id+" start"),i[l].splice(a,1),r.debug&&console.log("many "+u+"."+l+" of "+t+" remove "+o.id+" finish"))}}});break;case"remove":if(o=e.oldValue,i=r.models[u].objects[o[n]]){var a=i[l].indexOf(o);a>-1&&(r.debug&&console.log("many "+u+"."+l+" of "+i.id+" remove "+o.id+" start"),i[l].splice(a,1),r.debug&&console.log("many "+u+"."+l+" of "+i.id+" remove "+o.id+" finish"))}}})}}r.registerFieldType(m,function(e,i,l){var u=r.models[e].fields[i].settings.foreign_model_name,a=r.models[e].fields[i].settings.foreign_id_field_name;n(function(){var e=r.models[u].objects[l[a]];l[i]=e||null}),o(l,i,function(e){if(null!==e.newValue&&(!e.newValue.constructor||e.newValue.constructor.name!=u))throw new Error('You can set only instance of "'+u+'" or null');if(null!==e.newValue&&null===e.newValue.id)throw new Error("Object should have id!");return e}),t(l,i,function(e){if(e.newValue!==e.oldValue)try{l[a]=null===e.newValue?null:e.newValue.id}catch(o){throw l[a]=null===e.oldValue?null:e.oldValue.id,o}}),void 0===l[i]&&(l[i]=null)}),r.registerFieldType("one",function(e,n,i){var l=r.models[e].fields[n].settings.foreign_model_name,u=r.models[e].fields[n].settings.foreign_id_field_name;o(i,n,function(e){if(null!==e.newValue){if(!e.newValue.constructor||e.newValue.constructor.name!==l)throw new Error('You can set only instance of "'+l+'" or null');if(null===e.newValue.id)throw new Error("Object should have id!")}return e}),t(i,n,function(e){if(e.newValue!==e.oldValue){var o=null,t=null;try{e.oldValue&&(o=e.oldValue[u],e.oldValue[u]=null),e.newValue&&(t=e.newValue[u],e.newValue[u]=i.id)}catch(n){throw e.newValue&&(e.newValue[u]=t),e.oldValue&&(e.oldValue[u]=o),n}}}),i[n]=null}),r.registerFieldType("many",function(e,o,t){t[o]=[]});var v="number";function y(o,t){var n="Function"==o.constructor.name?o.prototype.constructor.name:o.constructor.name;r.registerModelField(n,v,t),e(o,t)}r.registerFieldType(v,function(e,t,n){o(n,t,function(e){if(null!==e.newValue&&(e.newValue!==Number(e.newValue)||e.newValue%1!=0))throw new Error("Field can be only integer or null.");return e})});var b="float";function g(o,t){var n="Function"===o.constructor.name?o.prototype.constructor.name:o.constructor.name;r.registerModelField(n,b,t),e(o,t)}r.registerFieldType(b,function(e,t,n){o(n,t,function(e){if(null!==e.newValue&&e.newValue!==Number(e.newValue))throw new Error("Field can be only float or null.");return e})});var V="datetime";function _(o,t){var n="Function"===o.constructor.name?o.prototype.constructor.name:o.constructor.name;r.registerModelField(n,V,t,{},function(e){return new Date(e)},function(e){return e.toISOString()}),e(o,t)}r.registerFieldType(V,function(e,t,n){o(n,t,function(e){if(null!==e.newValue&&"[object Date]"!==Object.prototype.toString.call(e.newValue))throw new Error("Field can be only Date or null.");return e})});export{u as Model,_ as datetime,f as field,g as float,h as foreign,c as id,p as many,a as model,y as number,w as one,r as store};
//# sourceMappingURL=mobx-orm.es2015.js.map
