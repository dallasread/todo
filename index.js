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
    keychain = new EncryptedStore({
        cookieName: 'clarity-keychain-salt',
        store: new LocalStore({
            name: 'Clarity-Keychain'
        })
    }),
    api = new API({
        localStore: localStore,
        remoteStore: restStore
    }),
    app = new App({
        api: api,
        keychain: keychain
    });

api.app = app;

window.app = app;
window.keychain = keychain;

document.body.appendChild(app.element);
