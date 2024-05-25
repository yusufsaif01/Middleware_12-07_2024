const errors = require("./errors");
class ResponseHandler {
  successHandler(data) {
    console.log("come inside success handlere")
    let response = {
      status: "success",
      message: "Successfully done",
    };
    if (data) {
   
      response.data = data;
    }
    return Promise.resolve(response);
  }

  errorHandler(data) {
    console.log("inside error handlere")
    return Promise.reject(data);
  }
}

function handler(req, res, promise) {
  let _inst = new ResponseHandler();
  promise
    .then(_inst.successHandler)
    .catch(_inst.errorHandler)
    .then((data) => {
      res.json(data);
    })
    .catch((data) => {
      
      if (data.httpCode) {
        
        return res.status(data.httpCode).json(data);
      } else {
        
        let error = new errors.Internal();
        return res.status(error.httpCode).json(error);
      }
    });
}

module.exports = handler;
