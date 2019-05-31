import { store , Model, model, id, field, foreign, many } from 'dist/mobx-orm'


describe('Other tests: Chat.', () => {

    store.clear()

    @model
    class User extends Model {
        @id    id           : number
        @field first_name   : string
        @field last_name    : string
        @many('ChannelMessage', 'user_id') messages: ChannelMessage[]

        get full_name() : string { return `${this.first_name} ${this.last_name}` }
    }

    @model
    class Channel extends Model {
        @id id : number
        @many('ChannelMessage', 'channel_id') messages : ChannelMessage[]

        async sendMessage(user: User, text: string) {
            let message = new ChannelMessage()
            message.channel = this
            message.user    = user
            message.text    = text
            message.created = new Date().toLocaleString()
            return message.save()
        }
    }

    @model
    class ChannelMessage extends Model {
        @id     id          : number
        @field  created     : string
        @field  text        : string
        @field  channel_id  : number
        @field  user_id     : number
        @foreign('Channel') channel : Channel
        @foreign('User')    user    : User
    }

    let channelA = new Channel(); channelA.save()
    let channelB = new Channel(); channelB.save()
    let userA = new User({first_name: 'A', last_name: 'X'}); userA.save()
    let userB = new User({first_name: 'B', last_name: 'X'}); userB.save()

    it('Send messages to channelA', async ()=> {
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
