var App = require('./app'),
    API = require('./api'),
    LocalStore = require('./local-store'),
    localStore = new LocalStore(),
    api = new API({
        localStore: localStore
    }),
    app = new App({
        api: api,
        localStore: localStore
    });

api.app = app;

window.app = app;

document.body.appendChild(app.element);
