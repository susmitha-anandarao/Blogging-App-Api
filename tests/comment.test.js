import '@babel/polyfill/noConflict'
import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, {
    userTwo,
    postOne,
    commentOne,
    commentTwo
} from './utils/seedDatabase'

import getClient from './utils/getClient'
import {
    deleteComment,
    subscribeToComments
} from './utils/operations'

jest.setTimeout(30000)

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