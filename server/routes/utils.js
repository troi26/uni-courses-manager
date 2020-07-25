module.exports.sendErrorResponse = function(req, res, status, message, err) {
    if(process.env.NODE_ENV !== 'development') {
        err = undefined;
    }

    console.log("ERROR: ", err);
    res.status(status).json({
        code: status,
        message,
        error: err
    })
}

module.exports.sendValidationErrorResponse = function(req, res, status, message, err) {
    if(process.env.NODE_ENV !== 'development') {
        err = undefined;
    }

    // console.log(JSON.stringify(message));
    res.status(status).json(message[0]);
}


module.exports.replaceId = function (entity) {
    entity.id = entity._id;
    delete entity._id;
    return entity;
}

module.exports.sendModeValidationErrorResponse = (req, res, status, message, err) => {
    // if(process.env.NODE_ENV !== 'development') {
    //     err = undefined;
    // }

    res.status(status).json({
        code: status,
        message: message,
        errors: err.errors
    });
}