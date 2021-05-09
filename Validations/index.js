const { check, body } = require("express-validator")
const ChangePasswordValidator = [
    check("current", "current passsowrd is required").notEmpty(),
    check("new", "new passsword should be greater than 6 charaters").isLength({ min: 6 }),
    check("confirm", "current passsowrd is required").custom((value, { req }) => {
        if (value !== req.body.new) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    check("token", "reset token is required").notEmpty(),
]
const ResetPasswordValidator = [
    check("new", "new passsword should be greater than 6 charaters").isLength({ min: 6 }),
    check("confirm", "current passsowrd is required").custom((value, { req }) => {
        if (value !== req.body.new) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    check("token", "reset token is required").notEmpty(),
]
const CountValidator = [
    body("count", "count is required").isInt(),
    body("count", "count is required").notEmpty(),
]
const NotificationValidator = [
    body("ids", "ids is required").notEmpty(),
    body("ids", "ids must be an array").isArray({ min: 1 }),
]
module.exports = {
    ChangePasswordValidator,
    CountValidator,
    NotificationValidator,
    ResetPasswordValidator
}
