const mongoose = require('mongoose')

//creating the connection 
mongoose.connect(process.env.MONGO_URL).then(result => {
    console.log('success') 
}).catch(err => {
    console.log('error')
    console.log(err)
})