var Generator = require('generate-js');

var Todo = Generator.generate(function Todo(app, data) {
    var _ = this;

    _.defineProperties({
        app: app
    });

    _.defineProperties({
        writable: true,
        enumerable: true
    }, data);

    _.defineProperties({
        writable: true
    }, {
        persistedJSON: _.toJSON()
    });
});

Todo.definePrototype({
    isPersisted: function isPersisted() {
        var _ = this;
        return !(typeof _.id === 'string' && /_|\./.test(_.id));
    },

    isChanged: function isChanged() {
        var _ = this;
        return JSON.stringify(_.toJSON()) !== JSON.stringify(_.persistedJSON);
    },

    addTodo: function addTodo(data) {
        data.todo_id = this.id;
        data.id = '_' + (Date.now() + Math.random());

        var _ = this,
            todo = new Todo(_.app, data);

        _.app.push('todos', todo);

        todo.save();

        return todo;
    },

    saveLocal: function saveLocal() {
        var _ = this;

        _.app.get('localStore').set('todos', _.app.get('todos'));

        return _;
    },

    saveRemote: function saveRemote(done) {
        var _ = this;

        if (!_.app.get('api').user) {
            done();
            return _;
        }

        _.app.get('api')[_.isPersisted() ? 'patch' : 'post']({
            todo: _.toJSON()
        }, done);

        return _;
    },

    save: function save() {
        var _ = this,
            oldId = !_.isPersisted() ? _.id : void(0);

        _.saveLocal();

        _.saveRemote(function(err, data) {
            for (var key in data) {
                _[key] = data[key];
            }

            if (oldId) {
                _.app.get('todos').forEach(function(t) {
                    if (t.todo_id === oldId) {
                        t.todo_id = _.id;
                    }
                });
            }

            _.saveLocal();
            _.persistedJSON = _.toJSON();
        });

        return _;
    },

    parent: function parent() {
        var _ = this,
            todos = _.app.get('todos');

        if (!_.id) {
            return;
        }

        return todos.filter(function(t) {
            return t.id === _.todo_id;
        })[0] || _.app.get('defaultTodo');
    },

    toJSON: function toJSON() {
        var _ = this,
            obj = {};

        for (var key in _) {
            obj[key] = _[key];
        }

        return obj;
    },
});

module.exports = Todo;
