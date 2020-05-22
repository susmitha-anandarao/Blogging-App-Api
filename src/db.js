const users = [{
    id: '1',
    name: 'Susie',
    email: 'susie@example.com',
    age: 29
}, {
    id: '2',
    name: 'Aj',
    email: 'aj@example.com'
}, {
    id: '3',
    name: 'Su',
    email: 'su@example.com'
}]

// Demo post data
const posts = [{
    id: '4',
    title: 'Title 1',
    body: '',
    published: false,
    author: "1"
}, {
    id: '5',
    title: 'Title 2',
    body: 'Body 2',
    published: true,
    author: '2'
}, {
    id: '6',
    title: 'Title 3',
    body: 'Body 3',
    published: false,
    author: '3'
}]

const comments = [{
    id: '7',
    text: 'Comment 1',
    author: '1',
    post: '4'
}, {
    id: '8',
    text: 'Comment 2',
    author: '2',
    post: '4'
}, {
    id: '9',
    text: 'Comment 3',
    author: '2',
    post: '5'
}, {
    id: '10',
    text: 'Comment 4',
    author: '3',
    post: '5'
}]

const db = {
    users,
    posts,
    comments
}

export {
    db as
    default
}