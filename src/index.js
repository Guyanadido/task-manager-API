const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const tasksRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(tasksRouter)

app.listen(port, () => {
    console.log('server started on port ' + port)
}) 