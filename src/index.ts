
import './tests/filter'


var arrayChangeHandler = {
	get: function(target, property) {
		console.log('getting ' + property + ' for ' + target)
		// property is index in this case
		return target[property]
	},
	set: function(target, property, value, receiver) {
		console.log('setting ' + property + ' for ' + target + ' with value ' + value)
		target[property] = value
		// you have to return true to accept the changes
		return true
	}
};

var originalArray = []
var proxyToArray = new Proxy( originalArray, arrayChangeHandler )

proxyToArray.push('test')
proxyToArray.push('test2')
proxyToArray.push('test3')
console.log('-----------------------')
proxyToArray.splice(1,2)
console.log(proxyToArray)


