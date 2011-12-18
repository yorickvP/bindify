/* ----------------------------------------------------------------------------
Copyright (c) YorickvP (contact me on github if you want)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
* ---------------------------------------------------------------------------*/
// so I can do that for (var i; ) loop below without the risk of polluting the scope
// with my useless i variable
var bindify = (function() {

// this function will be exported
function bindify(f /* , thisObj, *args */) {
    // see if f is a function. if it's not, it may be a shorthand for bindify._x
    if (typeof f !== 'function') {
        if (('_' + f) in bindify) return bindify['_' + f]
        else if (typeof f == 'number') return bindify.addArgGetter(f)
        else throw new TypeError('tried to bind a non-function') }

    var aArgs = [].slice.call(arguments, 1)
    // find out which arguments need to be executed and store their keys
      , eArgs = aArgs.map(bindify.has.bind(bindify)).reduce(function(p, c, i){
            if (c) p.push(i)
            return p }, [])
      , fNop = function() {}
      , fBound = function() {
        var fArgs = arguments
          , fThis = this
        // assume eArgs is sorted, it should be unless .map is implemented in a strange way
        // keep an index for eArgs, and check where the next key is supposed to be
        // if it matches, perform the replacement and move on to the next key
          , eArgsi = 0
          , bArgsi = 0
          , bArgs = (eArgs.length == 0) ? aArgs.slice() : 
                new Array(eArgs.reduce(function(p, c) {
                    return p + aArgs[c](fArgs, fThis, null, -1) }, 0))
        if (eArgs.length != 0)
            aArgs.forEach(function(n, aArgsi) {
                if (eArgs[eArgsi] == aArgsi) {
                    ++eArgsi
                    bArgsi += n(fArgs, fThis, bArgs, bArgsi) }
                else bArgs[bArgsi++] = n })
        // if we're being called like new fBound
        if (this instanceof fNop) bArgs[0] = this
        // .call.apply is faster than doing it using apply(bArgs[0], bArgs.slice(1))
        return Function.prototype.call.apply(f, bArgs) }

    // make sure new x works, no Object.create because instanceof
    fNop.prototype = f.prototype || {}
    fBound.prototype = new fNop
    return fBound }

;(function(a) { for (var k in a) bindify[k] = a[k] })({
    special_funcs: []
  , has: function(f) {
        return this.special_funcs.indexOf(f) != -1 || (f && f._is_bindify_special_func) }
  , add: function(f) {
        this.special_funcs.push(f)
        return this }
  , remove: function(f) {
        this.special_funcs.splice(this.special_funcs.indexOf(f), 1) 
        return this }
  , addArgGetter: function(i) {
        function ArgGet(args, thisobj, arr, arridx) {
            if (arridx != -1) arr[arridx] = args[i]
            return 1 }
        this.add(ArgGet)
        return this['_' + i] = ArgGet }})

// this is the reason for the entire IIFE. for loops that can't keep their scope
// with({i: 0}) for (; i < 10; i++) bindify.addArgGetter(i)
// yes, I think the IIFE is worth it.
for(var i = 0; i < 10; i++) bindify.addArgGetter(i)

// want more than 10? bindify.addArgGetter(n)
bindify.add(bindify._args = function(args, thisobj, arr, arridx) {
    if (arridx != -1) arr[arridx] = [].slice.call(args)
    return 1 })
bindify.add(bindify._this = function(args, thisobj, arr, arridx) {
    if (arridx != -1) arr[arridx] = thisobj
    return 1 })

// much like python f(1, 2, *a.slice(begin, end), more)
bindify._argslice = function(begin, end) {
    function ArgSlice(args, thisobj, arr, arridx) {
        if (arridx == -1) // try to find the slice length without actually calling it
            return Math.min(args.length, end == undefined ? args.length : end < 0 ? args.length + end : end) -
                   Math.max(0, begin < 0 ? args.length + begin : begin)
        var sliced = [].slice.call(args, begin, end)
        sliced.forEach(function(s) {
            arr[arridx++] = s })
        return sliced.length }
    ArgSlice._is_bindify_special_func = true
    return ArgSlice }

// in case anyone would want to pass bindify._2 or something
bindify._wrap = function(n) {
    function Kn(args, thisobj, arr, arridx) {
        if (arridx != -1) arr[arridx] = n
        return 1 }
    Kn._is_bindify_special_func = true
    return Kn }

return bindify })()

// can we be a commonjs module?
if (module && module.exports) module.exports = bindify
