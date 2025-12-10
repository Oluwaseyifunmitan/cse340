
const intErrCont = {}

intErrCont.getIntentionalError = async function (req, res, next) {
    const error = new Error ("This is a 500 error created intentionally");
    error.status = 500;
    next(error);
}     


module.exports = intErrCont