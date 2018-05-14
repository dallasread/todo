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

        todos = todos || _.app.get('todos', void(0), []);

        _.saveToLocal(todos, function() {
            _.saveToRemote(todos, function(err) {
                if (err) {
                    return (done || EMPTY_FUNC)(err);
                }

                _.saveToLocal(todos, done);
            });
        });
    },

    saveToLocal: function saveToLocal(todos, done) {
        if (this.debug) console.debug('saveToLocal', arguments);

        var _ = this;

        _.localStore.set('todos', _.app.get('todos'), done);
    },

    saveToRemote: function saveToRemote(todos, done) {
        if (this.debug) console.debug('saveToRemote', arguments);

        var _ = this;

        todos = (todos || _.app.get('todos', void(0), [])).filter(CHANGED_TODOS);

        _.remoteStore.authenticate(function(err, data) {
            if (err) {
                if (_.debug) console.error(err);
                return (done || EMPTY_FUNC)(err);
            }

            async.eachSeries(todos, function(todo, next) {
                _._saveToRemoteSingle(todo, next);
            }, function() {
                (done || EMPTY_FUNC)(void(0), todos);
            });
        });
    },

    _saveToRemoteSingle: function _saveToRemoteSingle(todo, done) {
        if (this.debug) console.debug('_saveToRemoteSingle', arguments);

        var _ = this,
            isPersisted = todo.isPersisted(),
            oldId = !isPersisted ? _.id : void(0);

        _.remoteStore[isPersisted ? 'patch' : 'post']('/todos' + (isPersisted ? '/' + todo.id : ''), {
            todo: todo.toJSON()
        }, function(err, data) {
            if (err) {
                return done(err);
            }

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

            done(void(0), todo);
        });

        return _;
    }
});

API.definePrototype({
    restoreFromLocal: function restoreFromLocal(done) {
        if (this.debug) console.debug('restoreFromLocal', arguments);

        var _ = this;

        _.localStore.get('todos', function(err, todos) {
            if (todos) {
                for (var i = todos.length - 1; i >= 0; i--) {
                    todos[i] = new Todo(_.app, todos[i]);
                }
            }

            if (typeof done === 'function') {
                done(err, todos);
            }
        });
    },

    restoreFromRemote: function restoreFromRemote(done) {
        var _ = this;

        _.remoteStore.authenticate(function(err, data) {
            if (err) {
                if (_.debug) console.error(err);
                return (done || EMPTY_FUNC)(err);
            }

            _.remoteStore.get('/todos', void(0), function(err, todos) {
                if (todos) {
                    for (var i = todos.length - 1; i >= 0; i--) {
                        todos[i] = new Todo(_.app, todos[i]);
                    }
                }

                if (typeof done === 'function') {
                    done(err, todos);
                }
            });
        });
    },
});

module.exports = API;
