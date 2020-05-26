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

const postOne = {
    input: {
        title: 'Post 1',
        body: 'Body 1',
        published: true
    },
    post: undefined
}

const postTwo = {
    input: {
        title: 'Post 2',
        body: '',
        published: false
    },
    post: undefined
}

const commentOne = {
    input: {
        text: 'My comment'
    },
    comment: undefined
}

const commentTwo = {
    input: {
        text: 'Replied comment'
    },
    comment: undefined
}

const seedDatabase = async () => {
    await prisma.mutation.deleteManyComments()
    await prisma.mutation.deleteManyPosts()
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

    postOne.post = await prisma.mutation.createPost({
        data: {
            ...postOne.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    })
    postTwo.post = await prisma.mutation.createPost({
        data: {
            ...postTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    })

    commentOne.comment = await prisma.mutation.createComment({
        data: {
            ...commentOne.input,
            author: {
                connect: {
                    id: userTwo.user.id
                }
            },
            post: {
                connect: {
                    id: postOne.post.id
                }
            }
        }
    })

    commentTwo.comment = await prisma.mutation.createComment({
        data: {
            ...commentTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            },
            post: {
                connect: {
                    id: postOne.post.id
                }
            }
        }
    })
}

export {
    seedDatabase as
    default, userOne, userTwo, postOne, postTwo, commentOne, commentTwo
}