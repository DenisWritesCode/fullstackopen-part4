const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

describe("controller tests", () => {
  test("GET /api/blogs", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-type", /application\/json/);
  });

  test("The unique identifier for blog posts is named id", async () => {
    const blogs = await api.get("/api/blogs");

    expect(blogs.body[0].id).toBeDefined();
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
