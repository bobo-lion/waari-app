const Like = require("./like.model");

//dayjs
const dayjs = require("dayjs");

//import model
const User = require("../user/user.model");
const Comment = require("../comment/comment.model");

//create LikeAndDislike for comment
exports.likeAndDislike = async (req, res) => {
  try {
    if (req.body.userId && req.body.commentId) {
      const user = await User.findById(req.body.userId);
      const comment = await Comment.findById(req.body.commentId);

      if (!user) return res.status(200).json({ status: false, message: "User Does Not Exist!!" });

      if (!comment) return res.status(200).json({ status: false, message: "Comment Does Not Exist!!" });

      const likeComment = await Like.findOne({
        $and: [
          {
            userId: user._id,
            commentId: comment._id,
          },
        ],
      });

      const comment_ = await User.findOne({ _id: comment.userId });

      //dislike
      if (likeComment) {
        await Like.deleteOne({
          $and: [
            {
              userId: user._id,
              commentId: comment._id,
            },
          ],
        });

        if (comment_.like > 0) {
          comment_.like -= 1;
          await comment_.save();
        }

        if (comment.like > 0) {
          comment.like -= 1;
          await comment.save();
        }

        return res.status(200).send({
          status: true,
          message: "Comment dislike successfully!!",
          isLike: false,
        });
      } else {
        //like
        const likeData = {
          userId: user._id,
          commentId: comment._id,
        };

        const like = new Like(likeData);

        like.save(async (error) => {
          if (error) {
            return res.status(200).json({
              status: false,
              error: error.message || "Server Error!!",
            });
          } else {
            if (req.body.userId.toString() == req.body.commentId.toString()) comment_.like += 1;
            await comment_.save();

            comment.like += 1;
            await comment.save();
          }
        });

        return res.status(200).send({
          status: true,
          message: "Comment Like successfully!!",
          isLike: true,
        });
      }
    } else {
      return res.status(200).json({
        status: false,
        message: "Oops ! Invalid details!!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//get comment likes
exports.index = async (req, res) => {
  try {
    if (!req.query.commentId) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const commentExist = await Comment.findById(req.query.commentId);
    if (!commentExist) return res.status(200).json({ status: false, message: "Comment Does not found!!" });

    const like = await Like.find({ commentId: commentExist._id }).populate("userId commentId").sort({ createdAt: -1 });

    if (req.query.type === "ADMIN") {
      const likes = await like.map((data) => ({
        _id: data._id,
        userId: data.userId ? data.userId._id : "",
        commentId: data.commentId ? data.commentId._id : "",
        like: data.commentId ? data.commentId.like : "",
      }));

      return res.status(200).json({ status: true, message: "Successful!!", like: likes });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
