import { autorun } from 'mobx'
import { Model } from './model'
import { ID } from './types'


/**
 * Local id generator.
 * Local id is special id that can be used to identify model object in the local scope.
 * If any id field is undefined then it will return undefined.
 * If all ids are null then it will return null.
 * If there is only one id field then it will return it. It can be number or string.
 * Else it will return all id fields concatenated by '='. It can be only string.
 * @param obj - model object
 * @param ids - id field names
 * @returns local id
 * @throws Error if there is no id fields in the model
 * @throws Error if there is more than one id field in the model
 */
export function getLocalId<T extends Model>(obj: T, ids: string[]): ID | undefined {
    if (ids.length === 0)
        throw new Error('There is no id fields in the model')
    if (ids.length === 1)
        return obj[ids[0]]
    if (ids.some(id => obj[id] === undefined))
        return undefined
    if (ids.every(id => obj[id] === null))
        return null
    return ids.map(id => obj[id]).join('=')
}

export function waitIsTrue(obj: any, field: string) : Promise<Boolean> {
    return new Promise((resolve, reject) => { 
        autorun((reaction) => {
            if (obj[field]) {
                reaction.dispose()
                resolve(true) 
            }
        })
    })
}

export function waitIsFalse(obj: any, field: string) : Promise<Boolean> {
    return new Promise((resolve, reject) => { 
        autorun((reaction) => {
            if (!obj[field]) {
                reaction.dispose()
                resolve(true) 
            }
        })
    })
}

export function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
