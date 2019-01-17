import { observable } from 'mobx'
import store from '../store'


let type = 'field'

export function registerField() {
	store.registerFieldType(type, (model_name, field_name, obj) => {
		// default value
		// if (obj[field_name] === undefined) obj[field_name] = null
	})
}
registerField()


export default function field(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
	store.registerModelField(model_name, type, field_name, {})
	// register into mobx
	observable(cls, field_name)
}
