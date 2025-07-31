// SORT
const sortAccount = document.querySelector("[sortAccount]");
if (sortAccount) {
  let url = new URL(window.location.href);
  const sortSelect = sortAccount.querySelector("[sort-select-account]");
  const sortClear = sortAccount.querySelector("[sort-clear-account]");

  // ✅ Khi người dùng chọn sắp xếp
  sortSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    const [sortKey, sortValue] = value.split("-");
    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);
    window.location.href = url.href; // reload trang
  });

  // ✅ Khi trang load lại, giữ lại trạng thái của select
  const currentSortKey = url.searchParams.get("sortKey");
  const currentSortValue = url.searchParams.get("sortValue");
  if (currentSortKey && currentSortValue) {
    sortSelect.value = `${currentSortKey}-${currentSortValue}`;
  }

  // ✅ Nút clear sort
  sortClear.addEventListener("click", () => {
    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");
    window.location.href = url.href;
  });
}
// END SORT

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

// FILTER BY ROLE NAME
const filterByRoleNameSelectItem = document.querySelector(
  "[filter-by-role-name]"
);
if (filterByRoleNameSelectItem) {
  let url = new URL(window.location.href);
  // ✅ Khi người dùng chọn sắp xếp
  filterByRoleNameSelectItem.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value !== "null") {
      url.searchParams.set("roleId", value);
      window.location.href = url.href; // reload trang
    } else {
      url.searchParams.delete("roleId");
      window.location.href = url.href;
    }
  });

  // ✅ Khi trang load lại, giữ lại trạng thái của select
  const currentFilterRoleId = url.searchParams.get("roleId");
  if (currentFilterRoleId) {
    filterByRoleNameSelectItem.value = currentFilterRoleId;
  }
}
//  END FILTER BY ROLE NAME
