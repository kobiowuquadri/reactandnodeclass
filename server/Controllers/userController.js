const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body
    const existingUser = await userModel.findOne({ email })
    // if user exist
    if (existingUser) {
      res.status(400).json({succes: false, message: "User already exist"})
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const newUser = userModel({
      username,
      email,
      password: hashPassword
    })
    await newUser.save()

    res.status(201).json({ sucess: true, message: 'User Created Successfully' })
  } catch (err) {
    console.log(err?.message)
  }
}

const userLogin = async (req, res) => {
  // COOKIE -> Container, where we token ----- > LOCALSTROGE, SESSION 
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    // plain password -> password req.body
    const isPassword = await bcrypt.compare(password, user.password)
    if (!isPassword) {
      res.json({ message: 'Incorrect Password' })
    }
    if (!user) {
      res.json({ message: 'User not found!' })
    }
    const token = jwt.sign({ user: user._id }, process.env.SECRET, {
      expiresIn: '1hr'
    })

    // ms
    res.cookie('usertoken', token, {maxAge: 1000 * 60 * 60 * 24 * 3})
    
    res.status(200).json({ message: 'Login Successful', token, user })
  } catch (err) {
    console.error(err)
  }
}

// Authorization

// get 

const showAllUsers = async (req, res) => {
  try{
    const user = await userModel.find()
    console.log(user)
    res.status(202).json({success: true, user})
  }
  catch(err){
    console.log(err)
    res.status(400).json({suucess: false, msg: err.message})
  }
}



module.exports = { userRegister, userLogin, showAllUsers }
