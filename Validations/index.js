const { check, body } = require("express-validator")
const ChangePasswordValidatior = [
    check("current", "current passsowrd is required").notEmpty(),
    check("new", "new passsword should be greater than 6 charaters").isLength({ min: 6 }),
    check("confirm", "current passsowrd is required").custom((value, { req }) => {
        if (value !== req.body.new) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
]
const CountValidator = [
    body("count", "count is required").isInt(),
    body("count", "count is required").notEmpty(),
]
module.exports = { ChangePasswordValidatior, CountValidator }
