var Generator = require('generate-js'),
    localforage = require('localforage');

var Store = Generator.generate(function Store() {
    var _ = this;

    _.defineProperties({
		db: localforage.createInstance({
	        name: 'Clarity'
	    })
    });
});

Store.definePrototype({
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

module.exports = Store;