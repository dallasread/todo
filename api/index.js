function EMPTY_FUNC() {}

var Generator = require('generate-js'),
    async = require('no-async');

var API = Generator.generate(function API(options) {
    var _ = this;

    _.defineProperties(options);
});

API.definePrototype({
    sync: function sync(done) {
        var _ = this;

        async.eachSeries(_.app.get('todos'), function(todo, next) {
            if (!todo.isPersisted() || todo.isChanged()) {
                todo.saveRemote(next);
            }
        }, done || EMPTY_FUNC);
    },
});

module.exports = API;
