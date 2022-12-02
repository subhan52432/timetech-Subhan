const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
    {
        whatsaapNumberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        takenBy:{
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
        category:{
            type: 'string',
            default: ''
        },
        latitude:{
            type: 'string',
            default: ''
        },
        longitude:{
            type: 'string',
            default: ''
        },
        Image:{
            type: 'string',
            default: ''
        }
    }
)

module.exports = mongoose.model('Attendance', attendanceSchema)