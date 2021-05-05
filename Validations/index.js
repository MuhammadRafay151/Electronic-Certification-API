const { check, body, param } = require("express-validator")
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
    check("instructor_name", "Instructor_Name is required").notEmpty(),
    check("template_id", "TemplateID is required").notEmpty(),
]

const BatchValidator=[
    
    check("batch_name", "Batch Name is required").notEmpty(),
    check("title", "Title is required").notEmpty(),
    check("description", "Description is required").notEmpty(),
    check("instructor_name", "Instructor_Name is required").notEmpty(),
    check("template_id", "TemplateID is required").notEmpty(),

]

const UpdateBatchValidator=[
    
    check("title", "Title is required").notEmpty(),
    check("description", "Description is required").notEmpty(),
    check("instructor_name", "Instructor_Name is required").notEmpty(),

]


const RegisterValidator=[
    body("name", "Name is required").notEmpty(),
    body("email", "email is required").notEmpty(),
    body("email", "Invalid email address").isEmail(),
    body("password", "password is required").notEmpty(),
    body("phone", "CertificateID is required").notEmpty(),
    body("country_code", "CertificateID is required").notEmpty(),
    body("address", "CertificateID is required").notEmpty(),


]

const UpdateProfileValidator=[
    body("name", "Name is required").notEmpty(),
    body("email", "email is required").notEmpty(),
    body("email", "Invalid email address").isEmail(),
    body("phone", "CertificateID is required").notEmpty(),
    body("country_code", "CertificateID is required").notEmpty(),
    body("address", "CertificateID is required").notEmpty(),
]

const LoginValidator=[
    body("password", "password is required").notEmpty(),
    body("email", "email is required").notEmpty(),
    body("email", "Invalid email address").isEmail(),
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
    LoginValidator
}
