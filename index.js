var App = require('./app'),
    API = require('./api'),
    LocalStore = require('./local-store'),
    RESTStore = require('./rest-store'),
    localStore = new LocalStore(),
    restStore = new RESTStore(),
    api = new API({
        localStore: localStore,
        remoteStore: restStore
    }),
    app = new App({
        api: api
    });

api.app = app;

window.app = app;

document.body.appendChild(app.element);
