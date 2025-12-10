const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  
  // FIXED: Handle case where DB might fail or return undefined
  if (!data) {
    data = [];
  }

  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';

  data.forEach((row) => {
    list += "<li>";
    list +=
      `<a href="/inv/type/${row.classification_id}" 
         title="See our inventory of ${row.classification_name} vehicles">
         ${row.classification_name}
       </a>`;
    list += "</li>";
  });

  list += "</ul>";
  return list
};

Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicle could be found.</p>';
  }
  return grid;
};

Util.buildSingleInventory = async function (data) {
  let inv;
  if (data)
    inv = `
  <div class="invDetail-1">
  <img alt="${data.inv_make}, ${data.inv_make}" src="${data.inv_image}">
  <div class="invDetail-2">
  <h2 class="lora-normal">${data.inv_make}, ${data.inv_model}</h2>
  <div class="invDetail-3">
  <span><b>Manufacturer</b>: ${data.inv_make}</span>
  <span><b>Model</b>: ${data.inv_model}</span>
  <span><b>Production Year</b>: ${data.inv_year}</span>
  <span><b>Description</b>: ${data.inv_description}</span>
  <span><b>Price</b>: $${new Intl.NumberFormat("en-US").format(
    data.inv_price
  )}</span>
  <span><b>Mileage</b>: ${new Intl.NumberFormat("en-US").format(
    data.inv_miles
  )}</span>
  <span><b>External Color</b>: ${data.inv_color}</span>
  </div>
  </div>
  </div>
  `;
  else
    inv += '<p class="notice">Sorry, no matching vehicle could be found.</p>';
  return inv;
};

Util.buildClassificationList = async function (selectedId = null) {
  let data = await invModel.getClassifications();
  
  // FIXED: Handle DB error gracefully
  if (!data) {
    data = [];
  }

  let classificationList = `
    <select name="classification_id" id="classificationList" required>
      <option value="">Choose a Classification</option>
  `;

  data.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`;
    
    // FIXED: Use '==' for loose comparison (string vs number) or convert types
    if (selectedId != null && row.classification_id == selectedId) {
      classificationList += " selected";
    }
    
    classificationList += `>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
};

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

Util.checkAccountType = (req, res, next) => {
  if (!res.locals.accountData) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
  const { account_type } = res.locals.accountData;
  if (account_type === "Employee" || account_type === "Admin") {
    next();
  } else {
    req.flash("notice", "Unauthorized access. Admin or Employee only.");
    return res.redirect("/account/login");
  }
};

Util.checkAccountTypeForAdmin = (req, res, next) => {
  if (!res.locals.accountData) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
  const { account_type } = res.locals.accountData;
  if (account_type === "Admin") {
    next();
  } else {
    req.flash("notice", "Unauthorized access. Admin only");
    return res.redirect("/account/login");
  }
};

Util.buildAccountsGrid = (accounts) => {
  let grid = "<div class='accounts'>";
  accounts.rows.forEach((row) => {
    grid += "<div class='account'>";
    grid += "<p><b>First Name:</b> " + row.account_firstname + "</p>";
    grid += "<p><b>Last Name:</b> " + row.account_lastname + "</p>";
    grid += "<p><b>Email:</b> " + row.account_email + "</p>";
    grid += "<p><b>Account Type:</b> " + row.account_type + "</p>";
    grid += "</div>";
  });
  grid += "</div>";
  return grid;
}

module.exports = Util;