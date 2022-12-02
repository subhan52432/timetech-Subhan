const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// @desc    Register a new user
// @route   POST /api/user
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
    console.log(req.body)
    const { whatsaapNumberId, employeeId, employeeName, userRole, companyId } = req.body
    const userExists = await User.findOne({ whatsaapNumberId })
    if (userExists) {
        return res.status(400).json({
            success: false,
            msg: 'User with this Whatsaap Number is already Exists.'
        })
    }
    const user = new User({
        whatsaapNumberId, 
        employeeId, 
        employeeName, 
        userRole, 
        companyId
    })
    // save user object
    user.save(function (err, user) {
        if (err) return next(err);
        res.status(201).json({
            success: true,
            msg: 'User Created Sucessfully.'
        });
    });
})

// @desc    Get all users
// @route   GET /api/user
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({})
    res.json(users)
  })

module.exports = {
    registerUser,
    getUsers
}