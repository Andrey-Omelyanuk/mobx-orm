import { autorun } from "mobx"

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
