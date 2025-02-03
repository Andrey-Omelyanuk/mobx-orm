import { autorun } from 'mobx'
import { Model, ModelDescriptor } from './model'


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
