var Generator = require('generate-js'),
    INVALID_ID = /_|\./;

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
        return !(typeof _.id === 'string' && INVALID_ID.test(_.id));
    },

    isChanged: function isChanged() {
        var _ = this;
        return JSON.stringify(_.toJSON()) !== JSON.stringify(_.persistedJSON);
    },

    addChild: function addChild(data) {
        data.todo_id = this.id;
        data.id = '_' + (Date.now() + Math.random());

        var _ = this,
            todo = new Todo(_.app, data);

        _.app.push('todos', todo);

        return todo;
    },

    save: function save() {
        var _ = this;
        _.app.get('api').save([_]);
        return _;
    },

    parent: function parent() {
        var _ = this,
            todos = _.app.get('todos');

        if (!_.id) {
            return;
        }

        return todos.find(function(t) {
            return t.id === _.todo_id;
        }) || _.app.get('defaultTodo');
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
