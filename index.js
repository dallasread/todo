var App = require('./app'),
    app = new App();

window.app = app;

document.body.appendChild(app.element);
