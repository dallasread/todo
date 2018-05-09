var Generator = require('generate-js');

var Todo = Generator.generate(function Todo(app, data) {
    var _ = this;

    _.defineProperties({
        enumerable: false
    }, {
        app: app
    });

    _.defineProperties({
        writable: true,
        enumerable: true
    }, data);
});

Todo.definePrototype({
    addTodo: function addTodo(data) {
        data.todo_id = this.id;
        data.id = Math.random();

        var _ = this,
            todo = new Todo(_.app, data);

        _.app.push('todos', todo);
        
        todo.save();
        
        return todo;
    },

    save: function save() {
        var _ = this;

        _.app.store.set('todos', _.app.get('todos'));

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