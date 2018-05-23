var App = require('./app'),
    API = require('./api'),
    EncryptedStore = require('./encrypted-store'),
    LocalStore = require('./local-store'),
    RemoteStore = require('./remote-store'),
    localStore = new LocalStore({
        name: 'Clarity'
    }),
    restStore = new RemoteStore({
        url: 'https://clearmind.herokuapp.com' || 'http://localhost:3000'
    }),
    keyChain = new EncryptedStore({
        cookieName: 'clarity-keychain-salt',
        store: new LocalStore({
            name: 'Clarity-KeyChain'
        })
    }),
    api = new API({
        localStore: localStore,
        remoteStore: restStore
    }),
    app = new App({
        api: api,
        keyChain: keyChain
    });

api.app = app;

window.app = app;
window.keyChain = keyChain;

document.body.appendChild(app.element);
