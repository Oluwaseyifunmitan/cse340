const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const accountModel = require("../models/account-model")
  const validate = {}

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

    /*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
    validate.loginRules = () => {
        return [
          body("account_email")
          .trim()
          .escape()
          .notEmpty()
          .isEmail()
          .normalizeEmail() // refer to validator.js docs
          .withMessage("A valid email is required.")
          .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (!emailExists){
              throw new Error("User not found")
            }
          }),
      
          body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
              minLength: 12,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
        ]
      }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        account_email,
      })
      return
    }
    next()
  }

  validate.updateAccountRules = () => {
    return [
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."),
  
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."),
  
      body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email, { req }) => {
          const existingAccount = await accountModel.getAccountByEmail(account_email);
          if (existingAccount && existingAccount.account_email !== account_email) {
            const emailExists = await accountModel.checkExistingEmail(account_email);
            if (emailExists) {
              throw new Error("Email exists. Please log in or use a different email.");
            }
          }
        })
    ];
  };

  validate.updatePasswordRules = () => {
    return [
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet security requirements.")
    ];
  };
  

  validate.checkUpdateAccountData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/update", {
        errors,
        title: "Account Update",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

  validate.checkUpdatePasswordData = async (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/update", {
            errors,
            title: "Account Update",
            nav,
        });
        return;
    }
    next();
};

validate.checkUpdateAccountTypeRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_type")
      .trim()
      .escape()
      .notEmpty()
      .isIn(["Client", "Employee", "Admin"])
      .withMessage("Account type must be 'Client', 'Employee', or 'Admin'.")
  ];
}

  validate.checkUpdateAccountTypeData = async (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/default", {
            errors,
            title: "Account Management",
            nav,
            account_firstname: null,
            account_lastname: null,
            account_email: null
        });
        return;
    }
    next();
};

  
  module.exports = validate
  