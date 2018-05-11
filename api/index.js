function EMPTY_FUNC() {}

function CHANGED_TODOS(todo) {
    return !todo.isPersisted() || todo.isChanged();
}

var Generator = require('generate-js'),
    Todo = require('../todo'),
    async = require('no-async');

var API = Generator.generate(function API(options) {
    var _ = this;

    options = options || {};
    options.debug = true;

    _.defineProperties(options);
});

API.definePrototype({
    save: function save(todos, done) {
        if (this.debug) console.debug('save', arguments);

        var _ = this;

        todos = todos || app.get('todos', void(0), []);

        _.saveLocal(todos, function() {
            _.saveRemote(todos, function(err) {
                if (err) {
                    return (done || EMPTY_FUNC)(err);
                }

                _.saveLocal(todos, done);
            });
        });
    },

    saveLocal: function saveLocal(todos, done) {
        if (this.debug) console.debug('saveLocal', arguments);

        var _ = this;

        _.localStore.set('todos', _.app.get('todos'), done);
    },

    saveRemote: function saveRemote(todos, done) {
        if (this.debug) console.debug('saveRemote', arguments);

        var _ = this;

        todos = (todos || app.get('todos', void(0), [])).filter(CHANGED_TODOS);

        _.remoteStore.authenticate(function(err, data) {
            if (err) {
                if (_.debug) console.error(err);
                return;
            }

            async.eachSeries(todos, function(todo, next) {
                _._saveRemoteSingle(todo, next);
            }, done || EMPTY_FUNC);
        });
    },

    _saveRemoteSingle: function _saveRemoteSingle(todo, done) {
        if (this.debug) console.debug('_saveRemoteSingle', arguments);

        var _ = this,
            isPersisted = todo.isPersisted(),
            oldId = !isPersisted ? _.id : void(0);

        _.remoteStore[isPersisted ? 'patch' : 'post']({
            todo: _.toJSON()
        }, function(err, data) {
            for (var key in data) {
                todo[key] = data[key];
            }

            if (oldId) {
                _.app.get('todos').forEach(function(t) {
                    if (t.todo_id === oldId) {
                        t.todo_id = todo.id;
                    }
                });
            }

            _.persistedJSON = todo.toJSON();
        });

        return _;
    }
});

API.definePrototype({
    restoreLocal: function restoreLocal(done) {
        if (this.debug) console.debug('restoreLocal', arguments);

        var _ = this;

        _.localStore.get('todos', function(err, todos) {
            if (todos) {
                for (var i = todos.length - 1; i >= 0; i--) {
                    todos[i] = new Todo(_.app, todos[i]);
                }
            }

            _.app.set('todos', todos || []);

            if (typeof done === 'function') {
                done(err, todos);
            }
        });
    }
});

module.exports = API;
