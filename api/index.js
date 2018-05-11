function EMPTY_FUNC() {}

function CHANGED_TODOS(todo) {
    return !todo.isPersisted() || todo.isChanged();
}

var Generator = require('generate-js'),
    Todo = require('../todo'),
    async = require('no-async');

var API = Generator.generate(function API(options) {
    var _ = this;

    _.defineProperties(options);
});

API.definePrototype({
    login: function login(user, done) {
        var _ = this;

        if (typeof user === 'function') {
            user = void(0);
            done = user;
        }

        if (_.user) {
            done(void(0), _.user);
        } else if (_.failed) {
            done(new Error('You are not logged in.'));
        } else if (HASCOOKIE) {

        } else if (user) {
            _.post('/users', { user: user }, function(err, data) {
                if (err) {
                    _.failed = true;
                    return done(new Error('Unable to login.'));
                }

                _.user = data;
                done(void(0), _.user);
            });
        }
    },
});

API.definePrototype({
    save: function save(todos, done) {
        var _ = this;

        todos = todos || _.app.get('todos');

        _.saveLocal(todos, function() {
            _.saveRemote(todos, function() {
                _.saveLocal(todos, done);
            });
        });
    },

    saveLocal: function saveLocal(todos, done) {
        var _ = this;

        _.localStore.set('todos', _.app.get('todos'), done);
    },

    saveRemote: function saveRemote(todos, done) {
        var _ = this;

        todos = (todos || _.app.get('todos')).filter(CHANGED_TODOS);

        _.login(function(err, data) {
            if (err) {
                console.error(err);
                return;
            }

            async.eachSeries(todos, function(todo, next) {
                _.saveTodo(todo, next);
            }, done || EMPTY_FUNC);
        });
    }
});

API.definePrototype({
    saveTodo: function saveTodo(todo, done) {
        var _ = this,
            isPersisted = todo.isPersisted(),
            oldId = !isPersisted ? _.id : void(0);

        if (!_.user) {
            done();
            return _;
        }

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

            _.saveLocal();
            _.persistedJSON = todo.toJSON();
        });

        return _;
    }
});

API.definePrototype({
    restoreLocal: function restoreLocal(done) {
        var _ = this;

        _.localStore.get('todos', function(err, todos) {
            if (todos) {
                for (var i = todos.length - 1; i >= 0; i--) {
                    todos[i] = new Todo(_.app, todos[i]);
                }
            }

            _.app.set('todos', todos);

            if (typeof done === 'function') {
                done(err, todos);
            }
        });
    }
});

module.exports = API;
