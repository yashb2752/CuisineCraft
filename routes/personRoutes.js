const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const Person = require("./../models/person");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
//post route to add a person
router.post("/signup", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the body

    const data = req.body;

    // Create and save the new person document
    const newPerson = new Person(data);
    const response = await newPerson.save();
    console.log("Data saved");

    const payload = {
      id: response.id,
      username: response.username,
    };
    console.log(JSON.stringify(payload));
    // Generate a token using the username from the saved document
    const token = generateToken(payload);
    console.log("Token is:", token);

    // Respond with the saved document and the generated token
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// lgin route
router.post("/login", async (req, res) => {
  try {
    // Extract username and password from request body
    const { username, password } = req.body;

    // Find the user by username
    const user = await Person.findOne({ username: username });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    // Generate token with payload
    const payload = {
      id: user.id,
      username: user.username,
    };
    const token = generateToken(payload); // Pass only the payload here

    // Return token as response
    res.json({ token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

//profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userdata = req.user; // Make sure to use the correct variable name
    console.log("user data:", userdata); // Use `userdata` instead of `userData`
    const userId = userdata.id;
    const user = await Person.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// get method to get the person

router.get("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const data = await Person.find();
    console.log("data fetched");
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/:workType", async (req, res) => {
  try {
    const workType = req.params.workType; // extract the work type from the URL parameter
    if (workType == "chef" || workType == "manager" || workType == "waiter") {
      const response = await Person.find({ work: workType });
      console.log("response fetched");
      res.status(200).json(response);
    } else {
      res.status(404).json({ error: "invalid work type" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const personId = req.params.id; // extract the id from the URL parameter
    const updatedPersonData = req.body; // updated data for the person

    const response = await Person.findByIdAndUpdate(
      personId,
      updatedPersonData,
      {
        new: true, // return the updated document
        runValidators: true, // run the mongoose validation
      }
    );
    if (!response) {
      return res.status(404).json({ error: "person not found" });
    }
    console.log("data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const personId = req.params.id;
    const response = await Person.findByIdAndDelete(personId);
    if (!response) {
      return res.status(404).json({ error: "person not found" });
    }
    console.log("data deleted");
    res.status(200).json({ message: "person deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
