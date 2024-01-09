const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwk = require('jsonwebtoken')
const Task = require('./task')
//creaing a user schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true , 
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (validator.contains(value, 'password', {ignoreCase: false})) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('age must me greater than 0')
            }
        }
    }, 
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }], 
    avator: {
        type: Buffer,
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

//hashing the password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//delete all the user tasks when the user is removed
userSchema.pre('remove', async function(next) {
    const user = this 
    await Task.deleteMany({ owner: user._id })

    next()
})


//an instance method which returns a aith token  
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwk.sign({ _id: user.id.toString()}, process.env.TOKEN_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//filtering private profile 
userSchema.methods.toJSON = function() {
    const user = this 
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avator

    return userObject
}

//a model method getCredentials on user
userSchema.statics.getCredentials = async(email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('unable to connect')
    }

    return user
}

//creating a User model 
const User = mongoose.model('user', userSchema)

module.exports = User