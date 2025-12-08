const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

async function defaultAccountView(req, res, next) {
  let nav = await utilities.getNav();
  req.flash("notice", "You are logged in");
  res.render("account/default", {
    title: "Account Management",
    account_firstname: null,
    account_lastname: null,
    account_email: null,
    nav,
    errors: null,
  });
}

async function viewUpdateAccount(req, res, next) {
  let nav = await utilities.getNav();
  req.flash("notice", "Update Your Account");
  res.render("account/update", {
    title: "Account Update",
    nav,
    errors: null,
  });
}

async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id
  } = req.body;
  const result = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)
  if (result) {
    const updatedAccount = await accountModel.getAccountByID(account_id);
    req.flash(
      "notice",
      "Congratulations, you have successfully updated your account"
    );
    res.status(200).render("account/default", {
      title: "Account Management",
      account_firstname: updatedAccount.account_firstname,
      account_lastname: updatedAccount.account_lastname,
      account_email: updatedAccount.account_email,
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the account update failed.");
    res.status(501).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
    });
  }
}

async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const {
    account_password,
    account_id
  } = req.body;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error changing the password."
    );
    res.status(501).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
    });
  }
  const result = await accountModel.changePassword(
    hashedPassword, account_id
  );
  if (result) {
    req.flash(
      "notice",
      "Congratulations, you have successfully changed your password"
    );
    res.status(200).render("account/default", {
      title: "Account Management",
      account_firstname: null,
      account_lastname: null,
      account_email: null,
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the attempt to change password failed.");
    res.status(501).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
    });
  }
}

async function logout(req, res, next){
  res.clearCookie("jwt"); 
  req.flash("notice", "You have been logged out successfully.");
  res.redirect("/"); 
}

async function getAll(req, res, next){
  let nav = await utilities.getNav();
  let accounts
  try {
    accounts = await accountModel.getAllAccounts();
  } catch (error) {
    console.log(error.message)
  }
  const accountsGrid = utilities.buildAccountsGrid(accounts);
  req.flash("notice", "Scroll to the bottom to update any account type");
  res.render("account/getAll", {
    title: "View All Accounts",
    nav,
    accountsGrid,
    errors: null,
  });
}
async function updateAccountType(req, res, next){
  let nav = await utilities.getNav();
  const {
    account_email,
    account_type
  } = req.body;
  const result = await accountModel.updateAccountType(account_type, account_email);
  if (result) {
    req.flash(
      "notice",
      `You have updated the account_type of user with email ${account_email}`
    );
    res.status(200).render("account/default", {
      title: "Account Management",
      account_firstname: null,
      account_lastname: null,
      account_email: null,
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "account type update failed");
    res.status(501).render("account/default", {
      title: "Account Management",
      account_firstname: null,
      account_lastname: null,
      account_email: null,
      nav,
      errors: null,
    });
  }
}



module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  defaultAccountView,
  viewUpdateAccount,
  updateAccount,
  changePassword,
  logout,
  getAll,
  updateAccountType
};