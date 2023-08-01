export abstract class XFilter {
    abstract get URLSearchParams() : URLSearchParams
    abstract setFromURI(uri: string) : void
    abstract isMatch(obj: any) : boolean
    abstract get isReady() : boolean
}
