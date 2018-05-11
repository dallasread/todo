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

    window.ononline = function onlineStatusChange() {
        _.syncAPI();
    }

    _.get('api').restoreFromLocal(function(err, todos) {
        _.set('todos', todos || []);
        _.syncAPI();
    });
});

App.definePrototype({
    syncAPI: function syncAPI() {
        var _ = this,
            api = _.get('api');

        api.saveToRemote(void(0), function() {
            api.restoreFromRemote(function(err, todos) {
                todos = todos || [];
                _.set('todos', todos);
                api.saveToLocal(todos);
            });
        });
    },
});

module.exports = App;
