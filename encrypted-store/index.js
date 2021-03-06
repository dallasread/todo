var Generator = require('generate-js'),
    cookies = require('browser-cookies'),
    CryptoJS = require('crypto-js');

var EncryptedStore = Generator.generate(function EncryptedStore(options) {
    var _ = this;

    if (typeof options.store === 'undefined') {
        throw new Error('EncryptedStore requires `store`.');
    } else {
        _.defineProperties({
            store: options.store
        });
    }

    _.defineProperties({
        writable: true
    }, {
        cookieName: options.cookieName
    });

    _.reviveSalt();
});

EncryptedStore.definePrototype({
    reviveSalt: function reviveSalt(ignoreReset) {
        var _ = this,
            salt = cookies.get(_.cookieName);

        if (salt) {
            _.setSalt(salt, true);
        } else {
            _.setSalt(
                CryptoJS.HmacSHA512(
                    Math.random(),
                    (new Date().getTime() * Math.random()).toString()
                ).toString(),
                ignoreReset
            );
        }
    },

    setSalt: function setSalt(salt, ignoreReset) {
        var _ = this;

        _.salt = salt;

        if (!ignoreReset) {
            _.reset();
        }

        if (_.cookieName) {
            cookies.set(_.cookieName, salt, { expires: 1 });
        }
    },

    encrypt: function encrypt(value, salt) {
        var _ = this;

        return btoa(CryptoJS.AES.encrypt(JSON.stringify(value), salt || _.salt).toString());
    },

    decrypt: function decrypt(value, salt) {
        var _ = this;

        try {
            return JSON.parse(CryptoJS.AES.decrypt(atob(value), salt || _.salt).toString(CryptoJS.enc.Utf8));
        } catch (e) { }
    },

    set: function set(key, value, done) {
        var _ = this;
        return _.store.set(key.toString(), _.encrypt(value), done);
    },

    get: function get(key, done) {
        var _ = this;

        return _.store.get(key.toString(), function(err, data) {
            if (err) return console.error(err);

            var decrypted;

            try {
                decrypted = _.decrypt(data);

                if (!decrypted && !decrypted.length) {
                    return done(new Error('Unable to decrypt.'));
                }
            } catch (e) {
                return done(new Error('Unable to decrypt.'));
            }

            done(err, decrypted);
        });
    },

    reset: function reset() {
        var _ = this;
        cookies.erase(_.cookieName);
        _.store.reset();
        _.reviveSalt(true);
    },
});

module.exports = EncryptedStore;
