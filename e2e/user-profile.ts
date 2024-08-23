///<reference path="../dist/mobx-orm.d.ts" />
import { Model, model, field, foreign, one, local } from '../dist/mobx-orm'


describe('User Profile.', () => {

    it('...', async ()=> {
        @local()
        @model
        class User extends Model {
            @field  name    : string
                    profile : UserProfile
        }

        @local()
        @model
        class UserProfile extends Model {
            @field              user_id	: number
            @foreign(User)      user    : User
            @field              test    : string
        }
        one(UserProfile)(User, 'profile') 

        let user_a = new User({id: 1, name: 'A'})
        let user_b = new User({id: 2, name: 'B'})
        expect(user_a.profile).toBe(undefined)
        expect(user_b.profile).toBe(undefined)

        let user_profile_a = new UserProfile({id: 1, user_id: user_a.id, test: 'A'})
        let user_profile_b = new UserProfile({id: 2, user_id: user_b.id, test: 'B'})
        expect(user_a.profile).toBe(user_profile_a)
        expect(user_b.profile).toBe(user_profile_b)
        expect(user_profile_a.user).toBe(user_a)
        expect(user_profile_b.user).toBe(user_b)
    })
})
