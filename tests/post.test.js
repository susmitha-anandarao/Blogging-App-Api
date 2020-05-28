import '@babel/polyfill/noConflict'
import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, {
    userOne,
    userTwo,
    postOne,
    postTwo
} from './utils/seedDatabase'

import getClient from './utils/getClient'
import {
    queryPosts,
    queryPost,
    myPosts,
    updatePost,
    createPost,
    deletePost,
    subscribeToPosts
} from './utils/operations'

jest.setTimeout(50000)

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

test('Should not be able to update another users post', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        id: postOne.post.id,
        data: {
            published: false
        }
    }

    await expect(client.mutate({
            mutation: updatePost,
            variables
        })
    ).rejects.toThrow()
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

test('Should not be able to delete another users post', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        id: postTwo.post.id
    }

    await expect(client.mutate({
            mutation: deletePost,
            variables
        })
    ).rejects.toThrow()
})

test('Should fetch published post by id ', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        id: postOne.post.id
    }

    const { data } = await client.query({
        query: queryPost,
        variables
    })

    expect(data.post.id).toBe(postOne.post.id)
})

test('Should fetch own post by id', async () => {
    const client = getClient(userOne.jwt)

    const variables = {
        id: postTwo.post.id
    }

    const { data } = await client.query({
        query: queryPost,
        variables
    })

    expect(data.post.id).toBe(postTwo.post.id)
})

test('Should not fetch draft post from other user', async () => {
    const client = getClient(userTwo.jwt)

    const variables = {
        id: postTwo.post.id
    }

    await expect(client.query({
            query: queryPost,
            variables
        })
    ).rejects.toThrow()
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

