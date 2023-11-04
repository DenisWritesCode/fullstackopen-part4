const dummy = (blogs) => {
  return 1;
};

// return total sum of likes.
const totalLikes = (blogs) => {
  return blogs.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.likes;
  }, 0);
};

module.exports = {
  dummy,
  totalLikes,
};
