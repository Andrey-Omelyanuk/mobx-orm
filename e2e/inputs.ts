import { field, ILIKE, Input, Model, model, ORDER_BY2, STRING, ARRAY } from "../dist/mobx-orm"


describe('Other tests: Inputs.', () => {

    @model
    class File extends Model {
        @field(STRING({maxLength: 24, required: true}))
        title: string
    }

    it('...', async ()=> {
        // const input = new Input(STRING(), { syncURL: 'search', debounce: 400 })
        // const filesQuery = File.getQuery({
        //     filter      : ILIKE('title', input),
        //     orderBy     : new Input(ARRAY({type: ORDER_BY2()}), {value: [['uploaded_at', DESC]]}),
        //     relations   : new Input(ARRAY({type: STRING()})   , {value: ['versions', ]}),
        //     autoupdate  : false
        // })
    })
})
