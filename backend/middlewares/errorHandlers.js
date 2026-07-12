const HTTP_STATUS_CODES = require('../constants');

const errorHandler = (err, req, res, next)=>{
    const statusCode = res.statusCode !== 200 ? res.statusCode : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

    switch(statusCode){
        case HTTP_STATUS_CODES.BAD_REQUEST:
            return res.status(statusCode).json({
                title:'Bad Request',
                message:err.message
            });
        case HTTP_STATUS_CODES.UNAUTHORIZED_ACCESS:
            return res.status(statusCode).json({
                title:'Unauthorized',
                message:err.message
            });
        case HTTP_STATUS_CODES.FORBIDDEN:
            return res.status(statusCode).json({
                title:'Forbidden',
                message:err.message
            });
        case HTTP_STATUS_CODES.NOT_FOUND:
            return res.status(statusCode).json({
                title:'Not Found',
                message:err.message
            });
        case HTTP_STATUS_CODES.TOO_MANY_REQUESTS:
            return res.status(statusCode).json({
                title:'Too Many Requests',
                message:err.message
            });
        case HTTP_STATUS_CODES.BAD_GATEWAY:
            return res.status(statusCode).json({
                title:'Bad Gateway',
                message:err.message
            });
        case HTTP_STATUS_CODES.SERVICE_UNAVAILABLE:
            return res.status(statusCode).json({
                title:'Service Unavailable',
                message:err.message
            });
        default:
            return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                title:'Internal Server Error',
                message:err.message || 'Something went wrong'
            });
    }
};

module.exports = errorHandler;
