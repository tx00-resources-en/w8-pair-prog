const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  squareFeet: { type: Number, required: true },
  yearBuilt: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
});

module.exports = mongoose.model("Property", propertySchema);
