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
    const savedPetsCollection = client
      .db("petAdoption")
      .collection("savedPets");

    // Signup user
    app.post("/signup", async (req, res) => {
      const newUserInfo = req.body;
      const isNewUser = {
        email: req.body.email,
      };
      const newUserEmail = await signUpUserCollection.findOne(isNewUser);
      if (!newUserEmail) {
        bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
          if (err) {
            throw new Error("Error while hashing the password");
          }
          newUserInfo.password = hash;

          const allNewUsers = await signUpUserCollection.insertOne(newUserInfo);
          res.send(allNewUsers);
        });
      } else {
        res.status(404).send({ message: "User already exits" });
      }
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
    app.get("/email", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const findUser = await signUpUserCollection.findOne(query);
      if (findUser) {
        res.send(findUser);
      }
      console.log("err");
    });
    // Get user all
    app.get("/allUsers", async (req, res) => {
      const query = {};
      const cursor = await signUpUserCollection.find(query).toArray();

      res.send(cursor);
    });
    // Get a single user
    app.get("/user", async (req, res) => {
      const findEmail = req.query.email;
      const filter = {
        email: findEmail,
      };
      const findSingleUser = await signUpUserCollection.findOne(filter);
      res.send(findSingleUser);
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
    //
    // pet saved
    app.post("/pet/:id/save", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {
        _id: ObjectId(id),
      };
      const cursor = await petsCollection.findOne(query);
      const savedPet = await savedPetsCollection.insertOne(cursor);
      res.send(savedPet);
    });
    // Updated pet by id
    app.put("/pet/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const value = req.body;
      const updateDocs = {
        $set: {
          value,
        },
      };
      const updatePets = await petsCollection.updateOne(query, updateDocs);
      res.send(updatePets);
    });
    // Update user profile
    app.put("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const userFind = await signUpUserCollection.findOne(query);
      if (userFind) {
        const value = req.body;
        const options = { upsert: true }
        const updateDocs = {
          $set: {
            value,
          },
        };
        const updateUsers = await signUpUserCollection.updateOne(
          query,
          updateDocs,
          options
        );
        res.send(updateUsers);
      }
    });

    app.post("/pet", async (req, res) => {
      const pet = req.body;
      const newPets = await petsCollection.insertOne(pet);
      res.send(newPets);
    });

    app.get("/pets/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singlePet = await petsCollection.findOne(query);
      res.send(singlePet);
    });
    // Delete pets
    app.delete("/pet/:id/save", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const deletePets = await savedPetsCollection.deleteOne(query);
      res.send(deletePets);
    });

    // User pets
    app.get("/pet/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const getPets = await savedPetsCollection.find(query).toArray();
      res.send(getPets);
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
