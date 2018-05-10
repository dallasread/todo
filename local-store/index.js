var Generator = require('generate-js'),
    localforage = require('localforage');

var LocalStore = Generator.generate(function LocalStore() {
    var _ = this;

    _.defineProperties({
		db: localforage.createInstance({
	        name: 'Clarity'
	    })
    });
});

LocalStore.definePrototype({
	get: function get(key, done) {
		var _ = this;

        _.db.getItem(key, done);
	},

	set: function set(key, value, done) {
		var _ = this;

        _.db.setItem(key, value, function(err, data) {
        	if (typeof done === 'function') {
	        	done(err, data);
        	}
        });
	},

	push: function push(key, value, done) {
	    var _ = this;

	    _.get(key, function(err, data) {
			data = data || [];
			data.push(value);

			_.set(key, data, done);
		});
	},
});

module.exports = LocalStore;
