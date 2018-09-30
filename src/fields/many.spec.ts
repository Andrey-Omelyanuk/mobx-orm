import store 	from '../store'
import Model  from '../model'
import id			 	from './id'
import field	  from './field'
import foreign  from './foreign'
import many     from './many'


describe('Many', () => {
	store.clear()

	class User extends Model {
		@id    id   : number
		@field name : string
		@many('Book', 'author_id') books: Book[]
	}

	class Book extends Model {
		@id    id    : number
		@field title : string
		@field 						author_id : number
		@foreign('User') 	author 		: User
	}

	it('...', async ()=> {
		let user = new User({name: 'test user'}); await user.save()
		let book_a = new Book({title: 'A', author_id: user.id}); await book_a.save()
		let book_b = new Book({title: 'B', author_id: user.id}); await book_b.save()
		let book_c = new Book({title: 'C', author_id: user.id}); await book_c.save()
		let book_x = new Book({title: 'X'}); await book_x.save()
		expect(user.books.length).toBe(3)
		expect(user.books.indexOf(book_a)).not.toBe(-1)
		expect(user.books.indexOf(book_b)).not.toBe(-1)
		expect(user.books.indexOf(book_c)).not.toBe(-1)

		await book_a.delete()
		expect(user.books.length).toBe(2)
		expect(user.books.indexOf(book_a)).toBe(-1)
		expect(user.books.indexOf(book_b)).not.toBe(-1)
		expect(user.books.indexOf(book_c)).not.toBe(-1)
	})

})
