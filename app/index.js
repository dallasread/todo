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
    options.data.localStore = options.localStore;
    options.data.api = options.api;
    options.data.defaultTodo = new Todo(_, { title: 'Clarity' });
    options.data.todo = options.data.defaultTodo;

    CustomElement.call(_, options);

    _.fetchLocalTodos(function() {
        _.get('api').sync(true);
    });
});

App.definePrototype({
    fetchLocalTodos: function fetchLocalTodos(done) {
        var _ = this;

        _.get('localStore').get('todos', function(err, todos) {
            if (todos) {
                for (var i = todos.length - 1; i >= 0; i--) {
                    todos[i] = new Todo(_, todos[i]);
                }
            }

            _.set('todos', todos);

            if (typeof done === 'function') {
                done(err, todos);
            }
        });
    }
});

module.exports = App;
