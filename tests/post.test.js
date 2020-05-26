import '@babel/polyfill/noConflict'
import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, {
    userOne,
    postOne,
    postTwo
} from './utils/seedDatabase'

import getClient from './utils/getClient'
import {
    queryPosts,
    myPosts,
    updatePost,
    createPost,
    deletePost,
    subscribeToPosts
} from './utils/operations'

jest.setTimeout(30000)

const client = getClient()

beforeEach(seedDatabase)


test('Should expose published posts', async () => {

    const response = await client.query({
        query: queryPosts
    })

    expect(response.data.posts.length).toBe(1)
    expect(response.data.posts[0].published).toBe(true)
})

test('Should fetch users posts', async () => {

    const client = getClient(userOne.jwt)

    const {
        data
    } = await client.query({
        query: myPosts
    })

    expect(data.myPosts.length).toBe(2)
})

test('Should be able to update own post', async () => {
    const client = getClient(userOne.jwt)

    const variables = {
        id: postOne.post.id,
        data: {
            published: false
        }
    }

    const {
        data
    } = await client.mutate({
        mutation: updatePost,
        variables
    })

    const exists = await prisma.exists.Post({
        id: postOne.post.id,
        published: false
    })

    expect(data.updatePost.published).toBe(false)
    expect(exists).toBe(true)
})

test('Should be able to create own post', async () => {
    const client = getClient(userOne.jwt)

    const variables = {
        data: {
            title: 'My post 3',
            body: '',
            published: false
        }
    }

    const {
        data
    } = await client.mutate({
        mutation: createPost,
        variables
    })

    const exists = await prisma.exists.Post({
        id: data.createPost.id,
    })

    expect(data.createPost.title).toBe('My post 3')
    expect(data.createPost.body).toBe('')
    expect(data.createPost.published).toBe(false)
    expect(exists).toBe(true)
})

test('Should be able to delete own post', async () => {
    const client = getClient(userOne.jwt)

    const variables = {
        id: postTwo.post.id
    }

    await client.mutate({
        mutation: deletePost,
        variables
    })

    const exists = await prisma.exists.Post({
        id: postTwo.post.id
    })

    expect(exists).toBe(false)
})

test('Should subscribe to post', async (done) => {

    const client = getClient(userOne.jwt)

    client.subscribe({
        query: subscribeToPosts,
    }).subscribe({
        next(response) {
            expect(response.data.post.mutation).toBe('DELETED')
            done()
        }
    })

    await prisma.mutation.deletePost({
        where: {
            id: postOne.post.id
        }
    })
})