var CustomElement = require('generate-js-custom-element'),
    Todo = require('../todo'),
    Store = require('../store');

var App = CustomElement.createElement({
    template: require('./index.html'),
    transforms: {},
    components: {
        list: require('../list')
    }
}, function App(options) {
    var _ = this,
        store = new Store(_);

    options = options || {};
    options.data = options.data || {};
    options.data.app = _;
    options.data.defaultTodo = new Todo(_, { title: 'Clarity' });
    options.data.todo = options.data.defaultTodo;

    _.defineProperties({
        store: store
    });

    CustomElement.call(_, options);

    _.fetchTodos();
});

App.definePrototype({
    fetchTodos: function fetchTodos(done) {
        var _ = this;

        _.store.get('todos', function(err, todos) {
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
