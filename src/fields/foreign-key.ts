import store from '../store'

/*
	foreign key
	нельзя непосредственно устонавливать?
	только через соответствующее поле объекта? это гарантирует что такой ключ существует!
*/

export default function foreignKey(foreign_cls: any, foreign_field_key? : string) {
	return function (cls: any, field_key: string) {
		function foreignKey (obj) {
			obj.__data[field_key] = obj[field_key]
			Object.defineProperty(obj, field_key, {
				get: () => obj.__data[field_key],
				set: (new_value) => {
					throw new Error(`Your cannot set key manually, use foreign object filed instead`)
				}
			})
		}
		store.registerModelRelation(cls, field_key, foreign_cls, foreign_field_key)
		store.registerModelField(cls, field_key, foreignKey)
	}
}
