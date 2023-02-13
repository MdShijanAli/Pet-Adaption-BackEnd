const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// dbUser20
// MsJjXg0QBmjkJO9v
const uri =
  "mongodb+srv://dbUser20:MsJjXg0QBmjkJO9v@cluster0.hvqv2xi.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const signUpUserCollection = client
      .db("petAdoption")
      .collection("signupUser");
    const petsCollection = client.db("petAdoption").collection("pet");

    // Signup user
    app.post("/signup", async (req, res) => {
      const newUserInfo = req.body;
      bcrypt.hash(
        req.body.password && req.body.confirmPassword,
        saltRounds,
        async function (err, hash) {
          if (err) {
            throw new Error("Error while hashing the password");
          }
          newUserInfo.password = hash;

          const allNewUsers = await signUpUserCollection.insertOne(newUserInfo);
          res.send(allNewUsers);
        }
      );
    });
    // Login User
    app.post("/login", async (req, res) => {
      const login = {
        email: req.body.email,
      };
      const findUser = await signUpUserCollection.findOne(login);
      if (findUser) {
        const passwordIsCorrect = await bcrypt.compare(
          req.body.password,
          findUser?.password
        );
        if (passwordIsCorrect == true) {
          res.send(findUser);
        }
      }
      console.log("err");
    });
    // Get All pets
    app.get("/pets", async (req, res) => {
      const query = {};
      const cursor = await petsCollection.find(query);
      const allPets = await cursor.toArray();
      res.send(allPets);
    });
    // get pets by id
    app.get("/pets/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const cursor = await petsCollection.find(query).toArray();
      res.send(cursor);
    });

    app.post("/pet", async (req, res) => {
      const pet = req.body;
      const newPets = await petsCollection.insertOne(pet);
      res.send(newPets);
    });

    app.put("/pet/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDocs = {
        $set: {
          description: req.body,
        },
      };
      const updateReviews = await reviewsCollection.updateOne(
        query,
        updateDocs,
        options
      );
      res.send(newPets);
    });
    app.get("/pets/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singlePet = await petsCollection.findOne(query);
      res.send(singlePet);
    });

    app.get("/", (req, res) => {
      res.send("Your website is running in web");
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log("Your api is running", port);
});
