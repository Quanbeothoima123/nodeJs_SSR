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
      formChangeStatus.submit();
    });
  });
}
//End Chang Status

// delete item
const buttonDelete = document.querySelectorAll("[button-delete]");
if (buttonDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  const dataPath = formDeleteItem.getAttribute("data-path");
  buttonDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm này");
      if (isConfirm) {
        const id = button.getAttribute("data-id");
        const action = `${dataPath}/${id}?_method=DELETE`;
        formDeleteItem.action = action;
        formDeleteItem.submit();
      }
    });
  });
}
//end delete item
