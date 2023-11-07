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

  test("making a post request to /api/blogs creates a new blog", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "John Test Doe",
      url: "test.url.com",
      likes: 7,
    };

    (await api.post("/api/blogs"))
      .send(newBlog)
      .expect(201)
      .expect("Content-type", /application\/json/);

    const response = await api.get("/api/blogs");
    const contents = response.body.map((blog) => blog.title);
    expect(response.body).toHaveLength(initialBlogs.length + 1);
    expect(contents).toContain(newBlog.title);
  });

  test("missing likes property defaults to 0", async () => {
    const newBlog = {
      title: "Test Blog 002",
      author: "John Test Doe",
      url: "test.url.com",
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-type", /application\/json/);

    const response = await api.get("/api/blogs");
    const contents = response.body;
    console.log(contents);
  });

  test("missing title or url properties get a 400 bad request response", async () => {
    const blogWithoutTitle = {
      author: "John Test Doe",
      url: "test.url.com",
      likes: 7,
    };

    const blogWithoutUrl = {
      title: "Test Blog",
      author: "John Test Doe",
      likes: 7,
    };

    await api.post("/api/blogs").send(blogWithoutTitle).expect(400);
    await api.post("/api/blogs").send(blogWithoutUrl).expect(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
