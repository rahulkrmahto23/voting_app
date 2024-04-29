const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// POST route to add a person
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; // Assuming the request body contains the person data

    // Create a new Person document using the Mongoose model
    const newUser = new User(data);

    // Save the new person to the database
    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is : ", token);

    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    // Extract username and password from request body
    const { adharCardNumber, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ adharCardNumber: adharCardNumber });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid adharCardNumber or password" });
    }

    // generate Token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    // resturn token as response
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await Person.findById(userId);

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get('/:workType', async(req, res)=>{
//     try{
//         const workType = req.params.workType; // // Extract the work type from the URL parameter
//         if(workType == 'chef' || workType == 'manager' || workType == 'waiter' ){
//             const response = await Person.find({work: workType});
//             console.log('response fetched');
//             res.status(200).json(response);
//         }else{
//             res.status(404).json({error: 'Invalid work type'});
//         }
//     }catch(err){
//         console.log(err);
//         res.status(500).json({error: 'Internal Server Error'});
//     }
// })

router.put("/profile/password", async (req, res) => {
  try {
    const userId = req.user; // Extract the id from the URL parameter
    const {currentPassword,newPassword}= req.body; // Updated data for the person

    // Find the user by username
    const user = await User.findById(userId);

     // If  password does not match, return error
     if (!(await user.comparePassword(currentPassword))) {
        return res
          .status(401)
          .json({ error: "Invalid adharCardNumber or password" });
      }

      //update the new password
      user.password = newPassword;
      await user.save()

    
    console.log("password is updated..");
    res.status(200).json({message:"password updated."});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
