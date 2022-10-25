const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt  = require("jsonwebtoken")
const keys = require("../../config/keys")


//Load input validation 
const validateRegisterInput = require("../../validation/register")
const validateLoginInput = require("../../validation/login")

//Load the User model
const User = require("../../models/User")


//ROUTES 

//--Registration
//@route POST api/users/register
//@desc Used to register a new user
//@access Used by public

router.post("/register", (req, res) => {
    //Form Validation before submission

    const { errors, isValid} = validateRegisterInput(req.body)

    //Check validation

    if(!isValid) {
        //Client error 400 series
        return res.status(400).json(errors)
    }

    User.findOne({ email: req.body.email }).then(user => {
        //If user exist
        if(user) {
            return res.status(400).json({ email: "Email registered to another user."})
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            })

            //Use bcrypt to hash password before saving
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err))
                })
            })
        }
    })
})


//--Login
//@route POST api/users/login
//@desc Used to login current user
//@access Used by public

router.post("/login", (req, res) => {
    
    //Form Validation 
    const { errors, isValid} = validateLoginInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    const email = req.body.email
    
    const password = req.body.password

    //Find user using email
    User.findOne({email }).then(user => {
        //Verify is user exist
        if(!user) {
            return res.status(404).json( { emailnotfound: "Email address is not registered."
        })
    }

    //Check password

    bcrypt.compare(password, user.password).then(isMatch => {
        if(isMatch) {
            //User password matches create JWT Payload
            const payload = {
                id: user.id,
                name: user.name
            }

            //Sign the token
            jwt.sign(
                payload,
                keys.secretOrKey,
                {
                    expiresIn: 31556926 //1 year as seconds
                },
                (err, token) => {
                    res.json( {
                        success: true,
                        token: "Bearer " + token
                    })
                }
            )
        } else {
            return res
                .status(400)
                .json({ passwordincorrect: "Password is incorrect"})
        }
    })
    })
})


module.exports = router
