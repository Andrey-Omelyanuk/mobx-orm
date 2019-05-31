import { store , Model, model, id, field, foreign, many } from 'dist/mobx-orm'


describe('Other tests: Passports.', () => {

    store.clear()

    @model
    class User extends Model {
        @id id : number
        @field user_name : string
        @many('Key', 'user_id') keys : Key[]

        generateNewKey() {
            let new_key = new Key({user_id: this.id})
            new_key.save()
            return new_key
        }
    }

    @model
    class Passport extends Model {
        @id    id         : number
        @field timestamp  : Date
        @field first_name	: string
        @field last_name	: string

        constructor(init_data?) {
            super(init_data)
            this.timestamp = new Date()
        }
    }

    @model
    class Key extends Model {
        @id id : number
        @field private : string
        @field public  : string
        @field user_id : number
        @foreign('User') user : User

        constructor(init_data?) {
            super(init_data)
            this.private = 'private'
            this.public  = 'public'
        }

        sign(passport: Passport, key: Key, type: ActionType) {
            let action = new Action({
                passport_id	: passport.id,
                key_id			: key.id,
                type				: type,
                signer_id		: this.id,
                sign: `signer:${this.id}-passport:${passport.id}-key:${key.id}-type:${type}`
            })
            action.save()
            return action
        }
    }

    enum ActionType {
        ACCEPT = 1,
        REJECT = 2
    }

    @model
    class Action extends Model {
        @id id: number
        @field timestamp  : Date
        @field passport_id: number
        @field key_id     : number
        @field type       : ActionType
        @field signer_id  : number
        @field sign				: string

        @foreign('Passport') passport: Passport
        @foreign('Key'     ) key     : Key
        @foreign('Key'     ) signer  : Key

        constructor(init_data?) {
            super(init_data)
            this.timestamp = new Date()
        }
    }

    // TODO: finish it
    it('...', async ()=> {
        let userA = new User({user_name: 'A'}); await userA.save()
        let userB = new User({user_name: 'B'}); await userB.save()
        let userC = new User({user_name: 'C'}); await userC.save()

        let passportA = new Passport({first_name: 'A', last_name: 'A'}); await passportA.save()
        let passportB = new Passport({first_name: 'B', last_name: 'B'}); await passportB.save()
        let passportC = new Passport({first_name: 'C', last_name: 'C'}); await passportC.save()

        let keyA1 = userA.generateNewKey()
        let keyB1 = userB.generateNewKey()
        let keyC1 = userC.generateNewKey()

        let action1 = keyA1.sign(passportA, keyA1, ActionType.ACCEPT)
        let action2 = keyB1.sign(passportB, keyB1, ActionType.ACCEPT)
        let action3 = keyC1.sign(passportC, keyC1, ActionType.ACCEPT)

        let action4 = keyA1.sign(passportB, keyB1, ActionType.ACCEPT)
        let action5 = keyB1.sign(passportA, keyA1, ActionType.ACCEPT)
    })
})
