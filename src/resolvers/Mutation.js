import bcrypt from 'bcryptjs'
import getUserId from '../utils/getUserId'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'

const Mutation = {
    async createUser(parent, args, {
        prisma
    }, info) {

        const password = await hashPassword(args.data.password)

        const user = await prisma.mutation.createUser({
            data: {
                ...args.data,
                password
            }
        })

        return {
            user,
            token: generateToken(user.id)
        }
    },
    async login(parent, args, {
        prisma
    }, info) {
        const user = await prisma.query.user({
            where: {
                email: args.data.email
            }
        })

        if (!user) {
            throw new Error('Unable to Login')
        }

        const isMatch = await bcrypt.compare(args.data.password, user.password)

        if (!isMatch) {
            throw new Error('Unable to Login')
        }

        return {
            user,
            token: generateToken(user.id)
        }
    },
    async deleteUser(parent, args, {
        prisma,
        request
    }, info) {
        const userId = getUserId(request)

        return prisma.mutation.deleteUser({
            where: {
                id: userId
            }
        }, info)
    },
    async updateUser(parent, args, {
        prisma,
        request
    }, info) {
        const userId = getUserId(request)

        if (typeof args.data.password === 'string') {
            args.data.password = await hashPassword(args.data.password)
        }

        return prisma.mutation.updateUser({
            data: args.data,
            where: {
                id: userId
            }
        }, info)
    },
    async createPost(parent, args, {
        prisma,
        request
    }, info) {
        const userId = getUserId(request)

        return prisma.mutation.createPost({
            data: {
                title: args.data.title,
                body: args.data.body,
                published: args.data.published,
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        }, info)
    },
    async deletePost(parent, args, {
        prisma,
        request
    }, info) {
        const userId = getUserId(request)

        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            }
        })

        if (!postExists) {
            throw new Error('Unable to delete post')
        }

        return prisma.mutation.deletePost({
            where: {
                id: args.id
            }
        }, info)
    },
    async updatePost(parent, args, {
        prisma,
        request
    }, info) {
        const {
            id,
            data
        } = args

        const userId = getUserId(request)

        const postExists = await prisma.exists.Post({
            id,
            author: {
                id: userId
            }
        })

        const isPublished = await prisma.exists.Post({
            id,
            published: true
        })

        if (!postExists) {
            throw new Error('Unable to update post')
        }

        if (isPublished && !args.data.published) {
            await prisma.mutation.deleteManyComments({
                where: {
                    post: {
                        id
                    }
                }
            })
        }

        return prisma.mutation.updatePost({
            data,
            where: {
                id
            }
        }, info)
    },
    async createComment(parent, args, {
        prisma,
        request
    }, info) {
        const userId = getUserId(request)

        const postExists = await prisma.exists.Post({
            published: true,
            id: args.data.post
        })

        if (!postExists) {
            throw new Error('Unable to find post')
        }

        return prisma.mutation.createComment({
            data: {
                text: args.data.text,
                author: {
                    connect: {
                        id: userId
                    }
                },
                post: {
                    connect: {
                        id: args.data.post
                    }
                }
            }
        }, info)
    },
    async deleteComment(parent, args, {
        prisma,
        request
    }, info) {

        const {
            id
        } = args

        const userId = getUserId(request)

        const commentExists = await prisma.exists.Comment({
            id,
            author: {
                id: userId
            }
        })

        const myPost = await prisma.exists.Comment({
            id,
            post: {
                author: {
                    id: userId
                }
            }
        })

        if (myPost || commentExists) {
            return prisma.mutation.deleteComment({
                where: {
                    id
                }
            }, info)
        } else {
            throw new Error('Unable to delete comment')
        }
    },
    async updateComment(parent, args, {
        prisma,
        request
    }, info) {

        const {
            id,
            data
        } = args

        const userId = getUserId(request)

        const commentExists = await prisma.exists.Comment({
            id,
            author: {
                id: userId
            }
        })

        if (!commentExists) {
            throw new Error('Unable to update comment')
        }

        return prisma.mutation.updateComment({
            data,
            where: {
                id
            }
        }, info)
    }

}

export {
    Mutation as
    default
}