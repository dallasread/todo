function UNAUTH() { return new Error('Could not authenticate.'); }

var cookies = require('browser-cookies'),
    COOKIE_NAME = 'clarity-access-token';

cookies.defaults.domain = window.location.hostname.split('.').slice(-2).join('.');

module.exports = {
    authenticate: function authenticate(user, done) {
        if (this.debug) console.debug('authenticate', arguments);

        var _ = this;

        if (typeof user === 'function') {
            done = user;
            user = void(0);
        }

        if (_.user) {
            done(void(0), _.user);
        } else if (_.failed) {
            done(UNAUTH());
        } else {
            var method = 'post',
                path, arg;

            if (cookies.get(COOKIE_NAME)) {
                path = '/';
                arg = { cookie: cookies.get(COOKIE_NAME) };
            } else if (user) {
                path = '/users';
                arg = { user: user };
            } else {
                path = '/users';
                arg = { random: true };
            }

            _[method](path, arg, function(err, data) {
                if (err) {
                    _.unSetUser();
                    return done(UNAUTH());
                }

                _.setUser(data, done);
            });
        }
    },

    setUser: function setUser(user, done) {
        if (this.debug) console.debug('setUser', arguments);

        var _ = this;
        _.user = user;
        cookies.set(COOKIE_NAME)
        done(void(0), _.user);
    },

    unSetUser: function unSetUser() {
        if (this.debug) console.debug('unSetUser', arguments);

        var _ = this;

        _.failed = true;
        cookies.erase(COOKIE_NAME);
    },
};
