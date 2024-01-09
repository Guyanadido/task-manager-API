const Mailjet = require('node-mailjet')

const mailjet = Mailjet.apiConnect(
    process.env.SECRET_KEY,
    process.env.API_KEY
)

const sendWelcomeEmail = (email, name) => {
    mailjet.post('send', {version: 'v3.1'}).request({
        Messages: [
            {
                From: {
                    Email: 'guyanadido@gmail.com',
                    Name: 'Guyo'
                }, 
                To: [
                    {
                        Email: email,
                        Name: name
                    }
                ],
                Subject: 'Thanks fofr joining in',
                TextPart: `Welcome to the app, ${name}, Let me know how you get along with it`
            }
        ]
    })
}

const sendAccountCancelEmail = (email, Name) => {
    mailjet.post('send', {version: 'v3.1'}).request({
        Messages: [
            {
                from: {
                    Email: 'guyanadido@gmail.com',
                    Name: 'Guyo'
                }, 
                To: [
                    {
                        Email: 'guyanadido@gmail.com',
                        Name: 'Guyo',
                    }
                ],
                Subject: 'Go to He**',
                textPart: `its official ${Name}, you are unsubscribed`,
            }
        ]
    })
}

module.exports = {
    sendWelcomeEmail,
    sendAccountCancelEmail,
}