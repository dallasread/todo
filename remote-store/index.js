var RESTAPI = require('../rest-api');

var RemoteStore = RESTAPI.generate(function RemoteStore(options) {
    var _ = this;

    RESTAPI.call(_, options);
});

RemoteStore.definePrototype(require('./auth'));
RemoteStore.definePrototype(require('./purchase'));

module.exports = RemoteStore;
