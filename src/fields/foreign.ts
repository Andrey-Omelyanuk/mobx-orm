import { extendObservable, reaction, action } from 'mobx'
import { Model, ModelDescriptor } from '../model'
import { getLocalId } from '../utils'


export default function foreign<T extends Model>(
    foreignModelClass: new() => T,
    foreignIds: string[] = []
) {
    return function<M extends Model>(modelDescription: ModelDescriptor<M>, fieldName: string) {
        if (modelDescription.ids[fieldName])
            throw new Error(`Foreign field "${fieldName}" already registered in model "${modelDescription.cls.name}"`)

        // if foreignIds is not defined then try to auto detect it
        // it's work only with single id
        const foreignModelDescription = (foreignModelClass as any).getModelDescription()
        if (foreignIds.length === 0) {
            let id_fields = Object.keys(foreignModelDescription.ids)
            if (id_fields.length === 1)
                foreignIds.push(`${fieldName}_id`)
            else
                throw new Error(`Cannot auto detect foreign id field for model ${foreignModelClass.name} on field ${fieldName}`)
        }

        modelDescription.relations[fieldName] = {
            // decorator will be called after obj creation for setup the field, see model decorator
            decorator: (obj: Model, field_name: string) => {
                extendObservable(obj, { [fieldName]: undefined })
                reaction(
                    // watch on foreign cache for foreign object
                    () => {
                        const localId = getLocalId(obj, foreignIds)
                        if (localId === undefined) return undefined
                        if (localId === null) return null  // foreign object can be not exist explicitly
                        return foreignModelDescription.repository.cache.get(localId)
                    },
                    // update foreign field
                    action('MO: Foreign - update',
                        (_new, _old) => obj[fieldName] = _new 
                    ),
                    {fireImmediately: true}
                )
            },
            settings : {
                foreignModel: foreignModelClass,
                foreignIds  : foreignIds 
            } 
        }
    }
}
