var CustomElement = require('generate-js-custom-element'),
    localforage = require('localforage');

var App = CustomElement.createElement({
    template: require('./index.html'),
    transforms: {
        findTodo: function findTodo(todos) {
            if (!todos || !todos.length) return { title: 'My Todos' };
            return todos[0];
        },
    },
    components: {
        list: require('../list')
    }
}, function App(options) {
    var _ = this;

    options = options || {};
    options.data = options.data || {};
    options.data.app = _;

    _.defineProperties({
        store: localforage.createInstance({
            name: 'Clarity'
        })
    });

    CustomElement.call(_, options);

    _.fetchTodos();
});

App.definePrototype({
    fetchTodos: function fetchTodos(done) {
        var _ = this;

        _.store.getItem('todos', function(err, todos) {
            _.set('todos', todos);

            if (typeof done === 'function') {
                done(err, todos);
            }
        });
    },

    saveTodos: function saveTodos(todos) {
        var _ = this;
        _.store.setItem('todos', _.get('todos'));
    },
});

module.exports = App;
