import { computed } from 'mobx'
import store from './store'
import { Model, model } from './model'
import id    from './fields/id'
import field from './fields/field'


describe('Model', () => {

    store.clear()

    @model
    class User extends Model {
        @id id				: number
        @field first_name	: string = 'default first name'
        @field last_name 	: string
        @computed get full_name() {
            return `${this.first_name} ${this.last_name}`
        }

        static staticMethod () {
            return true
        }
    }

    it('...', async () => {
        let user = new User({first_name: 'A', last_name: 'B'})
        expect(user.id        ).toBeNull()
        expect(user.first_name).toBe('A')
        expect(user.last_name ).toBe('B')

        let full_name = user.full_name
        expect(user.full_name).toBe('A B')

        await user.save();	expect(user.id).not.toBeNull()
                            expect(User.get(user.getId())).toBe(user)

        let old_id = user.id
        await user.delete();	expect(user.id).toBeNull()
                                expect(store.models['User'].objects[old_id]).toBeUndefined()
    })

    it('Model.get(id)', async () => {
        let user_a = new User({first_name: 'a', last_name: 'a'}); await user_a.save()
        let user_b = new User({first_name: 'b', last_name: 'b'}); await user_b.save()
        let user_c = new User({first_name: 'c', last_name: 'c'}); await user_c.save()

        expect(User.get(user_a.getId())).toBe(user_a)
        expect(User.get(user_b.getId())).toBe(user_b)
        expect(User.get(user_c.getId())).toBe(user_c)
    })

    it('Model.all()', async () => {
        let user_a = new User({first_name: 'a', last_name: 'a'}); await user_a.save()
        let user_b = new User({first_name: 'b', last_name: 'b'}); await user_b.save()
        let user_c = new User({first_name: 'c', last_name: 'c'}); await user_c.save()
        let all_users = User.all()

        expect(all_users.includes(user_a)).toBeTruthy()
        expect(all_users.includes(user_b)).toBeTruthy()
        expect(all_users.includes(user_c)).toBeTruthy()
    })

    it('Model.load()', async () => {
    })

    it('Model.getModelName()', async () => {
        expect(User.getModelName()).toBe('User')
    })

    it('Model.getModelDescription()', async () => {
        expect(User.getModelDescription()).toBe(store.models[User.getModelName()])
    })

    it('obj.getModelName()', async () => {
        let user = new User()
        expect(user.getModelName()).toBe('User')
    })

    it('obj.getModelDescription()', async () => {
        let user = new User()
        expect(user.getModelDescription()).toBe(store.models[user.getModelName()])
    })

    it('Static method should stay on class', async () => {
        expect(typeof User.staticMethod).toBe('function')
        expect(User.staticMethod()).toBeTruthy()
    })


    it('defaults from class declaration', async () => {
        let user_a = new User({first_name: 'a'}) 
        let user_b = new User({})
        let user_c = new User()

        expect(user_a.first_name).toBe('a')
        expect(user_b.first_name).toBe('default first name')
        expect(user_c.first_name).toBe('default first name')
    })

    it('Using models after clear', async () => {
        @model class X extends Model { @id id : number }
        store.clear()
        expect(() => { new X()                  }).toThrow(new Error(`Description for 'X' is not exist. Maybe, you called store.clear after model declaration.`))
        expect(() => { X.get('0')               }).toThrow(new Error(`Description for 'X' is not exist. Maybe, you called store.clear after model declaration.`))
        expect(() => { X.all()                  }).toThrow(new Error(`Description for 'X' is not exist. Maybe, you called store.clear after model declaration.`))
        expect(() => { X.getModelDescription()  }).toThrow(new Error(`Description for 'X' is not exist. Maybe, you called store.clear after model declaration.`))
    })
})
