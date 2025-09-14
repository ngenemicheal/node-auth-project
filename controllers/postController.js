const {
    createPostSchema,
    updatePostSchema,
} = require("../middlewares/validator");
const Post = require("../models/postsModel");

exports.getAllPosts = async (req, res) => {
    const { page } = req.query;
    const postsPerPage = 10;

    try {
        let pageNum = 0;
        if (page <= 0) {
            pageNum = 0;
        } else {
            pageNum = page - 1;
        }

        const result = await Post.find()
            .sort({ createdAt: -1 })
            .skip(pageNum * postsPerPage)
            .limit(postsPerPage)
            .populate({ path: "user", select: "email" });

        return res
            .status(200)
            .json({ success: true, message: "All posts", data: result });
    } catch (error) {
        console.log(error);
    }
};

exports.getSinglePost = async (req, res) => {
    const { postId } = req.query;

    if (!postId) {
        return res
            .status(404)
            .json({ success: false, message: "PostId is required" });
    }

    try {
        const existingPost = await Post.findOne({ _id: postId }).populate({
            path: "user",
            select: "email",
        });

        if (!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Single post",
            data: existingPost,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createPost = async (req, res) => {
    const { title, description } = req.body;
    const { userId } = req.user;

    try {
        const { error, value } = createPostSchema.validate({
            title,
            description,
            userId,
        });

        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const result = await Post.create({
            title,
            description,
            user: userId,
        });

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: result,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.updatePost = async (req, res) => {
    const { title, description } = req.body;
    const { postId } = req.query;
    const { userId } = req.user;

    try {
        const { error, value } = updatePostSchema.validate(
            {
                title,
                description,
                userId,
            },
            { stripUnknown: true }
        );

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        const existingPost = await Post.findOne({ _id: postId });

        if (!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }

        if (existingPost.user.toString() !== userId) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized" });
        }

        // existingPost.title = title;
        // existingPost.description = description;
        // only apply fields except userId
        Object.keys(value).forEach((key) => {
            if (key !== "userId") {
                existingPost[key] = value[key];
            }
        });
        const result = await existingPost.save();

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: result,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.deletePost = async (req, res) => {
    const { postId } = req.query;
    const { userId } = req.user;

    try {
        const existingPost = await Post.findOne({ _id: postId });

        if (!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }

        if (existingPost.user.toString() !== userId) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized" });
        }

        await Post.deleteOne({ _id: postId });

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });
    } catch (error) {
        console.log(error);
    }
};
