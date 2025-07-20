import * as Popper from "https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js";
// file upload preview
var upload = new FileUploadWithPreview("upload-images", {
  showDeleteButtonOnImages: true,
  text: {
    chooseFile: "Chọn ảnh",
    browse: "Duyệt",
    selectedCount: "Đã chọn",
  },
  presetFiles: [],
});
// end file upload preview
// CLIENT_SEND_MESSAGE
const formSendData = document.querySelector(".chat .inner-form");

if (formSendData) {
  formSendData.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = e.target.elements.content.value;
    const images = upload.cachedFileArray;
    if (content || images.length > 0) {
      socket.emit("CLIENT_SEND_MESSAGE", {
        content: content,
        images: images,
      });
      e.target.elements.content.value = "";
      upload.clearPreviewPanel(); // clear all selected images
      socket.emit("CLIENT_SEND_TYPING", "hidden");
    }
  });
}
// End CLIENT_SEND_MESSAGE

// SERVER_RETURN_MESSAGE
socket.on("SERVER_RETURN_MESSAGE", (data) => {
  const myId = document.querySelector(`[my-id]`).getAttribute("my-id");
  const body = document.querySelector(".chat .inner-body");
  const div = document.createElement("div");
  const elementListTyping = document.querySelector(".chat .inner-list-typing");
  let htmlFullName = "";
  let htmlContent = "";
  let htmlImages = "";
  if (myId === data.userId) {
    div.classList.add("inner-outgoing");
  } else {
    htmlFullName = `<div class="inner-name">${data.fullName}</div>`;
    div.classList.add("inner-incoming");
  }

  if (data.content) {
    htmlContent = `<div class="inner-content">${data.content}</div>`;
  }
  if (data.images.length > 0) {
    htmlImages += '<div class="inner-images">';

    for (const image of data.images) {
      htmlImages += `<img src="${image}">`;
    }

    htmlImages += "</div>";
  }

  div.innerHTML = `
    ${htmlFullName}
    ${htmlContent}
    ${htmlImages}
  `;

  if (elementListTyping) {
    body.insertBefore(div, elementListTyping);
  }

  const bodyChat = document.querySelector(".chat"); // <-- chọn đúng element có scroll
  if (bodyChat) {
    bodyChat.scrollTop = bodyChat.scrollHeight;
  }
  const gallery = new Viewer(div);
});
//END SERVER_RETURN_MESSAGE

// SCROLL Chat To Bottom
const bodyChat = document.querySelector(".chat"); // <-- chọn đúng element có scroll
if (bodyChat) {
  bodyChat.scrollTop = bodyChat.scrollHeight;
}

//END SCROLL Chat To Bottom

// SHOW ICON CHAT

// Show POPUP
const buttonIcon = document.querySelector(".button-icon");

if (buttonIcon) {
  const tooltip = document.querySelector(".tooltip");
  Popper.createPopper(buttonIcon, tooltip);

  buttonIcon.onclick = () => {
    tooltip.classList.toggle("shown");
  };
}
// END SHOW POPUP
let timeOut;
// SHOW TYPING

const showTyping = () => {
  socket.emit("CLIENT_SEND_TYPING", "show");
  clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    socket.emit("CLIENT_SEND_TYPING", "hidden");
  }, 3000);
};

//END SHOW TYPING
// INSERT ICON TO INPUT
const emojiPicker = document.querySelector("emoji-picker");

if (emojiPicker) {
  const inputChat = document.querySelector(
    ".chat .inner-form input[name='content']"
  );

  emojiPicker.addEventListener("emoji-click", (event) => {
    const icon = event.detail.unicode;
    inputChat.value = inputChat.value + icon;
    var end = inputChat.value.length;
    inputChat.setSelectionRange(end, end);
    inputChat.focus();
    showTyping();
  });
}
// END INSERT ICON TO INPUT

const inputChat = document.querySelector(
  ".chat .inner-form input[name='content']"
);

// INPUT KEYUP
inputChat.addEventListener("keyup", () => {
  showTyping();
});
// END INPUT KEYUP

// SEVER_RETURN_TYPING
socket.on("SERVER_RETURN_TYPING", (data) => {
  console.log(data);
});
// END SEVER_RETURN_TYPING

// END SHOW ICON CHAT

// SERVER_RETURN_TYPING
const elementListTyping = document.querySelector(".chat .inner-list-typing");
if (elementListTyping) {
  socket.on("SERVER_RETURN_TYPING", (data) => {
    console.log(data);
    if (data.type == "show") {
      const existTyping = elementListTyping.querySelector(
        `[user-id="${data.userId}"]`
      );

      if (!existTyping) {
        const boxTyping = document.createElement("div");
        boxTyping.classList.add("box-typing");
        boxTyping.setAttribute("user-id", data.userId);

        boxTyping.innerHTML = `
        <div class="inner-name">${data.fullName}</div>
        <div class="inner-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;

        elementListTyping.appendChild(boxTyping);
        const bodyChat = document.querySelector(".chat"); // <-- chọn đúng element có scroll
        if (bodyChat) {
          bodyChat.scrollTop = bodyChat.scrollHeight;
        }
      }
    } else {
      const boxTypingRemove = document.querySelector(
        `[user-id="${data.userId}"]`
      );
      if (boxTypingRemove) elementListTyping.removeChild(boxTypingRemove);
    }
  });
}

// END SERVER_RETURN_TYPING

// Preview Full Image
const bodyChatPreviewImage = document.querySelector(".chat .inner-body");
const gallery = new Viewer(bodyChatPreviewImage);
// End Preview Full Image
