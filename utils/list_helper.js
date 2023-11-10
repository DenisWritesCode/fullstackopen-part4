const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

// return total sum of likes.
const totalLikes = (blogs) => {
  return blogs.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.likes
  }, 0)
}

// return blog with most likes
const favoriteBlog = (blogs) => {
  if (!blogs.length) return 'No Blogs'
  const mappedBlogs = blogs.map((blog) => {
    return {
      title: blog.title,
      author: blog.author,
      likes: blog.likes,
    }
  })

  // sort. Return positive value if (sort(a,b)) a < b.
  mappedBlogs.sort((blog1, blog2) => {
    return blog1.likes < blog2.likes ? 1 : -1
  })

  return mappedBlogs[0]
}

// return author with most blogs
const mostBlogs = (blogs) => {
  if (!blogs.length) return 'No Blogs'
  const sortedBlogs = _.countBy(blogs, 'author')
  const authorWithMostBlogs = _.maxBy(
    Object.keys(sortedBlogs),
    (author) => sortedBlogs[author]
  )

  return {
    author: authorWithMostBlogs,
    blogs: sortedBlogs[authorWithMostBlogs],
  }
}

// return author whose blogs have the most likes
const mostLikes = (blogs) => {
  if (!blogs.length) return 'No Blogs'
  const sortedBlogs = _.groupBy(blogs, 'author')

  const authorWithLikes = Object.keys(sortedBlogs).map((authorForBlog) => {
    const likes = sortedBlogs[authorForBlog].reduce(
      (acc, blog) => acc + blog.likes,
      0
    )
    return {
      author: authorForBlog,
      likes,
    }
  })

  return _.maxBy(authorWithLikes, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
