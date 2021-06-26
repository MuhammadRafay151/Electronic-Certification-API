class StatusCodeException {
    constructor(StatusCode, Message,CustomErrorCode=null) {
        this.StatusCode = StatusCode || 500;
        this.Message = Message || "Unknown error";
        this.CustomErrorCode=CustomErrorCode;
    }

}
module.exports = {
    StatusCodeException
}