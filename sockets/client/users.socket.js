const User = require("../../models/user.model");

module.exports = (res) => {
  const myId = res.locals.user.id;
  _io.once("connection", (socket) => {
    // Chức năng kết bạn
    socket.on("CLIENT_ADD_FRIEND", async (userRequestId) => {
      try {
        if (myId === userRequestId) {
          socket.emit("SERVER_ERROR", {
            message: "Không thể gửi yêu cầu kết bạn cho chính mình",
          });
          return;
        }

        const existRequestIdAForB = await User.findOne({
          _id: userRequestId,
          acceptFriends: myId,
        });
        if (!existRequestIdAForB) {
          await User.updateOne(
            { _id: userRequestId },
            { $push: { acceptFriends: myId } }
          );
        }

        const existRequestBInA = await User.findOne({
          _id: myId,
          requestFriends: userRequestId,
        });
        if (!existRequestBInA) {
          await User.updateOne(
            { _id: myId },
            { $push: { requestFriends: userRequestId } }
          );
        }
      } catch (error) {
        socket.emit("SERVER_ERROR", {
          message: "Lỗi khi xử lý yêu cầu kết bạn",
          error: error.message,
        });
      }
    });

    // Chức năng hủy kết bạn khi đã gửi kết bạn trước đó
    socket.on("CLIENT_CANCEL_FRIEND", async (userCancelId) => {
      try {
        if (myId === userCancelId) {
          socket.emit("SERVER_ERROR", {
            message: "Không thể hủy kết bạn cho chính mình",
          });
          return;
        }

        // Xóa myId khỏi acceptFriends của userCancelId
        const existRequestIdAForB = await User.findOne({
          _id: userCancelId,
          acceptFriends: myId,
        });
        if (existRequestIdAForB) {
          await User.updateOne(
            { _id: userCancelId },
            { $pull: { acceptFriends: myId } }
          );
        }

        // Xóa userCancelId khỏi requestFriends của myId
        const existRequestBInA = await User.findOne({
          _id: myId,
          requestFriends: userCancelId,
        });
        if (existRequestBInA) {
          await User.updateOne(
            { _id: myId },
            { $pull: { requestFriends: userCancelId } }
          );
        }
      } catch (error) {
        socket.emit("SERVER_ERROR", {
          message: "Lỗi khi hủy yêu cầu kết bạn",
          error: error.message,
        });
      }
    });
    //  Chức năng hủy yêu cầu kết bạn
    socket.on("CLIENT_CANCEL_FRIEND_REQUEST", async (userIdA) => {
      try {
        if (myId === userIdA) {
          socket.emit("SERVER_ERROR", {
            message: "Không thể hủy yêu cầu cho chính mình",
          });
          return;
        }

        // Xóa lời mời của A ra khỏi requestFriends của A
        await User.updateOne(
          { _id: userIdA, requestFriends: myId },
          { $pull: { requestFriends: myId } }
        );

        // Xóa id của A ra khỏi acceptFriends của B
        await User.updateOne(
          { _id: myId, acceptFriends: userIdA },
          { $pull: { acceptFriends: userIdA } }
        );

        // Xóa id của A ra khỏi requestFriends của B
        await User.updateOne(
          { _id: myId, requestFriends: userIdA },
          { $pull: { requestFriends: userIdA } }
        );

        // Xóa id của B ra khỏi acceptFriends của A
        await User.updateOne(
          { _id: userIdA, acceptFriends: myId },
          { $pull: { acceptFriends: myId } }
        );

        socket.emit("SERVER_FRIEND_REQUEST_CANCELLED", { userId: userIdA });
      } catch (error) {
        socket.emit("SERVER_ERROR", {
          message: "Lỗi khi hủy yêu cầu kết bạn",
          error: error.message,
        });
      }
    });
    //  Chức năng đồng ý kết bạn
    socket.on("CLIENT_ACCEPT_FRIEND", async (userIdA) => {
      try {
        if (myId === userIdA) {
          socket.emit("SERVER_ERROR", {
            message: "Không đồng ý kết bạn với chính mình",
          });
          return;
        }

        // Xóa lời mời của A ra khỏi requestFriends của A
        await User.updateOne(
          { _id: userIdA, requestFriends: myId },
          { $pull: { requestFriends: myId } }
        );

        // Xóa id của A ra khỏi acceptFriends của B
        await User.updateOne(
          { _id: myId, acceptFriends: userIdA },
          { $pull: { acceptFriends: userIdA } }
        );

        // Xóa id của A ra khỏi requestFriends của B
        await User.updateOne(
          { _id: myId, requestFriends: userIdA },
          { $pull: { requestFriends: userIdA } }
        );

        // Xóa id của B ra khỏi acceptFriends của A
        await User.updateOne(
          { _id: userIdA, acceptFriends: myId },
          { $pull: { acceptFriends: myId } }
        );

        // Thêm vào listFriend của A id của B
        await User.updateOne(
          { _id: userIdA },
          { $push: { friendList: { user_id: myId } } }
        );

        // Thêm vào listFriend của B id của A
        await User.updateOne(
          { _id: myId },
          { $push: { friendList: { user_id: userIdA } } }
        );
        socket.emit("SERVER_FRIEND_ACCEPT", { userId: userIdA });
      } catch (error) {
        socket.emit("SERVER_ERROR", {
          message: "Lỗi khi đồng ý kết bạn",
          error: error.message,
        });
      }
    });
  });
};
