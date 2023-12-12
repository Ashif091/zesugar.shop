const  constants  = require('../constants')

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 200;
    res.status(statusCode)
    switch (statusCode) {
        case constants.NOT_FOUND:
            res.json({ title: "not fount", message: err.message })
            break;
        case constants.FORBIDDEN:
            res.json({ title: "FORbidden", message: err.message })

            break;
        case constants.UNAUTHORIZED:
            res.json({ title: "unauthorized", message: err.message })

            break;
        case constants.VALIDATION_ERROR:
            res.json({ title: "validation error  ", message: err.message })

            break;
        case constants.SERVER_ERROR:
            res.json({ title: "SERVER_ERROR", message: err.message })

            break; 
          
        default:
            console.log("all good no error");
            break;
    }

}
module.exports = errorHandler

