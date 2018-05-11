var CustomElement = require('generate-js-custom-element'),
    Todo = require('../todo');

var App = CustomElement.createElement({
    template: require('./index.html'),
    transforms: {},
    components: {
        list: require('../list')
    }
}, function App(options) {
    var _ = this;

    options = options || {};
    options.data = options.data || {};
    options.data.app = _;
    options.data.api = options.api;
    options.data.defaultTodo = new Todo(_, { title: 'Clarity' });
    options.data.todo = options.data.defaultTodo;

    CustomElement.call(_, options);

    _.get('api').restoreLocal(function() {
        _.get('api').saveRemote();
    });
});

App.definePrototype({
});

module.exports = App;
