import Vue from 'vue'
import store 	from './store'

import './tests/chat'


new Vue({
	el: '#app',
	data: function () {
		return {
			//user:  user,
		};
	},
	methods: {
		test: function () {
			// let t = new Transaction('first name');
			// this.user.first_name = this.user.first_name + 'test';
			// t.commit();
		},
		storePrint: function () {
			console.log(store)
		}
	}
})
