const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const passport = require("passport")

const users = require("./routes/api/users")
const app = express()

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

app.use (
    bodyParser.urlencoded({
        extended: false
    })
)

app.use(bodyParser.json())

//DB Configuration 
const db = require("./config/keys").mongoURI

//Connect to MongoDB
mongoose.connect(
    db, {useNewURLParser: true}
)
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.log(err))

//Passport middleware integration
app.use(passport.initialize())

//Passport configuration
require("./config/passport")(passport)

//Add routes
app.use("/api/users", users)

//Assign port number from .env file
const PORT = process.env.PORT

//Start server and return response
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});