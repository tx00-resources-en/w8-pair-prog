const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Property = require("../models/propertyModel");
const config = require("../utils/config");

const testProperty = {
  title: "Cozy Apartment",
  type: "Apartment",
  description: "A cozy apartment in downtown",
  price: 250000,
  location: {
    address: "123 Main Street",
    city: "Helsinki",
    state: "Uusimaa",
  },
  squareFeet: 1200,
  yearBuilt: 2015,
  bedrooms: 3,
};

beforeAll(async () => {
  await mongoose.connect(config.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await Property.deleteMany({});
});

describe("POST /api/properties", () => {
  it("should create a new property successfully", async () => {
    const response = await api
      .post("/api/properties")
      .send(testProperty)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(testProperty.title);
    expect(response.body.type).toBe(testProperty.type);
    expect(response.body.description).toBe(testProperty.description);
    expect(response.body.price).toBe(testProperty.price);
    expect(response.body.location.address).toBe(testProperty.location.address);
    expect(response.body.location.city).toBe(testProperty.location.city);
    expect(response.body.location.state).toBe(testProperty.location.state);
    expect(response.body.squareFeet).toBe(testProperty.squareFeet);
    expect(response.body.yearBuilt).toBe(testProperty.yearBuilt);
    expect(response.body.bedrooms).toBe(testProperty.bedrooms);
  });

  it("should fail with missing required fields", async () => {
    await api
      .post("/api/properties")
      .send({ title: "Incomplete" })
      .expect(400);
  });
});

describe("GET /api/properties", () => {
  it("should return all properties", async () => {
    await Property.create(testProperty);
    await Property.create({
      ...testProperty,
      title: "Beach House",
      type: "House",
      price: 500000,
      location: { address: "456 Beach Rd", city: "Espoo", state: "Uusimaa" },
    });

    const response = await api
      .get("/api/properties")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(2);
  });
});

describe("GET /api/properties/:id", () => {
  it("should return a single property", async () => {
    const property = await Property.create(testProperty);

    const response = await api
      .get(`/api/properties/${property._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(testProperty.title);
    expect(response.body.type).toBe(testProperty.type);
    expect(response.body.location.city).toBe(testProperty.location.city);
  });

  it("should return 404 for non-existent id", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    await api.get(`/api/properties/${nonExistentId}`).expect(404);
  });
});

describe("PUT /api/properties/:id", () => {
  it("should update a property successfully", async () => {
    const property = await Property.create(testProperty);

    const updates = { title: "Updated Apartment", price: 300000 };

    const response = await api
      .put(`/api/properties/${property._id}`)
      .send(updates)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(updates.title);
    expect(response.body.price).toBe(updates.price);
    expect(response.body.type).toBe(testProperty.type);
    expect(response.body.description).toBe(testProperty.description);
    expect(response.body.location.city).toBe(testProperty.location.city);
  });

  it("should return 404 for non-existent id", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    await api
      .put(`/api/properties/${nonExistentId}`)
      .send({ title: "Updated" })
      .expect(404);
  });
});

describe("DELETE /api/properties/:id", () => {
  it("should delete a property successfully", async () => {
    const property = await Property.create(testProperty);

    await api.delete(`/api/properties/${property._id}`).expect(200);

    const found = await Property.findById(property._id);
    expect(found).toBeNull();
  });

  it("should return 404 for non-existent id", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    await api.delete(`/api/properties/${nonExistentId}`).expect(404);
  });
});
