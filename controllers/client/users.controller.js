const User = require("../../models/user.model");
const usersSocket = require("../../sockets/client/users.socket");
const mongoose = require("mongoose");
module.exports.notFriend = async (req, res) => {
  try {
    // SOCKET IO
    usersSocket(res);
    // END SOCKET IO
    const myId = res.locals.user.id;

    const myUser = await User.findById(myId).select(
      "requestFriends friendList"
    );

    const requestFriendsIds = myUser.requestFriends || [];
    const friendListIds =
      myUser.friendList.map((friend) => friend.user_id) || [];

    // Hợp nhất các id
    const excludeIds = [...requestFriendsIds, ...friendListIds, myId];

    const listUser = await User.find({
      _id: { $nin: excludeIds },
      status: "active",
      deleted: false,
    }).select("fullName avatar");

    res.render("client/pages/users/not-friend", {
      pageTitle: "Danh sách người dùng",
      users: listUser,
    });
  } catch (error) {
    console.error("Error in notFriend controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.requestFriend = async (req, res) => {
  try {
    // SOCKET IO
    usersSocket(res);
    // END SOCKET IO
    const myId = res.locals.user.id;

    const myUser = await User.findById(myId).select("requestFriends");

    const requestFriendsIds = myUser.requestFriends;

    const listUser = await User.find({
      _id: { $in: requestFriendsIds },
      status: "active",
      deleted: false,
    }).select("fullName avatar");

    res.render("client/pages/users/request-friend", {
      pageTitle: "Lời mời đã gửi",
      users: listUser,
    });
  } catch (error) {
    console.error("Error in requestFriend controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.acceptFriend = async (req, res) => {
  try {
    // SOCKET IO
    usersSocket(res);
    // END SOCKET IO
    const myId = res.locals.user.id;

    const myUser = await User.findById(myId).select("acceptFriends");

    const acceptFriendsIds = myUser.acceptFriends;

    const listUser = await User.find({
      _id: { $in: acceptFriendsIds },
      status: "active",
      deleted: false,
    }).select("fullName avatar");

    res.render("client/pages/users/accept-friend", {
      pageTitle: "Yêu cầu kết bạn",
      users: listUser,
    });
  } catch (error) {
    console.error("Error in acceptFriend controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.friendList = async (req, res) => {
  try {
    usersSocket(res);

    const myId = res.locals.user.id;
    const myUser = await User.findById(myId).select("friendList");

    const friendIds = myUser.friendList.map(
      (friend) => new mongoose.Types.ObjectId(friend.user_id)
    );

    const listUser = await User.find({
      _id: { $in: friendIds },
      status: "active",
      deleted: false,
    }).select("fullName avatar");

    res.render("client/pages/users/friend", {
      pageTitle: "Danh sách bạn bè",
      users: listUser,
    });
  } catch (error) {
    console.error("Error in friendList controller:", error);
    res.status(500).send("Internal Server Error");
  }
};
