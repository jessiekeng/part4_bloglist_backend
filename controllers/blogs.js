const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// GET all blogs remains public and stays the same
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

// POST - Now uses request.user provided by userExtractor middleware
// controllers/blogs.js

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body
  const user = request.user // From userExtractor

  // 1. ADD THIS CHECK: If user is missing, return 401
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if (!title || !url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user._id // This was the line causing the crash
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

// DELETE - Secured: Only the creator can delete
blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user // From userExtractor
  
  // 1. Check if user was successfully extracted
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  // 2. Safeguard: If the blog has no user field at all (from old test data)
  if (!blog.user) {
    return response.status(401).json({ error: 'blog has no creator information' })
  }

  // 3. Perform the comparison
  if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ 
      error: 'unauthorized: only the creator can delete this blog' 
    })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// PUT - Update a blog (usually likes)
blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = { title, author, url, likes }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  
  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter