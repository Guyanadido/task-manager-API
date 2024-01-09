const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendAccountCancelEmail} = require('../emails/account')
//endpont for creating users
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user, token})
    } catch(e) {
        res.status(500).send(e)
        console.log(e)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.getCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        
        res.status(400).send(e)
    }
})

router.post('/user/logout', auth ,async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
     
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//fetching all users
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//updateing a user info
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every(update => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({'error' : 'invalid updates'})
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

//deleting user 
router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne()
        sendAccountCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})

const avators = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cd) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cd(new Error('please upload an image'))
        }

        cd(undefined, true)
    }
})

//creating and saving avator for user 
router.post('/users/me/avator', auth, avators.single('avator'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avator = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//deleting the avator for a user 
router.delete('/users/me/avator', auth, (req, res) => {
    req.user.avator = undefined
    req.user.save()
    res.send()
})

//getting the users avator
router.get('/users/:id/avator', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avator) {
            throw new Error()
        }

        res.set('content-Type', 'image/jpg')
        res.send(user.avator)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router