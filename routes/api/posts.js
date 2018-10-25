const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Post = require('../../Models/Post');
const Profile = require('../../models/Profile');
const validatePostInput = require('../../validation/post');

// @route   GET api/posts
// @desc    Get post
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostfound: 'no posts fond' }));
});

// @route   GET api/posts/:id
// @desc    Get post
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostfound: 'no post fond with that ID' })
    );
});

// @route   POST api/posts/
// @desc    Create post
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      if (errors) {
        return res.status(400).json(errors);
      }
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

// @route   Delete api/posts/
// @desc    Delete post
// @access  Private

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'user not authorized' });
          }
          //Delete
          post.remove().then(() => res.json({ success: 'true' }));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

// @route   Post api/posts/like/:id
// @desc    Like post
// @access  Private

router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(
              like => like.user.toString() === req.user.id.length > 0
            )
          ) {
            res
              .send(400)
              .json({ alreadyliked: 'you have already liked this post' });
          }
          //Add user id to array
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);
// @route   Post api/posts/unlike/:id
// @desc    unike post
// @access  Private

router.delete(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(
              like => (like.user.toString() === req.user.id).length === 0
            )
          ) {
            res
              .send(400)
              .json({ alreadyliked: 'you have not yet liked this post' });
          }
          //Add user id to array
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

// @route   Post api/posts/comment/:id
// @desc    comment post
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      if (errors) {
        return res.status(400).json(errors);
      }
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        //Add to comments array
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'no post found' }));
  }
);
// @route   Post api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }
        //Get remove index
        const removeIndex = post.commnets
          .map(item => item._id.toString())
          .indexOf(req.params._id);
        //splice it from the array
        psot.comments.splice(removeIndex, 1);
        psot.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'no post found' }));
  }
);
module.exports = router;
