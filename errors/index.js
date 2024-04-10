const errors = require('./errors');

const errNames = Object.keys(errors);
const Errors = {};

const nameIt = (name, cls) => ({[name] : class extends cls {
    constructor(msg, data) {
        super();
        this.message = msg || errors[name].message;
        this.code = errors[name].code;
        this.httpCode = errors[name].httpCode;
       
        if (data) {
            console.log("inside error file")
            this.data = data;
        }
    }

}})[name];

errNames.forEach((name) => {
    Errors[name] = nameIt(name, Error)
});

module.exports = Errors;
