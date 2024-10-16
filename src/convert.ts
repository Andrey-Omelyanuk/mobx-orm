import { ASC, DESC, ORDER_BY } from "./types"

export enum TYPE {
    ID              = 'id',
    STRING          = 'string',
    NUMBER          = 'number',
    DATE            = 'date',
    DATETIME        = 'datetime',
    BOOLEAN         = 'boolean',
    ARRAY_ID        = 'array-id',
    ARRAY_STRING    = 'array-string',
    ARRAY_NUMBER    = 'array-number',
    ARRAY_DATE      = 'array-date',
    ARRAY_DATETIME  = 'array-datetime',
    ORDER_BY        = 'order-by',
}

const arrayToString = (type, value) => {
    let result = [] 
    if (value) {
        for (const i of value) {
            let v = toString(type, i) 
            if (v !== undefined)
                result.push(v)
        }
    }
    return result.length ? result.join(',') : undefined
}

const stringToArray = (type, value) => {
    let result = [] 
    if (value) {
        for (const i of value.split(',')) {
            let v = stringTo(type, i) 
            if (v !== undefined) {
                result.push(v)
            }
        }
    }
    return result
}

export const toString = (valueType: TYPE, value: any): string => {
    if (value === undefined) return undefined
    if (value === null) return 'null'

    switch (valueType) {
        case TYPE.NUMBER:   return ''+value
        case TYPE.ID    :   return ''+value
        case TYPE.STRING:   return value
        case TYPE.DATE:     return value instanceof Date ? (value as Date).toISOString().split('T')[0] : ""
        case TYPE.DATETIME: return value instanceof Date ? (value as Date).toISOString() : ""
        case TYPE.BOOLEAN:  return !!value ? 'true' : 'false' 
        case TYPE.ARRAY_STRING  : return arrayToString(TYPE.STRING  , value)
        case TYPE.ARRAY_NUMBER  : return arrayToString(TYPE.NUMBER  , value)
        case TYPE.ARRAY_DATE    : return arrayToString(TYPE.DATE    , value)
        case TYPE.ARRAY_DATETIME: return arrayToString(TYPE.DATETIME, value)
        case TYPE.ORDER_BY: 
            if (value) {
                let result = ''
                for (const [key, val] of value) {
                    if (result)       result += ','
                    if (val === DESC) result += '-'
                    result += key.replace(/\./g, '__')
                }
                return result ? result : undefined
            }
            return undefined 
    }
}


export const stringTo = (valueType: TYPE, value: string, enumType?: Object): any => {
    let result

         if (value === undefined) return undefined
    else if (value === 'null')    return null
    else if (value === null)      return null

    switch (valueType) {
        case TYPE.NUMBER:   
            result = parseInt(value)
            if (isNaN(result))
                return undefined
            return result
        case TYPE.ID:
            result = parseInt(value)
            if (isNaN(result))
                return value 
            return result
        case TYPE.STRING:   return value
        case TYPE.DATE:     return new Date(value)
        case TYPE.DATETIME: return new Date(value)
        case TYPE.BOOLEAN:  return value === 'true' ? true : value === 'false' ? false : undefined
        case TYPE.ARRAY_STRING  : return stringToArray(TYPE.STRING  , value)
        case TYPE.ARRAY_NUMBER  : return stringToArray(TYPE.NUMBER  , value)
        case TYPE.ARRAY_DATE    : return stringToArray(TYPE.DATE    , value)
        case TYPE.ARRAY_DATETIME: return stringToArray(TYPE.DATETIME, value)
        case TYPE.ORDER_BY:
            result = new Map() as ORDER_BY 
            if (value) {
                for (const item of value.split(',')) {
                    if (item[0] === '-')
                        result.set(item.slice(1), DESC)
                    else
                        result.set(item, ASC)
                }
            }
            return result
    }
}
