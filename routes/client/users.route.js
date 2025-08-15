const express = require("express");

const router = express.Router();

const controller = require("../../controllers/client/users.controller");

router.get("/not-friend", controller.notFriend);

router.get("/request-friend", controller.requestFriend);

router.get("/accept-friend", controller.acceptFriend);

router.get("/friends", controller.friendList);
module.exports = router;
