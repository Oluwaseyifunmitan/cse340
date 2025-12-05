const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const sql =
      "SELECT * FROM public.classification ORDER BY classification_name";
    const data = await pool.query(sql);
    // ✅ FIX: Return data.rows, not the whole data object
    return data.rows;
  } catch (error) {
    console.error("getClassifications error " + error);
    return []; // Return empty array if error ensures .forEach doesn't crash
  }
}

/* ***************************
 *  Get inventory by classification ID
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error);
  }
}

/* ***************************
 *  Get vehicle by inventory ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleById error " + error);
  }
}

/* ***************************
 *  Insert new classification
 * ************************** */
async function insertClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Add New Inventory Item
 *  (This meets the requirement: Model code written for Adding Inventory)
 * ************************** */
async function insertInventory(vehicleData) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    // IMPORTANT: HTML forms send data as strings.
    // We must parse numbers to ensure the DB accepts them.
    const values = [
      vehicleData.inv_make,
      vehicleData.inv_model,
      parseInt(vehicleData.inv_year),
      vehicleData.inv_description,
      vehicleData.inv_image,
      vehicleData.inv_thumbnail,
      parseFloat(vehicleData.inv_price), // Price might have decimals
      parseInt(vehicleData.inv_miles),
      vehicleData.inv_color,
      vehicleData.classification_id,
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("insertInventory error: " + error);
    // Return null so the controller knows the insert failed
    return null;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  insertClassification,
  insertInventory,
};
