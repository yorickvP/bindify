[![build status](https://secure.travis-ci.org/yorickvP/bindify.png)](http://travis-ci.org/yorickvP/bindify)
Bindify
=======

[boost::bind](www.boost.org/doc/libs/release/libs/bind/)-like binding for your javascript functions!

	var b_fy = require('bindify')
	function f(a, b) {
		return a + b
	}
	function g(a, b, c) {
		return a + b + c
	}

	// it works like regular bind, but doesn't pass
	// the arguments you call the resulting function with
	b_fy(f, null, 1, 2)(3); // f.call(null, 1, 2)

	// but you can specify placeholder arguments!
	b_fy(g, null, 3, b_fy(0), 5)(4); // g.call(null, 3, 4, 5)

	function h(a, b, c) {
		return this.q + a + b + c
	}

	// it has a thisobj param too
	b_fy(h, {q: 1}, 2, 3, 4)(); // h.call({q: 1}, 2, 3, 4)
	// and you can put placeholders in it!
	b_fy(h, b_fy(0), 2, 3, 4)({q: 1}); // h.call({q: 1}, 2, 3, 4)

	// but wait, there's more:
	function i(a, b, c) {
		return a.x + b.x + c.x
	}
	b_fy(i, {q: 1}, b_fy('this'), b_fy(0), b_fy('this')).call({x: 2}, {x: 4})
		// i.call({q: 1}, {x: 2}, {x: 4}, {x: 2})
	
	// you get ._args too! it's like [].slice.call(arguments)
	b_fy(function(a) { return a }, null, b_fy('args'))(1, 2, 3); // .call(null, [1,2,3])

	// _argslice! call it like Array.prototype.slice and it will slice your arguments
	// and apply them!
	b_fy(function(a, b, c) { return this(a + b + c)}, b_fy(0), b_fy('argslice')(1))(console.log, 2, 3, 4)
		// .call(console.log, 2, 3, 4)
	
	// and an actual use-case
	Function.prototype.b_fy = b_fy(b_fy, null, b_fy('this'), b_fy('argslice')())

	function step () {
		return [].reduceRight.call(arguments, function (f,g) {
			return g.bind(f) }) }
	// equals			
	var step = b_fy([].reduceRight, b_fy('args'), b_fy(Function.prototype.bind, b_fy(1), b_fy(0)))

	// wrap stuff, in case you want to pass b_fy(0)
	b_fy(function(){}, b_fy._wrap(b_fy(0)))
