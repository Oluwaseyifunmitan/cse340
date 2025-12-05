const invModel = require("../models/inventory-model");
const Util = {};

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
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = "";

  // FIXED: Check if data exists AND has length
  if (data && data.length > 0) {
    grid = '<ul id="inv-display">';

    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        `<a href="/inv/detail/${vehicle.inv_id}" 
           title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
           <img src="${vehicle.inv_thumbnail}" 
                alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
         </a>`;

      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        `<a href="/inv/detail/${vehicle.inv_id}" 
            title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            ${vehicle.inv_make} ${vehicle.inv_model}
         </a>`;
      grid += "</h2>";

      grid +=
        `<span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>`;
      grid += "</div>";
      grid += "</li>";
    });

    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return grid;
};

/* **************************************
 * Build the vehicle detail HTML
 * ************************************ */
Util.buildVehicleDetailHtml = async function (data) {
  // FIXED: Handle null data to prevent server crash
  if (!data) {
    return '<p class="notice">Sorry, vehicle details could not be retrieved.</p>';
  }

  const formatter = new Intl.NumberFormat("en-US");
  const price = formatter.format(data.inv_price);
  const miles = formatter.format(data.inv_miles);

  // Added container div and standard formatting
  let html = `
    <section class="vehicle-detail">
      <div class="detail-image">
        <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}">
      </div>
      <div class="detail-info">
        <h2>${data.inv_make} ${data.inv_model} Details</h2>
        <p><strong>Price:</strong> $${price}</p>
        <p><strong>Description:</strong> ${data.inv_description}</p>
        <p><strong>Color:</strong> ${data.inv_color}</p>
        <p><strong>Miles:</strong> ${miles}</p>
      </div>
    </section>
  `;
  
  return html;
};

/* **************************************
 * Build Classification Dropdown List
 * ************************************ */
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

/* **************************************
 * Middleware to check token validity
 * (Optional - usually added later in this project, 
 * but good to keep structure clean if needed)
 * ************************************ */

/* **************************************
 * Error Handler Wrapper
 * ************************************ */
Util.handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = Util;