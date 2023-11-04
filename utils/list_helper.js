const dummy = (blogs) => {
  return 1;
};

// return total sum of likes.
const totalLikes = (blogs) => {
  return blogs.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.likes;
  }, 0);
};

// return blog with most likes
const favoriteBlog = (blogs) => {
  const favoriteBlog = [];
  const mappedBlogs = blogs.map((blog) => {
    return {
      title: blog.title,
      author: blog.author,
      likes: blog.likes,
    };
  });

  // sort. Return positive value if (sort(a,b)) a < b.
  mappedBlogs.sort((blog1, blog2) => {
    return blog1.likes < blog2.likes ? 1 : -1;
  });

  return mappedBlogs[0];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
