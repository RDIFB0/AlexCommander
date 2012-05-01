/**
 * Created with JetBrains WebStorm.
 * User: RDIFB0
 * Date: 30.04.12
 * Time: 22:23
 * To change this template use File | Settings | File Templates.
 */

var Tools = {

	/**
	 * Generate unique id like in php
	 */
	uniqid: function(prefix) {
		prefix = prefix === undefined ? new String() : prefix;
		var n = Math.floor(Math.random() * 11);
		var k = Math.floor(Math.random() * 1000000);
		return prefix + String.fromCharCode(n) + k;
	},

	chr: function(num) {
		return String.fromCharCode(num);
	},

	asc: function(str) {
		return String.charCodeAt(0);
	}

};
