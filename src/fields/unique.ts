import store from '../store'


export default function unique(cls: any, field_name: string) {
	// It can be wrong name "Function" because we wrapped class in decorator before.
	let model_name = cls.constructor.name == 'Function' ? cls.prototype.constructor.name : cls.constructor.name
	store.registerUniqueField(model_name, field_name)
}
