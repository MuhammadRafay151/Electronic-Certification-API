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
const NotificationValidator = [
    body("ids", "ids is required").notEmpty(),
    body("ids", "ids must be an array").isArray({ min: 1 }),
]
const CountValidator = [
    body("count", "count is required").isInt(),
    body("count", "count is required").notEmpty(),
]
const CertificateValidator = [
    check("name", "Name is required").notEmpty(),
    check("title", "Title is required").notEmpty(),
    check("description", "Description is required").notEmpty(),
    check("template_id", "TemplateID is required").notEmpty(),
]
const BatchValidator = [

    check("batch_name", "Batch Name is required").notEmpty(),
    check("title", "Title is required").notEmpty(),
    check("description", "Description is required").notEmpty(),
    check("template_id", "TemplateID is required").notEmpty(),

]
const UpdateBatchValidator = [

    check("title", "Title is required").notEmpty(),
    check("description", "Description is required").notEmpty(),

]
const RegisterValidator = [
    body("name", "Name is required").notEmpty(),
    body("email", "email is required").notEmpty(),
    body("email", "Invalid email address").isEmail(),
    body("password", "password is required").notEmpty(),
    body("phone", "Invalid phone number").optional({ checkFalsy: true }).isNumeric(),
    body("phone", "Phone Number should be 10 digit long").optional({ checkFalsy: true }).isLength({ min: 10, max:10 }),



]
const UpdateProfileValidator = [
    body("name", "Name is required").notEmpty(),
    body("email", "email is required").notEmpty(),
    body("email", "Invalid email address").isEmail(),
    body("phone", "Invalid phone number").optional({ checkFalsy: true }).isNumeric(),
    body("phone", "Phone Number should be 10 digit long").optional({ checkFalsy: true }).isLength({ min: 10, max:10 }),
]
const LoginValidator = [
    body("password", "password is required").notEmpty(),
    body("email", "email is required").notEmpty(),
    body("email", "Invalid email address").isEmail(),
]
const OrgniazationValidator = [
    body("name", "Name is required").notEmpty(),
    body("email", "email is required").notEmpty(),
    body("email", "Invalid email address").isEmail(),
    body("phone", "Phone Number is required").notEmpty(),
    body("phone", "Invalid phone number").isNumeric(),
    body("phone", "Phone Number should be 10 digit long").isLength({ min: 10, max:10 }),
    body("country_code", "Country Code is required").notEmpty(),
    body("address", "Address is required").notEmpty(),



  
]

module.exports = {
    ChangePasswordValidator, ResetPasswordValidator,
    NotificationValidator,
    CountValidator,
    CertificateValidator,
    BatchValidator,
    UpdateBatchValidator,
    RegisterValidator,
    UpdateProfileValidator,
    LoginValidator,
    OrgniazationValidator
}
