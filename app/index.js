var CustomElement = require('generate-js-custom-element'),
    cookies = require('browser-cookies'),
    Todo = require('../todo'),
    SELECTED_TODO = 'clarity-selected';

function findTodo(todos, id) {
    id = id + '';

    return todos.find(function(todo) {
        return todo.id + '' === id;
    });
}

var App = CustomElement.createElement({
    template: require('./index.html'),
    transforms: {},
    components: {
        list: require('../list'),
        settings: require('../settings')
    }
}, function App(options) {
    var _ = this;

    options = options || {};
    options.data = options.data || {};
    options.data.app = _;
    options.data.api = options.api;
    options.data.keychain = options.keychain;
    options.data.defaultTodo = new Todo(_, {
        id: null,
        title: 'Todo',
        cog: new Todo(_, {
            title: 'Settings',
            settings: true
        })
    });

    CustomElement.call(_, options);

    window.ononline = function onlineStatusChange() {
        _.syncAPI();
    };

    _.get('api').restoreFromLocal(function(err, todos) {
        var todo = findTodo(todos || [], cookies.get(SELECTED_TODO));

        _.set('todo', todo || options.data.defaultTodo);
        _.set('todos', todos || []);
        _.syncAPI();
    });

    _.on('update', function(key, value) {
        if (key === 'todo') {
            if (value && value.id) {
                cookies.set(SELECTED_TODO, value.id.toString(), { expires: 365 });
            } else {
                cookies.erase(SELECTED_TODO);
            }
        }
    });

    setInterval(function() {
        _.syncAPI();
    }, 60000);
});

App.definePrototype({
    syncAPI: function syncAPI() {
        var _ = this,
            api = _.get('api');

        api.saveToRemote(void(0), function() {
            api.restoreFromRemote(function(err, todos) {
                _.set('todos', todos || []);
                api.saveToLocal(todos || []);
            });
        });
    },

    encryptTodo: function encryptTodo(todo) {
        var _ = this,
            keychain = _.get('keychain'),
            api = _.get('api'),
            todos = todo.descendants().concat([todo]);

        todo.has_password = true;

        for (var i = todos.length - 1; i >= 0; i--) {
            todos[i].title = keychain.encrypt(todos[i].title, todo._key);
        }

        todo._key = void(0);

        api.save(todos);

        keychain.set(todo.id, {
            expires: new Date(),
            key: todo._key
        });

        _.update();
    },
});

module.exports = App;
