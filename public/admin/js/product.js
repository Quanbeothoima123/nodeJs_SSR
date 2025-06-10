//Change Status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector("#form-change-status");
  const path = formChangeStatus.getAttribute("data-path");
  buttonChangeStatus.forEach((button) => {
    button.addEventListener("click", () => {
      const statusCurrent = button.getAttribute("data-status");
      const id = button.getAttribute("data-id");

      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        console.error("ID không hợp lệ:", id);
        return;
      }

      let statusChange = statusCurrent === "active" ? "inactive" : "active";
      // Thêm window.location.search để giữ query string (ví dụ: ?page=2)
      const action = `${path}/${statusChange}/${id}${window.location.search}${
        window.location.search ? "&" : "?"
      }_method=PATCH`;

      formChangeStatus.action = action;
      console.log("Form action:", action); // Debug URL
      formChangeStatus.submit();
    });
  });
}
//End Chang Status
