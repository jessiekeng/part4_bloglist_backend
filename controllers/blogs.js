const blogsRouter = require('express').Router() 
const Blog = require('../models/blog')          

// Now your routes will work
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

// DELETE a single blog post
blogsRouter.delete('/:id', async (request, response) => {
  // request.params.id captures the ID from the URL string
  await Blog.findByIdAndDelete(request.params.id)
  
  // 204 means the request was successful, but there is no content to send back
  response.status(204).end()
})

// PUT (Update) a single blog post
blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  // { new: true } tells Mongoose to return the modified document instead of the original
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  
  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter // Don't forget this at the bottom!