import '@babel/polyfill/noConflict'
import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, {
    userTwo,
    postOne,
    commentOne,
    commentTwo,
    postTwo,
    userOne
} from './utils/seedDatabase'

import getClient from './utils/getClient'
import {
    queryComments,
    createComment,
    updateComment,
    deleteComment,
    subscribeToComments
} from './utils/operations'

jest.setTimeout(50000)

beforeEach(seedDatabase)

const client = getClient()

test('Should be able to delete own comment', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        id: commentOne.comment.id
    }

    await client.mutate({
        mutation: deleteComment,
        variables
    })

    const exists = await prisma.exists.Comment({
        id: commentOne.comment.id
    })

    expect(exists).toBe(false)
})

test('Should not delete other users comment', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        id: commentTwo.comment.id
    }

    await expect(client.mutate({
        mutation: deleteComment,
        variables
    })).rejects.toThrow()
})

test('Should require authentication to create a comment', async () => {
    const variables = {
        id: commentTwo.comment.id
    }

    await expect(client.mutate({
        mutation: deleteComment,
        variables
    })).rejects.toThrow()
})

test('Should fetch post comments', async () => {
    const response = await client.query({
        query: queryComments
    })

    expect(response.data.comments.length).toBe(2)
})

test('Should create a new comment', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        data: {
            text: 'Veery good',
            post: postOne.post.id
        }
    }

    const { data } = await client.mutate({
        mutation: createComment,
        variables
    })

    const exists = await prisma.exists.Comment({
        id: data.createComment.id,
    })

    expect(data.createComment.text).toBe('Veery good')
})

test('Should require authentication to create a comment', async () => {
    const variables = {
        data: {
            text: 'Veery good',
            post: postOne.post.id
        }
    }

    await expect(client.mutate({
            mutation: createComment,
            variables
        })
    ).rejects.toThrow()
})

test('Should not create comment on draft post', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        data: {
            text: 'Veery good',
            post: postTwo.post.id
        }
    }

    await expect(client.mutate({
        mutation: createComment,
        variables
    })).rejects.toThrow()
})

test('Should update comment', async () => {
    const client = getClient(userOne.jwt)

    const variables = {
        id: commentTwo.comment.id,
        data: {
            text: 'Very good',
        }
    }

    const { data } = await client.mutate({
        mutation: updateComment,
        variables
    })

    const exists = await prisma.exists.Comment({
        id: data.updateComment.id,
    })

    expect(data.updateComment.text).toBe('Very good')
})

test('Should not update another users comment', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        id: commentTwo.comment.id,
        data: {
            text: 'Very good',
        }
    }

    await expect(client.mutate({
            mutation: updateComment,
            variables
        })
    ).rejects.toThrow()
})

test('Should require authentication to update a comment', async () => {
    const variables = {
        id: commentTwo.comment.id,
        data: {
            text: 'Very good',
        }
    }

    await expect(client.mutate({
            mutation: updateComment,
            variables
        })
    ).rejects.toThrow()
})

test('Should subscribe to comments for a post', async (done) => {

    const client = getClient(userTwo.jwt)

    const variables = {
        postId: postOne.post.id
    }

    client.subscribe({
        query: subscribeToComments,
        variables
    }).subscribe({
        next(response) {
            expect(response.data.comment.mutation).toBe('DELETED')
            done()
        }
    })

    await prisma.mutation.deleteComment({
        where: {
            id: commentOne.comment.id
        }
    })
})