var Generator = require('generate-js');

var RESTAPI = Generator.generate(function RESTAPI(options) {
    var _ = this;

    _.defineProperties({
        writable: true
    }, options || {});
});

RESTAPI.definePrototype({
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

RESTAPI.definePrototype({
    request: function request(method, path, data, done, async) {
        var _ = this,
            args = {
                url: (_.url || '') + path + (path.length > 1 ? '.json' : ''),
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
                            } else if (typeof err.response !== 'undefined') {
                                try {
                                    err = JSON.parse(err.response);
                                } catch(e) {
                                    err = err.response;
                                }
                            }

                            return done(err || new Error('Invalid response format.'));
                        }
                    }
                }
            };

        if (method === 'get') {
            args.contentType = 'json';
        } else {
            args.dataType = 'json';
        }

        return _.ajax(args);
    }
});

RESTAPI.definePrototype({
    ajax: function ajax(settings) {
        var method = settings.method.toUpperCase(),
            xhr = new XMLHttpRequest(),
            data = settings.data;

        if (method === 'GET' && typeof data === 'object') {
            settings.url += '?';

            for (var key in settings.data) {
                settings.url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(settings.data[key]);
            }
        } else {
            data = JSON.stringify(data);
        }

        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    try {
                        settings.success.call(settings.context, JSON.parse(xhr.responseText));
                        return;
                    } catch (e) {
                        settings.error.call(settings.context, e);
                    }
                }

                settings.error.call(settings.context, xhr);
            }
        }, false);

        xhr.open(method, settings.url, typeof settings.async === 'undefined' ? true : settings.async);

        settings.beforeSend.call(settings.context, xhr);

        xhr.setRequestHeader('content-type', 'application/json');

        xhr.send(data);

        return this;
    }
});

module.exports = RESTAPI;
