class AppError {
    mensage;
    statusCode;

    constructor(mensage, statusCode = 400) {
        this.mensage = mensage;
        this.statusCode = statusCode;
    }
};

module.exports = AppError