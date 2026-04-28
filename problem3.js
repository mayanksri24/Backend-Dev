const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

app.use(session({
  secret: 'auth-secret',
  resave: false,
  saveUninitialized: false
}));

const users = [];
const posts = [];

/*
  Authentication middleware
  Checks if user is logged in via session
*/
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }
  next();
};

/*
  Role-based authorization middleware
*/
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.session.user.role !== role) {
      return res.status(403).json({ message: "Forbidden. Insufficient role." });
    }

    next();
  };
};

/*
  Resource ownership or moderator check
*/
const isOwnerOrModerator = (req, res, next) => {
  const { id } = req.params;

  const post = posts.find(p => p.id === parseInt(id));

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const user = req.session.user;

  if (post.userId !== user.id && user.role !== 'moderator') {
    return res.status(403).json({ message: "Access denied" });
  }

  req.post = post;
  next();
};

/*
  Create a post
*/
app.post('/posts', isAuthenticated, (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  const newPost = {
    id: posts.length + 1,
    content,
    userId: req.session.user.id
  };

  posts.push(newPost);

  res.status(201).json({
    message: "Post created",
    post: newPost
  });
});

/*
  Update a post
*/
app.put('/posts/:id', isAuthenticated, isOwnerOrModerator, (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  req.post.content = content;

  res.json({
    message: "Post updated",
    post: req.post
  });
});

/*
  Delete a post (moderator only)
*/
app.delete('/posts/:id', isAuthenticated, requireRole('moderator'), (req, res) => {
  const { id } = req.params;

  const index = posts.findIndex(p => p.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  posts.splice(index, 1);

  res.json({ message: "Post deleted" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});