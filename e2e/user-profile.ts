///<reference path="../dist/mobx-orm.d.ts" />
import { Model, model, id, field, foreign, one } from '../dist/mobx-orm'


describe('User Profile.', () => {

    it('...', async ()=> {
        @model
        class User extends Model {
            @id     id      : number
            @field  name    : string
                    profile : UserProfile
        }

        @model
        class UserProfile extends Model {
            @id                 id      : number
            @field              user_id	: number
            @foreign(User)      user    : User
            @field              test    : string
        }
        one(UserProfile)(User, 'profile') 

        let user_a = new User({id: 1, name: 'A'})
        let user_b = new User({id: 2, name: 'B'})
        expect(user_a.profile).toBeNull()
        expect(user_b.profile).toBeNull()

        let user_profile_a = new UserProfile({id: 1, user_id: user_a.id, test: 'A'})
        let user_profile_b = new UserProfile({id: 2, user_id: user_b.id, test: 'B'})
        expect(user_a.profile).toBe(user_profile_a)
        expect(user_b.profile).toBe(user_profile_b)
        expect(user_profile_a.user).toBe(user_a)
        expect(user_profile_b.user).toBe(user_b)
    })
})
