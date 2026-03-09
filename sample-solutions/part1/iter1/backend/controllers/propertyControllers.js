const Property = require("../models/propertyModel");

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({});
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyById = async (req, res) => {
  res.send("Get property by id - not yet implemented");
};

const createProperty = async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  res.send("Update property - not yet implemented");
};

const deleteProperty = async (req, res) => {
  res.send("Delete property - not yet implemented");
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
