var socket = io();

socket.on("SERVER_SEND_SOCKET_ID", (data) => {
  console.log("message: " + data);
  const elementSocketId = document.querySelector("#socket-id");
  elementSocketId.innerHTML = data;
});

var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("CLIENT_SEND_MESSAGE", input.value);
    input.value = "";
  }
});

socket.on("SERVER_RETURN_MESSAGE", (data) => {
  console.log("message: " + data);
});
