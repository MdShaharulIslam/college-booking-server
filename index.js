const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const http = require("http");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcvsatz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware to set Keep-Alive header
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=5, max=1000");
  next();
});

// Connect to MongoDB and define APIs
async function run() {
  try {
    const db = client.db("collegeBooking");
    const userCollection = db.collection("users");
    const collegesCollection = db.collection("colleges");
    const reviewCollection = db.collection("reviews");

    console.log("Successfully connected to MongoDB!");

    // User APIs
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      try {
        const result = await userCollection.insertOne(newUser);
        res.status(201).send({ message: "User created successfully", result });
      } catch (error) {
        res.status(500).send({ message: "Failed to create user", error });
      }
    });

    app.get("/users", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      const users = await userCollection
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(users);
    });

    // College APIs
    app.post("/add-colleges", async (req, res) => {
      const event = req.body;
      const result = await collegesCollection.insertOne(event);
      res.send(result);
    });

    app.get("/add-colleges", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      const result = await collegesCollection
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/colleges", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await collegesCollection.find(query).toArray();
      res.send(result);
    });
    app.get('/colleges/:id', async (req, res) => {
      try {
        const college = await College.findById(req.params.id); // Fetch the college from the database using the ID
        if (!college) {
          return res.status(404).json({ message: "College not found" });
        }
        res.json(college); // Return the college details
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    // Review APIs
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find().toArray();
      res.send(reviews);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
run().catch(console.dir);

// Default route
app.get("/", (req, res) => {
  res.send("College booking backend is running");
});

// Create and start the HTTP server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`College booking is running on port ${port}`);
});

// Server Keep-Alive settings
server.keepAliveTimeout = 5000;
server.headersTimeout = 10000;
