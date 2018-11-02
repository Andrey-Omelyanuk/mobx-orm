import { extendObservable } from 'mobx'
import store from '../store'


let type = 'computed'

export function registerField() {
	store.registerFieldType(type, (model_name, field_name, obj) => {
		// nothing do
	})
}
registerField()


export default function computed(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelField(model_name, type, field_name, {})
}
