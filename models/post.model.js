const { default: mongoose } = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    category: {
      type: String,
      default: "",
    },
    featured: {
      type: String,
      enum: ["hot", "normal"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    position: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      account_id: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    deletedBy: {
      account_id: String,
      deletedAt: Date,
    },
    updatedBy: [
      {
        account_id: String,
        updatedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema, "posts");

module.exports = Post;
