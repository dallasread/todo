var CustomElement = require('generate-js-custom-element');

function clone(item) {
    return JSON.parse(JSON.stringify(item));
}

var bala = require('balajs'),
    List = CustomElement.createElement({
    template: require('./index.html'),
    transforms: {
        add: function add(list, unsetIsAdding) {
            return function doAdd(event) {
                event.preventDefault();

                if (list.get('newTodo.title') && list.get('newTodo.title').length) {
                    list.push('items', clone(list.get('newTodo')));
                    list.set('newTodo.title', '');
                }

                if (unsetIsAdding) {
                    setTimeout(function() {
                        list.unset('isAdding');
                    }, 10);
                }
            };
        },

        addItem: function addItem(list) {
            return function doAddItem() {
                list.set('isAdding', true);
                bala('.list .new-item input', list.element)[0].focus();
            };
        },

        goToList: function goToList(original, list) {
            return function doGoToList(event) {
                if (event.target.tagName === 'INPUT') return;
                if (original) list.back = original;
                document.body.innerHTML = '';
                document.body.appendChild(new List({ data: list }).element);
            };
        },

        set: function set(list, key, value, startObj) {
            return function doSet(event) {
                list.set(key, value || event.target.value, startObj);
            };
        },
    }
}, function List(options) {
    var _ = this;

    options.data = options.data || {};
    options.data.list = _;
    options.data.items = options.data.items || [];

    CustomElement.call(_, options);

});

List.definePrototype({
});

module.exports = List;
