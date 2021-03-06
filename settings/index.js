var CustomElement = require('generate-js-custom-element');

var Settings = CustomElement.createElement({
    template: require('./index.html'),
    transforms: {
        setTodo: function setTodo(app, todo, todos, id) {
            return function doSetTodo(event) {
                if (event.target.tagName === 'INPUT') return;
                app.set('todo', todo);
            };
        },

        set: function set(updater, key, value, startObj) {
            return function doSet(event) {
                updater.set(key, value || event.target.value, startObj);
            };
        },

        resetKeyChain: function resetKeychain(updater, keychain) {
            return function doResetKeychain() {
                if (confirm('This will forget the password on each password-protected list. Are you sure you want to proceed?')) {
                    keychain.reset();
                    updater.update();
                }
            };
        },
    }
}, function Settings(options) {
    var _ = this;

    options.data = options.data || {};
    options.data.settings = _;

    CustomElement.call(_, options);
});

Settings.definePrototype({
});

module.exports = Settings;
