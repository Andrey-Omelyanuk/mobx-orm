import { observable, computed } from 'mobx'


describe('Mobx Experiments.', async () => {



	it('...', async ()=> {

		class A {
			@observable a1: string = ''
			@observable a2: string = ''

			@computed get a(): string { return this.a1 + this.a2 }
		}

		class B {
			@observable b1: string = ''
			@observable b2: string = ''

			@computed get b(): string { return this.b1 + this.b2 }
		}

		let A1 = new A(); A1.a1 = 'a'
		let A2 = new A(); A2.a1 = 'a'; A2.a2 = 'aa'

		expect(A1.a).toBe('a')
		expect(A2.a).toBe('aaa')

	})
})
