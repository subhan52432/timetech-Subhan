const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        whatsaapNumberId: {
            type: 'string',
            required: true,
            unique: true
        },
        employeeId:{
            type: 'string',
            default: ''
        },
        employeeName:{
            type: 'string',
            default: ''
        },
        userRole:{
            type: 'string',
            default: ''
        },
        companyId:{
            type: 'string',
            default: ''
        }
    }
)

module.exports = mongoose.model('User', userSchema)