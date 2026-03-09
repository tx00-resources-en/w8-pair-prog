const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const config = require("../utils/config");

const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "testPassword123",
  phoneNumber: "1234567890",
  dateOfBirth: "1990-05-15",
  address: {
    street: "123 Test Street",
    city: "Helsinki",
    state: "Uusimaa",
    zipCode: "00100",
  },
};

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

const getToken = async () => {
  const response = await api.post("/api/users").send(testUser);
  return response.body.token;
};

beforeAll(async () => {
  await mongoose.connect(config.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Property.deleteMany({});
  await User.deleteMany({});
});

describe("User Authentication", () => {
  test("POST /api/users — should signup a new user", async () => {
    const response = await api.post("/api/users").send(testUser).expect(201);

    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("phoneNumber");
    expect(response.body).toHaveProperty("token");
    expect(response.body.name).toBe(testUser.name);
    expect(response.body.email).toBe(testUser.email);
  });

  test("POST /api/users — should not signup with missing fields", async () => {
    await api
      .post("/api/users")
      .send({ email: "incomplete@example.com" })
      .expect(400);
  });

  test("POST /api/users — should not signup with existing email", async () => {
    await api.post("/api/users").send(testUser).expect(201);

    await api
      .post("/api/users")
      .send(testUser)
      .expect(/4[0-9]{2}/);
  });

  test("POST /api/users/login — should login an existing user", async () => {
    await api.post("/api/users").send(testUser).expect(201);

    const response = await api
      .post("/api/users/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("token");
  });

  test("POST /api/users/login — should not login with wrong password", async () => {
    await api.post("/api/users").send(testUser).expect(201);

    await api
      .post("/api/users/login")
      .send({ email: testUser.email, password: "wrongPassword" })
      .expect(401);
  });

  test("POST /api/users/login — should not login with non-existent email", async () => {
    await api
      .post("/api/users/login")
      .send({ email: "nonexistent@example.com", password: "anyPassword" })
      .expect(401);
  });
});

describe("Properties CRUD (Public Routes)", () => {
  test("GET /api/properties — should return all properties", async () => {
    await Property.create(testProperty);
    await Property.create({
      ...testProperty,
      title: "Modern Villa",
      type: "House",
    });

    const response = await api.get("/api/properties").expect(200);

    expect(response.body).toHaveLength(2);
  });

  test("GET /api/properties/:id — should return a single property", async () => {
    const property = await Property.create(testProperty);

    const response = await api
      .get(`/api/properties/${property._id}`)
      .expect(200);

    expect(response.body.title).toBe(testProperty.title);
    expect(response.body.type).toBe(testProperty.type);
    expect(response.body.location.city).toBe(testProperty.location.city);
  });

  test("GET /api/properties/:id — should return 404 for non-existent property", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    await api.get(`/api/properties/${nonExistentId}`).expect(404);
  });
});

describe("Properties CRUD (Protected Routes)", () => {
  test("POST /api/properties — should create a property when authenticated", async () => {
    const token = await getToken();

    const response = await api
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(testProperty)
      .expect(201);

    expect(response.body.title).toBe(testProperty.title);
    expect(response.body.type).toBe(testProperty.type);
    expect(response.body.description).toBe(testProperty.description);
    expect(response.body.price).toBe(testProperty.price);
    expect(response.body.location.city).toBe(testProperty.location.city);
    expect(response.body.squareFeet).toBe(testProperty.squareFeet);
    expect(response.body.yearBuilt).toBe(testProperty.yearBuilt);
    expect(response.body.bedrooms).toBe(testProperty.bedrooms);
  });

  test("POST /api/properties — should return 401 without a token", async () => {
    await api.post("/api/properties").send(testProperty).expect(401);
  });

  test("POST /api/properties — should return 401 with invalid token", async () => {
    await api
      .post("/api/properties")
      .set("Authorization", "Bearer invalidtoken123")
      .send(testProperty)
      .expect(401);
  });

  test("PUT /api/properties/:id — should update a property when authenticated", async () => {
    const token = await getToken();

    const createResponse = await api
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(testProperty)
      .expect(201);

    const propertyId = createResponse.body._id;

    const response = await api
      .put(`/api/properties/${propertyId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Apartment", price: 300000 })
      .expect(200);

    expect(response.body.title).toBe("Updated Apartment");
    expect(response.body.price).toBe(300000);
  });

  test("PUT /api/properties/:id — should return 401 without a token", async () => {
    const token = await getToken();

    const createResponse = await api
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(testProperty)
      .expect(201);

    const propertyId = createResponse.body._id;

    await api
      .put(`/api/properties/${propertyId}`)
      .send({ title: "Updated Apartment" })
      .expect(401);
  });

  test("DELETE /api/properties/:id — should delete a property when authenticated", async () => {
    const token = await getToken();

    const createResponse = await api
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(testProperty)
      .expect(201);

    const propertyId = createResponse.body._id;

    await api
      .delete(`/api/properties/${propertyId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const propertyInDb = await Property.findById(propertyId);
    expect(propertyInDb).toBeNull();
  });

  test("DELETE /api/properties/:id — should return 401 without a token", async () => {
    const token = await getToken();

    const createResponse = await api
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(testProperty)
      .expect(201);

    const propertyId = createResponse.body._id;

    await api.delete(`/api/properties/${propertyId}`).expect(401);

    const propertyInDb = await Property.findById(propertyId);
    expect(propertyInDb).not.toBeNull();
  });
});
