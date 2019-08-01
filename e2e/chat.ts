///<reference path="../dist/mobx-orm.d.ts" />
import { store , Model, model, id, field, foreign, many, datetime, number } from '../dist/mobx-orm'


describe('e2e: Chat.', () => {
    store.clear()

    @model
    class User extends Model {
        @id    id           : number
        @field first_name   : string
        @field last_name    : string
        @many('Message', 'user') messages: Message[]

        get full_name() : string { return `${this.first_name} ${this.last_name}` }
    }

    @model
    class Channel extends Model {
        @id id : number
        @many('Message', 'channel') messages : Message[]

        async sendMessage(user: User, text: string) {
            let message = new Message()
            message.channel = this
            message.user    = user
            message.text    = text
            message.created = new Date()
            return message.save()
        }
    }

    @model
    class Message extends Model {
        @id         id          : number
        @datetime   created     : Date
        @field      text        : string
        @number     channel_id  : number
        @number     user_id     : number

        @foreign('Channel') channel : Channel
        @foreign('User')    user    : User
    }

    beforeEach(async ()=> {
        store.clearModel('User')
        store.clearModel('Channel')
        store.clearModel('Message')
    })

    it('init', async ()=> {
        let channelA = new Channel(); channelA.save()
        let channelB = new Channel(); channelB.save()
        let userA = new User({first_name: 'A', last_name: 'X'}); userA.save()
        let userB = new User({first_name: 'B', last_name: 'X'}); userB.save()

        expect(User   .all().length).toBe(2)
        expect(Channel.all().length).toBe(2)
        expect(Message.all().length).toBe(0)
    })

    it('Send messages', async ()=> {
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

        userA.messages[0].delete()
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
