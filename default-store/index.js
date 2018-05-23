module.exports = function DEFAULT_STORE() {
    return {
        data: {},
        get: function get(key, done) {
            done(void(0), this.data[key]);
        },
        set: function set(key, value, done) {
            this.data[key] = value;
            done(void(0), value);
        },
        reset: function reset() {
            this.data = {};
        },
    }
};
