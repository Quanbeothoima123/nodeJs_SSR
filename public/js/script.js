// Show Alert
const showAlert = document.querySelector("[show-alert]");
if (showAlert) {
  const time = parseInt(showAlert.getAttribute("data-time"));
  const closeAlert = showAlert.querySelector("[close-alert]");
  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time);
  closeAlert.addEventListener("click", () => {
    showAlert.classList.add("alert-hidden");
  });
}
//End show alert

//Upload image
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
  const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
  const uploadImagePreview = uploadImage.querySelector(
    "[upload-image-preview]"
  );
  const uploadImageRemove = uploadImage.querySelector("[upload-image-remove]");
  const currentAvatar = uploadImage.querySelector(".current-avatar");

  if (uploadImageInput && uploadImagePreview && uploadImageRemove) {
    uploadImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const imageURL = URL.createObjectURL(file);
        uploadImagePreview.src = imageURL;
        uploadImagePreview.classList.remove("d-none"); // Hiện ảnh preview
        if (currentAvatar) {
          currentAvatar.remove(); // Xóa hoàn toàn ảnh hiện tại
        }
        uploadImageRemove.style.display = "inline-block"; // HiệnHow to play:
      }
    });

    uploadImageRemove.addEventListener("click", () => {
      uploadImageInput.value = ""; // Xóa file trong input
      uploadImagePreview.src = ""; // Xóa ảnh preview
      uploadImagePreview.classList.add("d-none"); // Ẩn ảnh preview
      uploadImageRemove.style.display = "none"; // Ẩn nút xóa
      // Không khôi phục ảnh hiện tại vì đã xóa
    });
  }
}
//End upload image
