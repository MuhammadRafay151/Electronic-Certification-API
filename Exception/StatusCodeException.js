class StatusCodeException {
    constructor(StatusCode, Message) {
        this.StatusCode = StatusCode || 500;
        this.Message = Message || "Unknown error";
    }

}
module.exports = {
    StatusCodeException
}