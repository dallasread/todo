var Generator = require('generate-js');

var KeyChain = Generator.generate(function KeyChain(options) {
    var _ = this;

    _.defineProperties({
        base: options.base,
        keys: options.keys
    });
});

KeyChain.definePrototype({
});

module.exports = KeyChain;
