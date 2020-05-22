import jwt from 'jsonwebtoken'

const secret = 'thisisasecret'

const generateToken = (userId) => {
    console.log(userId)
    return jwt.sign({
        userId
    }, secret, {
        expiresIn: '7 days'
    })
}

export {
    generateToken as
    default
}