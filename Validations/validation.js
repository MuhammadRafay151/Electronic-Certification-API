const { check } = require("express-validator")
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
module.exports = { ChangePasswordValidatior }
