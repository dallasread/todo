var App = require('./app'),
    API = require('./api'),
    KeyChain = require('./key-chain'),
    LocalStore = require('./local-store'),
    RemoteStore = require('./remote-store'),
    localStore = new LocalStore(),
    restStore = new RemoteStore({
        url: 'https://clearmind.herokuapp.com' || 'http://localhost:3000'
    }),
    api = new API({
        localStore: localStore,
        remoteStore: restStore
    }),
    app = new App({
        api: api,
        keyChain: new KeyChain({
            base: 'localSTORE.keychain.base',
            keys: 'localSTORE.keychain.keys',
        })
    });

api.app = app;

window.app = app;
window.CryptoJS = require('crypto-js');

document.body.appendChild(app.element);
