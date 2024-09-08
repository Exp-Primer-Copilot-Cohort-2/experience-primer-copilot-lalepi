// Create web server
// Create a new comment
// Get all comments
// Get a comment by id
// Update a comment by id
// Delete a comment by id

// Dependencies
const express = require('express');
const Comment = require('../models/comment');
const auth = require('../middleware/auth');

// Create a new router
const router = new express.Router();

// Create a new comment
router.post('/comments', auth, async (req, res) => {
  const comment = new Comment({
    ...req.body,
    owner: req.user._id
  });

  try {
    await comment.save();
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all comments
router.get('/comments', auth, async (req, res) => {
  try {
    await req.user.populate('comments').execPopulate();
    res.send(req.user.comments);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a comment by id
router.get('/comments/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const comment = await Comment.findOne({ _id, owner: req.user._id });

    if (!comment) {
      return res.status(404).send();
    }

    res.send(comment);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a comment by id
router.patch('/comments/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['text'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const comment = await Comment.findOne({ _id: req.params.id, owner: req.user._id });

    if (!comment) {
      return res.status(404).send();
    }

    updates.forEach(update => comment[update] = req.body[update]);
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a comment by id
router.delete('/comments/:id', auth, async (req, res) => {
  try
