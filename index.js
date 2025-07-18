const express = require("express");

const path = require("path");

const methodOverride = require("method-override");

const bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");

const session = require("express-session");

const flash = require("express-flash");

const moment = require("moment");

const http = require("http");

const { Server } = require("socket.io");

require("dotenv").config();

const database = require("./config/database");

const systemConfig = require("./config/system");

const routeAdmin = require("./routes/admin/index.route");
const route = require("./routes/client/index.route");

database.connect();

const app = express();

const port = process.env.PORT;

// SOCKET IO
const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});

//END SOCKET IO
app.use(methodOverride("_method"));

//parse application /x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

//Flash

app.use(cookieParser("Az09occhodop")); //mã hóa
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
//End FLash

//Tiny Mce
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);
//End Tiny Mce

//APP locals variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;
app.use(express.static(`${__dirname}/public`));
// Routes
routeAdmin(app);
route(app);

app.use((req, res, next) => {
  res.status(404).render("client/pages/errors/404", {
    pageTitle: "404 Not Found",
  });
});

server.listen(port, () => {
  console.log("Ứng dụng đang lắng nghe port" + port);
});
