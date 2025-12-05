const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

// ***************************
// Build inventory by classification view
// ***************************
async function buildByClassificationId(req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();

    // FIXED: Handle case where classification exists but has no vehicles
    const className =
      data.length > 0 ? data[0].classification_name : "Classification";

    res.render("inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
}

// ***************************
// Build vehicle detail view
// ***************************
async function buildDetailView(req, res, next) {
  try {
    const invId = req.params.inv_id;
    const data = await invModel.getVehicleById(invId);

    // FIXED: Handle invalid vehicle ID
    if (!data) {
      const nav = await utilities.getNav();
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, we could not find that vehicle.",
        nav,
      });
    }

    const html = await utilities.buildVehicleDetailHtml(data);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicleHtml: html,
    });
  } catch (error) {
    next(error);
  }
}

// ***************************
// Intentional error
// ***************************
async function throwError(req, res, next) {
  const error = new Error("Intentional server error for testing.");
  error.status = 500;
  next(error);
}

// ***************************
// Management view
// ***************************
async function buildManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const flashMessage = req.flash("notice");

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      flash: flashMessage,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

// ***************************
// Build Add Classification Form
// ***************************
async function buildAddClassification(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      flash: req.flash("notice"),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

// ***************************
// Process Add Classification
// ***************************
async function addClassification(req, res, next) {
  const errors = validationResult(req);

  // 1. Check for Validation Errors
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      flash: req.flash("notice"),
      errors: errors.array(),
      
    });
  }

  const { classification_name } = req.body;

  try {
    // 2. Attempt Database Insert
    const result = await invModel.insertClassification(classification_name);

    if (result) {
      // 3. Success: Flash message and Redirect
      // Note: We do NOT need to call getNav() here because the redirect 
      // loads a new page (Management) which rebuilds the nav itself.
      req.flash(
        "notice",
        `Classification "${classification_name}" added successfully.`
      );
      return res.redirect("/inv");
    } else {
      // 4. Database Failure: Reload form with error message
      let nav = await utilities.getNav();
      req.flash("notice", "Sorry, the classification could not be added.");
      return res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        flash: req.flash("notice"),
        errors: null,
      });
    }
  } catch (error) {
    next(error);
  }
}

// ***************************
// Build Add Inventory Form
// ***************************
async function buildAddInventory(req, res, next) {
  try {
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav(); 

    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      classificationList,
      flash: req.flash("notice"),
      errors: null,
      formData: {}, // Initialize empty formData
      nav,
    });
  } catch (error) {
    next(error);
  }
}

// ***************************
// Process Add Inventory
// ***************************
async function addInventory(req, res, next) {
  // DEBUG: Check if data is reaching the controller
  console.log("Add Inventory Controller Reached");
  console.log("Form Data Received:", req.body);

  let {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    inv_image,
    inv_thumbnail,
  } = req.body;

  // Set defaults for images if empty
  inv_image = inv_image || "/images/vehicles/no-image.png";
  inv_thumbnail = inv_thumbnail || "/images/vehicles/no-image-thumbnail.png";

  const errors = validationResult(req);

  // DEBUG: Check if validation failed
  if (!errors.isEmpty()) {
    console.log("Validation Failed:", errors.array());
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(
      classification_id
    );
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      errors: errors.array(),
      formData: req.body,
      flash: req.flash("notice"),
    });
  }

  try {
    const result = await invModel.insertInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    });

    // DEBUG: Check database result
    console.log("DB Insert Result:", result);

    if (result) {
      req.flash(
        "notice",
        `The ${inv_make} ${inv_model} was successfully added.`
      );
      return res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the insert failed.");
      let nav = await utilities.getNav();
      let classificationList = await utilities.buildClassificationList(
        classification_id
      );
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory Item",
        nav,
        classificationList,
        errors: null,
        formData: req.body,
        flash: req.flash("notice"),
      });
    }
  } catch (error) {
    console.error("Controller Try/Catch Error:", error);
    next(error);
  }
}

module.exports = {
  buildByClassificationId,
  buildDetailView,
  throwError,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
};