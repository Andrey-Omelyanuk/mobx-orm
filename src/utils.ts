import { autorun } from "mobx"

export function waitIsTrue(field_name: string) : Promise<Boolean> {
    return new Promise((resolve, reject) => { 
        autorun((reaction) => {
            if (this[field_name]) {
                reaction.dispose()
                resolve(true) 
            }
        })
    })
}

export function waitIsFalse(field_name: string) : Promise<Boolean> {
    return new Promise((resolve, reject) => { 
        autorun((reaction) => {
            if (!this[field_name]) {
                reaction.dispose()
                resolve(true) 
            }
        })
    })
}
