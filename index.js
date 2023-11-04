const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT || 5002;

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xpwab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const ObjectId = require("mongodb").ObjectId;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("onewatch");
    const products = database.collection("products");
    const reviews = database.collection("reviews");
    const purchases = database.collection("purchase");
    const users = database.collection("users");

    //Create new product
    app.post("/addproduct", async (req, res) => {
      const newEvent = req.body;
      const result = await products.insertOne(newEvent);
      res.json(result);
    });
    //Add new review
    app.post("/addreview", async (req, res) => {
      const newEvent = req.body;
      const result = await reviews.insertOne(newEvent);
      res.json(result);
    });
    //Load Review
    app.get("/reviews", async (req, res) => {
      const cursor = reviews.find({});
      const review1 = await cursor.toArray();
      res.send(review1);
    });
    //Load product
    app.get("/products", async (req, res) => {
      const cursor = products.find({});
      const product1 = await cursor.toArray();
      res.send(product1);
    });
    //Load Single Item By ID
    app.get("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const event = await products.findOne(query);
      res.send(event);
    });

    //Purchase confirmed
    app.post("/purchaseconfirm", async (req, res) => {
      const confirmPurchase = req.body;
      const result = await purchases.insertOne(confirmPurchase);
      res.json(result);
    });

    //purchase delete
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchases.deleteOne(query);
      res.json(result);
    });

    //product delete
    app.delete("/products/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await products.deleteOne(query);
      res.json(result);
    });

    //myorders
    app.get("/myorders/:mail", async (req, res) => {
      const mail = req.params.mail;
      const order = purchases.find({ email: mail });

      res.send(await order.toArray());
    });

    //upsert user data
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await users.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //Check if a user is admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await users.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //Make admin
    app.put("/makeadmin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await users.updateOne(filter, updateDoc);
      res.json(result);
    });

    //Update Status
    app.put("/status/:id", async (req, res) => {
      const id = req.params.id;

      const updatedStatus = req.body;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          productStatus: updatedStatus.status,
        },
      };
      const result = await purchases.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //Load All Orders
    app.get("/allorders", async (req, res) => {
      const cursor = purchases.find({});
      const event2 = await cursor.toArray();
      res.send(event2);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log("listening");
});
