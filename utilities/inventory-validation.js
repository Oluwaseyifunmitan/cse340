const utilities = require("../utilities/");
const { body, validationResult } = require("express-validator");

const validate = {};

/* ***************************
 *  Classification Validation Rules
 * ************************** */
validate.addClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ];
};

/* ***************************
 *  Add Inventory Validation Rules
 *  (New rules added to meet criteria)
 * ************************** */
validate.addInventoryRules = () => {
  return [
    // Classification is required
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please select a classification."),

    // Make is required and must be min 3 characters
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters."),

    // Model is required and must be min 3 characters
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters."),

    // Description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required."),

    // Image Path is required
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    // Thumbnail Path is required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    // Price must be a decimal or integer
    body("inv_price")
      .trim()
      .isFloat({ min: 0.01 })
      .withMessage("Price must be a valid number greater than 0."),

    // Year must be 4 digits
    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a 4-digit number between 1900 and 2099."),

    // Miles must be an integer (no decimals)
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive whole number (no commas or periods)."),

    // Color is required
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required."),
  ];
};

/* ***************************
 *  Check data and return errors or continue to registration
 * ************************** */
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      flash: req.flash("notice"),
    });
    return;
  }
  next();
};

/* ***************************
 *  Check data and return errors or continue to Add Inventory
 *  (New middleware to handle inventory validation errors)
 * ************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    // Maintain the selected classification in the dropdown
    let classificationList = await utilities.buildClassificationList(req.body.classification_id);
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      errors: errors.array(),
      formData: req.body, // Pass sticky data back to the view
    });
    return;
  }
  next();
};

module.exports = validate;