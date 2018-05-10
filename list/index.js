function clone(item) {
    return JSON.parse(JSON.stringify(item));
}

var CustomElement = require('generate-js-custom-element'),
    bala = require('balajs'),
    Sortable = require('sortablejs'),
    List = CustomElement.createElement({
    template: require('./index.html'),
    transforms: {
        add: function add(app, list, parent, unsetIsAdding) {
            return function doAdd(event) {
                event.preventDefault();

                if (list.get('newTodo.title') && list.get('newTodo.title').length) {
                    parent.addTodo( clone(list.get('newTodo')) );
                    list.set('newTodo.title', '');
                }

                if (unsetIsAdding) {
                    setTimeout(function() {
                        list.unset('isAdding');
                    }, 10);
                }
            };
        },

        findTodos: function findTodos(todo, todos) {
            if (!todos) return [];

            return todos.filter(function(t) {
                return t.todo_id === todo.id;
            });
        },

        addItem: function addItem(list) {
            return function doAddItem() {
                list.set('isAdding', true);
                bala('.list .new-item input', list.element)[0].focus();
            };
        },

        setTodo: function setTodo(app, todo, todos, id) {
            return function doSetTodo(event) {
                if (event.target.tagName === 'INPUT') return;

                app.set('back', todo.parent());
                app.set('todo', todo);
            };
        },

        deleteTodo: function deleteTodo(app, todo) {
            return function doDeleteTodo(event) {
                if (confirm('Are you sure you want to delete this todo?')) {
                    var todos = app.get('todos'),
                        index = todos.indexOf(todo);

                    todos.splice(index, 1);
                    todo.saveLocal();
                    app.update();
                }
            };
        },

        set: function set(updater, key, value, startObj) {
            return function doSet(event) {
                updater.set(key, value || event.target.value, startObj);
            };
        },

        setTodoInfo: function setTodoInfo(todo, key) {
            return function doSetTodoInfo(event) {
                todo[key] = event.target.value;
                todo.save();
            };
        },
    }
}, function List(options) {
    var _ = this;

    options.data = options.data || {};
    options.data.list = _;

    CustomElement.call(_, options);

    Sortable.create(bala('.todos', _.element)[0], {
        animation: 50
    });
});

List.definePrototype({
});

module.exports = List;
