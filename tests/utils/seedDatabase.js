import bcrypt from 'bcryptjs'
import prisma from '../../src/prisma'
import jwt from 'jsonwebtoken'

const userOne = {
    input: {
        name: 'Jess',
        email: 'Jess@example.com',
        password: bcrypt.hashSync('pass12345')
    },
    user: undefined,
    jwt: undefined
}

const userTwo = {
    input: {
        name: 'Jack',
        email: 'jack@example.com',
        password: bcrypt.hashSync('pass12345')
    },
    user: undefined,
    jwt: undefined
}

const seedDatabase = async () => {
    await prisma.mutation.deleteManyUsers()

    userOne.user = await prisma.mutation.createUser({
        data: userOne.input
    })

    userOne.jwt = jwt.sign({
        userId: userOne.user.id
    }, process.env.JWT_SECRET)

    userTwo.user = await prisma.mutation.createUser({
        data: userTwo.input
    })

    userTwo.jwt = jwt.sign({
        userId: userTwo.user.id
    }, process.env.JWT_SECRET)
}

export {
    seedDatabase as
    default, userOne, userTwo
}