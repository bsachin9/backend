const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const UserModel = require('./Model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const app = express()

app.use (express.json())
app.use(cors ({
  origin: ['http://localhost:5000'],
  methods: ["GET","POST"],
  credentials: true,
}))

app.use(cookieParser())

mongoose.connect("mongodb+srv://sachin9:sachin9@cluster0.yvahwyh.mongodb.net/?retryWrites=true&w=majority");

const verifyUser = (req,res,next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token not available")
  } else {
    jwt.verify(token,"jwt-secret-key", (err, decoded)=> {
      if (err) return res.json("Token is Wrong")
      next()
    })
  }
}

app.get('/home', verifyUser, (req,res) => {
  return res.json("Success")
})

app.get ('/', (req,res) => {
  UserModel.find()
  .then (users => res.json(users))
  .catch(err => res.json (err))
})

app.post('/login',(req,res) => {
  const {email, password} = req.body
  UserModel.findOne({email:email})
  .then (user =>{
    if (user) {
      bcrypt.compare (password, user.password, (err,response) => {
        if (response) {
          const token = jwt.sign({email:user.email}, "jwt-secret-key",
          {expiresIn:"5d"})
          res.cookie("token", token)
          res.json("Success")
        } else {
          res.json("the password is Incorrect")
        }
      }) 
    } else {res.json ("No records Existed")}
  })
})

app.post ("/register", (req,res) => {
  const {name, dob, email,password} = req.body;

  bcrypt.hash(password,10)
  .then ((hash) => {
    UserModel.create({name, dob, email, password : hash})
    .then ((users) => res.json(users))
    .catch ((err) => res.json(err))
  }) 
  .catch(err => console.log (err.message))
})

app.listen (3000, () => {
  console.log ("Server is Running")
})