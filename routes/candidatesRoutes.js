const express = require("express");
const router = express.Router();
const candidate = require("./../models/candidates");
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
const { minBy } = require("lodash");

const checkAdminRole = async function (userID) {
  try {
    const user = await User.findById(userID);
    return user.role === "admin";
  } catch (error) {
    return false;
  }
};

// POST route to add a person
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "user does not have admin role" });
    }
    const data = req.body; // Assuming the request body contains the person data

    // Create a new Person document using the Mongoose model
    const newCandidate = new candidate(data);

    // Save the new person to the database
    const response = await newCandidate.save();
    console.log("data saved");

    res.status(200).json(response);
    //res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user does not have admin role" });

    const candidateID = req.params.candidateID; // Extract the id from the URL parameter
    const updatedCandidateData = req.body; // Updated data for the person

    const response = await candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run Mongoose validation
      }
    );

    if (!response) {
      return res.status(404).json({ error: "Candidate is  not found" });
    }

    console.log("candidate data is  updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user does not have admin role" });

    const candidateID = req.params.candidateID; // Extract the person's ID from the URL parameter

    // Assuming you have a Person model
    const response = await candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: "Person not found" });
    }
    console.log("data delete");
    res.status(200).json({ message: "candidate Deleted Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//start voting

router.post("/vote/:candidateID", jwtAuthMiddleware, async function (req, res) {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;
  
    try {
      const foundCandidate = await candidate.findById(candidateID);
      if (!foundCandidate) {
        return res.status(404).json({ message: "Candidate not found." });
      }
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      if (user.isVoted) {
        return res.status(400).json({ message: "You have already voted." });
      }
  
      if (user.role === "admin") {
        return res.status(403).json({ message: "Admin cannot vote." });
      }
  
      // Update the candidate document to record the vote
      foundCandidate.votes.push({ user: userId });
      foundCandidate.voteCount++;
      await foundCandidate.save();
  
      // Update the user document
      user.isVoted = true;
      await user.save();
  
      return res.status(200).json({ message: "User voted successfully." });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error." });
    }
  });
  

// vote count
router.get("/vote/count", async (req, res) => {
  try {
    // Find all candidates and sort them by voteCount in descending order
    const allCandidates = await candidate.find().sort({ voteCount: "desc" });

    // Map the candidates to only return their name and voteCount
    const voteRecord = allCandidates.map((data) => {
      return {
        party: data.name, // Assuming the field is 'name' for candidate's name
        count: data.voteCount,
      };
    });

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get List of all candidates with only name and party fields
router.get("/", async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await candidate.find({}, "name party -_id");

    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
