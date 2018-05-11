var Generator = require('generate-js'),
    cookies = require('browser-cookies'),
    ajax = require('./ajax');

cookies.defaults.domain = window.location.hostname.split('.').slice(-2).join('.');

var RESTStore = Generator.generate(function RESTStore(options) {
    var _ = this;

    options = options || {};

    _.defineProperties({
        url: options.url || 'https://api.clarity.com'
    });

    _.defineProperties({
        writable: true
    }, {
        publishableKey: options.publishableKey,
        accessToken: undefined,
        cookiePrefix: options.cookiePrefix
    });

    _.accessToken = typeof options.accessToken !== 'undefined' ? options.accessToken : cookies.get(_.cookieName());
    _.segments = [
        { data: { name: 'Everyone' } },
        { data: { name: 'Online', filters: { '0': { key: 'online', matcher: '~', value: true } } } }
    ];
});

RESTStore.definePrototype({
    cookieName: function cookieName() {
        var _ = this;

        return (_.cookiePrefix ? _.cookiePrefix : '') + (_.publishableKey ? _.publishableKey : '') + '-access-token';
    },

    setUser: function setUser(user) {
        var _ = this;

        _.publishableKey = user.account.token;
        _.user = user;

        // if (!_.accessToken) {
            _.accessToken = btoa(user.api_token + ':' + user.secret_key);
            cookies.set(_.cookieName(), _.accessToken, { expires: 365 * 25 });
        // }
    },

    authenticate: function authenticate(done) {
        var _ = this;

        if (!_.accessToken) return done(new Error('No secret key supplied.'));

        _.get('/', {
            time_zone_offset: parseInt( new Date().toString().match(/([-\+][0-9]+)\s/)[1] ) / 100
        }, function(err, user) {
            if (err) return done(err);
            _.setUser(user);
            done(err, user);
        });
    },

    authWithPassword: function authWithPassword(user, done) {
        var _ = this;

        _.accessToken = btoa(user.email + ':' + user.password);

        _.get('/', {
            time_zone_offset: parseInt( new Date().toString().match(/([-\+][0-9]+)\s/)[1] ) / 100
        }, function(err, user) {
            if (err) return done(err);
            _.setUser(user);
            done(err, user);
        });
    },

    authOrCreate: function authOrCreate(data, done) {
        var _ = this;

        _.authenticate(function(err, user) {
            if (user) {
                return done(void(0), user);
            }

            _.register(data, done);
        });
    },

    register: function register(data, done) {
        var _ = this;

        _.post('/users', data, function(err, user) {
            if (err) {
                _.unauthenticate();
                return done(err);
            }

            _.setUser(user);
            done(err, user);
        });
    },

    unauthenticate: function unauthenticate() {
        var _ = this;

        cookies.erase(_.cookieName());
    },

    track: function track(action, event, cta, done) {
        if (typeof cta === 'function') {
            done = cta;
            cta = void(0);
        }

        event = typeof event === 'object' ? event : {};

        var _ = this;

        event.data = typeof event.data === 'object' ? event.data : {};
        event.data.action = action;

        event.context = typeof event.context === 'object' ? event.context : {};

        if (cta) {
            event.context.cta = { id: cta.get('cta.id') };
        }

        event.context.page = window.location.href;

        _.post('/events', {
            event: event
        }, done);

        return event;
    },
});

RESTStore.definePrototype({
    request: function request(method, path, data, done, async) {
        var _ = this,
            m = path.match(/([a-z]+)s/),
            dataModelType = m ? m[1] : 'user',
            args = {
                url: _.url + (_.publishableKey && dataModelType !== 'account' ? '/' + _.publishableKey : '') + path + (path.length > 1 ? '.json' : ''),
                method: method,
                data: data,
                async: async,
                beforeSend: function(xhr) {
                    if (!_.accessToken) return;
                    xhr.setRequestHeader('Authorization', 'Basic ' + _.accessToken);
                },
                success: function success(response) {
                    if (typeof done === 'function') {
                        done(null, response);
                    }
                },
                error: function error(err) {
                    if (typeof done === 'function') {
                        if (err) {
                            if (err.responseJSON) {
                                err = err.responseJSON;
                            } else if (err.response) {
                                try {
                                    err = JSON.parse(err.response);
                                } catch(e) {}
                            }

                            return done(err);
                        }
                    }
                }
            };

        if (method === 'get') {
            args.contentType = 'json';
        } else {
            args.dataType = 'json';
        }

        return ajax(args);
    },

    get: function get(path, data, done) {
        var _ = this;
        _.request('get', path, data, done);
    },

    post: function post(path, data, done) {
        var _ = this;
        _.request('post', path, data, done);
    },

    patch: function patch(path, data, done) {
        var _ = this;
        _.request('patch', path, data, done);
    },
});

module.exports = RESTStore;
