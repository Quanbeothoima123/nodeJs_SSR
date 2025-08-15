// Chức năng kết bạn/ hủy/ đồng ý/ hủy yêu cầu kết bạn
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".btn-friend");
  if (!btn) return;

  const status = btn.getAttribute("data-status");
  const userId = btn.getAttribute("data-id");
  const btnContainer = btn.parentElement; // .inner-buttons

  // Xử lý các nút
  if (status === "add") {
    // Đổi sang nút Hủy
    btn.textContent = "Hủy";
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-secondary");
    btn.setAttribute("data-status", "cancel");
    socket.emit("CLIENT_ADD_FRIEND", userId);
  } else if (status === "cancel" || status === "cancelAccept") {
    // Gửi socket
    if (status === "cancel") {
      socket.emit("CLIENT_CANCEL_FRIEND", userId);
    } else {
      socket.emit("CLIENT_CANCEL_FRIEND_REQUEST", userId);
    }

    // Xóa nút "Đồng ý" nếu còn tồn tại
    const acceptBtn = btnContainer.querySelector('[data-status="accept"]');
    if (acceptBtn) {
      acceptBtn.remove();
    }

    // Đổi nút hiện tại về "Kết bạn"
    btn.textContent = "Kết bạn";
    btn.classList.remove("btn-secondary");
    btn.classList.add("btn-primary");
    btn.setAttribute("data-status", "add");
  } else if (status === "accept") {
    // Gửi socket đồng ý
    socket.emit("CLIENT_ACCEPT_FRIEND", userId);

    // Đổi text và disable
    btn.textContent = "Đã đồng ý";
    btn.disabled = true;
    btn.removeAttribute("data-id");
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-success");

    // Xóa nút Hủy nếu còn
    const cancelBtn = btnContainer.querySelector(
      '[data-status="cancelAccept"]'
    );
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }
});
// HẾt Chức năng kết bạn/ hủy/ đồng ý/ hủy yêu cầu kết bạn
