const { default: mongoose } = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const postCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    parent_id: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    position: {
      type: Number,
      default: 1,
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
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

const PostCategory = mongoose.model(
  "PostCategory",
  postCategorySchema,
  "posts-category"
);

module.exports = PostCategory;
