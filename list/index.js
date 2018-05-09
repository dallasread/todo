function clone(item) {
    return JSON.parse(JSON.stringify(item));
}

var CustomElement = require('generate-js-custom-element'),
    Todo = require('../todo'),
    bala = require('balajs'),
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

});

List.definePrototype({
});

module.exports = List;
