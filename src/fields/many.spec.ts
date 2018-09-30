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
	})

})
