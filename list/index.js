function clone(item) {
    return JSON.parse(JSON.stringify(item));
}

function SORT_TODOS(a, b) {
    var aP = a.pin !== null ? a.pin : a.priority,
        bP = b.pin !== null ? b.pin : b.priority;

    if (aP > bP) {
        return 1;
    }

    if (bP > aP) {
        return -1;
    }

    return a.id > b.id ? 1 : -1;
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
                    var todo = parent.addChild( clone(list.get('newTodo')) );

                    todo.priority = 9999999;
                    todo.pin = null;
                    todo.save();

                    list.set('newTodo.title', '');
                }

                if (unsetIsAdding) {
                    setTimeout(function() {
                        list.unset('isAdding');
                    }, 10);
                }
            };
        },

        isUnlocked: function isUnlocked() {
            return false;
        },

        askForKey: function askForKey() {
        },

        setKey: function setKey(app, todo) {
            return function doSetKey(event) {
                event.preventDefault();
                app.encryptTodo(todo);
            };
        },

        forgetKey: function forgetKey(updater, keychain, todo, Key) {
        },

        findParent: function findParent(todo, defaultTodo) {
            if (!todo) return defaultTodo;
            return todo.parent();
        },

        findTodos: function findTodos(todo, todos) {
            if (!todos || !todo) return [];

            return todos.filter(function(t) {
                return !t._deleted && (
                    t.todo_id === todo.id ||
                    (
                        !todo.id &&
                        t.pin !== null
                    )
                );
            }).sort(SORT_TODOS);
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
                todo._isSettingKey = false;
                app.set('todo', todo);
            };
        },

        deleteTodo: function deleteTodo(app, todo) {
            return function doDeleteTodo(event) {
                if (confirm('Are you sure you want to delete this todo?')) {
                    todo.destroy();
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

        toggleTodo: function toggleTodo(updater, todo, attr) {
            return function doToggleTodoInfo() {
                updater.set(attr, !updater.get(attr, todo), todo);
            };
        },

        togglePin: function togglePin(app, todo) {
            return function doTogglePin(event) {
                if (todo.pin === null) {
                    todo.pin = 0;
                } else {
                    todo.pin = null;
                }

                todo.save();
                app.update();
            };
        },

        hasPin: function hasPin(value) {
            return value !== null;
        },
    }
}, function List(options) {
    var _ = this;

    options.data = options.data || {};
    options.data.list = _;

    CustomElement.call(_, options);

    _.createSortable();
});

List.definePrototype({
    createSortable: function createSortable() {
        var _ = this,
            sortable = Sortable.create(bala('.todos', _.element)[0], {
            animation: 150,
            delay: 80,
            onEnd: function onEnd() {
                var ids = sortable.toArray(),
                    todos = [],
                    todo, id;

                for (var i = 0; i < ids.length; i++) {
                    id = ids[i] + '';
                    todo = _.get('app').get('todos').find(function(t) {
                        return t.id + '' === id;
                    });

                    todos.push(todo);

                    if (todo) {
                        if (todo.pin === null) {
                            todo.priority = i;
                        } else {
                            todo.pin = i;
                        }
                    }
                }

                _.get('app').get('api').save(todos);
            }
        });
    },
});

module.exports = List;
