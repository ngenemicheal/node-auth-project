const express = require("express");
const {
    getAllPosts,
    getSinglePost,
    createPost,
    updatePost,
    deletePost,
} = require("../controllers/postController");
const { identifier } = require("../middlewares/identification");

const router = express.Router();

router.get("/all-posts", getAllPosts);
router.get("/single-post", getSinglePost);
router.post("/create-post", identifier, createPost);
router.put("/update-post", identifier, updatePost);
router.delete("/delete-post", identifier, deletePost);

module.exports = router;
