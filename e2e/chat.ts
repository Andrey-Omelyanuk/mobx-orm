///<reference path="../dist/mobx-orm.d.ts" />
import { action } from 'mobx'
import { Model, model, local, id, field, foreign, many } from '../src/index'


describe('e2e: Chat.', () => {

    function declare() {

        @local('user')
        @model class User extends Model {
            @id     id          : number
            @field  first_name  : string
            @field  last_name   : string
                    messages    : Message[]

            get full_name() : string { return `${this.first_name} ${this.last_name}` }
        }

        @local('channel')
        @model class Channel extends Model {
            @id id      : number
                messages: Message[]

            @action
            async sendMessage(user: User, text: string) {
                let message = new Message({channel: this, user: user, text: text, created: new Date()})
                return message.save()
            }
        }

        @local('message')
        @model class Message extends Model {
            @id    id          : number
            @field created     : Date
            @field text        : string
            @field channel_id  : number
            @field user_id     : number

            @foreign(Channel) channel : Channel
            @foreign(User)    user    : User
        }
        many(Message, 'user_id'   )(User, 'messages') 
        many(Message, 'channel_id')(Channel, 'messages') 

        return { User: User, Channel: Channel, Message: Message }
    } 

    it('init', async ()=> {
        const {User, Channel, Message} = declare()
        let channelA = new Channel(); channelA.save()
        let channelB = new Channel(); channelB.save()
        let userA = new User({first_name: 'A', last_name: 'X'}); userA.save()
        let userB = new User({first_name: 'B', last_name: 'X'}); userB.save()

        expect((<any>User   ).cache.size).toBe(2)
        expect((<any>Channel).cache.size).toBe(2)
        expect((<any>Message).cache.size).toBe(0)
    })

    it('Send messages', async ()=> {
        const {User, Channel, Message} = declare()
        let channelA = new Channel(); channelA.save()
        let channelB = new Channel(); channelB.save()
        let userA = new User({first_name: 'A', last_name: 'X'}); userA.save()
        let userB = new User({first_name: 'B', last_name: 'X'}); userB.save()

        await channelA.sendMessage(userA, 'First  message from userA')
        await channelA.sendMessage(userA, 'Second message from userA')
        await channelA.sendMessage(userB, 'First  message from userB')
        await channelA.sendMessage(userA, 'Third  message from userA')

        expect(channelA.messages[0].text).toBe('First  message from userA')
        expect(channelA.messages[1].text).toBe('Second message from userA')
        expect(channelA.messages[2].text).toBe('First  message from userB')
        expect(channelA.messages[3].text).toBe('Third  message from userA')

        expect(userA.messages.length).toBe(3)
        expect(userA.messages[0].text).toBe('First  message from userA')

        await userA.messages[0].delete()
        expect(userA.messages.length).toBe(2)
        expect(userA.messages[0].text).toBe('Second message from userA')
        expect(userA.messages[1].text).toBe('Third  message from userA')

        await channelB.sendMessage(userA, 'B:First  message from userA')
        await channelB.sendMessage(userA, 'B:Second message from userA')
        await channelB.sendMessage(userB, 'B:First  message from userB')
        await channelB.sendMessage(userA, 'B:Third  message from userA')

        expect(userA.messages.length).toBe(5)
        expect(userB.messages.length).toBe(2)
        expect(userA.messages[userA.messages.length-1].text).toBe('B:Third  message from userA')
    })
})
