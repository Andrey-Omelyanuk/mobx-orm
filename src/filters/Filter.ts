import { Model } from "../model"


export abstract class Filter {
    abstract get URLSearchParams() : URLSearchParams
    abstract setFromURI(uri: string) : void
    abstract isMatch(obj: any) : boolean
}
