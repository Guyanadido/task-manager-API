const mongoose = require('mongoose')

//creating task scheam 
const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
    },

    completed: {
        type: Boolean,
        required: false,
        default: false,
    }, 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }
}, {
    timestamps: true
})

//creatinf a tasks model 
const Task = mongoose.model('Tasks', taskSchema)

module.exports = Task