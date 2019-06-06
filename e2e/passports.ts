///<reference path="../dist/mobx-orm.d.ts" />
import { store , Model, model, id, field, foreign, one, many, datetime, number } from '../dist/mobx-orm'


describe('Other tests: Passports.', () => {
    store.clear()

    @model
    class User extends Model {
        @id     id           : number
        @field  user_name    : string

        @one ('Passport', 'user_id') passport: Passport
        @many('Key'     , 'user_id') keys    : Key[]

        async generateNewKey() {
            let new_key = new Key({user_id: this.id})
            await new_key.save()
            return new_key
        }
        async createPassport(first_name?, last_name?) {
            if (!this.passport) {
                let passport = new Passport({
                    user_id     : this.id, 
                    first_name  : first_name ? first_name : this.user_name, 
                    last_name   : last_name  ? last_name  : this.user_name
                })
                await passport.save()
            }
            return this.passport
        }
    }

    @model
    class Passport extends Model {
        @id       id            : number
        @datetime created       : Date
        @number   user_id       : number
        @field    first_name    : string
        @field    last_name     : string

        constructor(init_data?) {
            super(init_data)
            this.created = new Date()
        }
    }

    @model
    class Key extends Model {
        @id         id      : number
        @datetime   created : Date
        @field      private : string
        @field      public  : string
        @number     user_id : number

        @foreign('User') user : User

        constructor(init_data?) {
            super(init_data)
            this.private = 'private'
            this.public  = 'public'
        }

        async sign(passport: Passport, key: Key, type: ActionType) {
            let action = new Action({
                passport_id	: passport.id,
                key_id      : key.id,
                type        : type,
                signer_id   : this.id,
                sign        : `signer:${this.id}-passport:${passport.id}-key:${key.id}-type:${type}`
            })
            await action.save()
            return action
        }
    }

    enum ActionType {
        ACCEPT = 1,
        REJECT = 2
    }

    @model
    class Action extends Model {
        @id         id          : number
        @datetime   timestamp   : Date
        @number     passport_id : number
        @number     key_id      : number
        @number     type        : ActionType
        @number     signer_id   : number
        @field      sign        : string

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

        expect(userA.user_name).toBe('A')
        expect(userA.passport).toBeNull()
        expect(userA.keys.length).toBe(0)

        let passportA = await userA.createPassport(); expect(userA.passport).toBe(passportA)
        let passportB = await userB.createPassport(); expect(userB.passport).toBe(passportB)
        let passportC = await userC.createPassport(); expect(userC.passport).toBe(passportC)

        let keyA1 = await userA.generateNewKey(); expect(userA.keys.length).toBe(1)
        let keyB1 = await userB.generateNewKey(); expect(userB.keys.length).toBe(1)
        let keyC1 = await userC.generateNewKey(); expect(userC.keys.length).toBe(1)

        // self sign
        await keyA1.sign(passportA, keyA1, ActionType.ACCEPT)
        await keyB1.sign(passportB, keyB1, ActionType.ACCEPT)
        await keyC1.sign(passportC, keyC1, ActionType.ACCEPT)

        let action4 = keyA1.sign(passportB, keyB1, ActionType.ACCEPT)
        let action5 = keyB1.sign(passportA, keyA1, ActionType.ACCEPT)
    })
})
