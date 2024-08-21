export abstract class Filter {
    abstract get URLSearchParams() : URLSearchParams
    abstract isMatch(obj: any) : boolean
    abstract get isReady() : boolean
}
