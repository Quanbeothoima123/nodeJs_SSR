const { deleteModel } = require("mongoose");
const Role = require("../../models/role.model");

const systemConfig = require("../../config/system");
// [GET] /admin/roles
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  const roles = await Role.find(find);

  res.render("admin/pages/roles/index", {
    pageTitle: "Trang nhóm quyền",
    roles: roles,
  });
};

// [GET] /admin/products/create

module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Tạo mới quyền",
  });
};

// [POST] Tạo mới quyền
module.exports.createPost = async (req, res) => {
  const { title, description } = req.body;

  const data = {
    title: title?.trim(),
    description: description?.trim(),
  };
  // Tạo và lưu danh mục
  const role = new Role(data);
  await role.save();

  res.redirect(`${systemConfig.prefixAdmin}/roles`);
};

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const role = await Role.findOne(find);

    // Nếu không tìm thấy role thì quay về danh sách
    if (!role) {
      return res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
    res.render("admin/pages/roles/detail", {
      pageTitle: "Chi tiết vai trò",
      role: role,
    });
  } catch (error) {
    console.error(error); // Ghi log lỗi để debug
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };
    const role = await Role.findOne(find);
    res.render("admin/pages/roles/edit", {
      pageTitle: "Chỉnh sửa vai trò",
      role: role,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
  const { title, description } = req.body;
  const data = {
    title: title?.trim(),
    description: description?.trim(),
  };

  try {
    await Role.updateOne({ _id: req.params.id }, data);
    req.flash("success", "Cập nhật vai trò thành công");
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật vai trò thất bại");
    res.redirect(req.get("referer"));
    return;
  }
  res.redirect(`${systemConfig.prefixAdmin}/roles`);
};

//[DELETE] /admin/roles/delete/:id

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await Role.updateOne({ _id: id }, { deleted: true, deleteAt: new Date() });
  req.flash("success", `Xóa thành công vai trò`);
  res.redirect(req.get("referer") || "/admin/roles");
};

//[Permissions] /admin/roles/permissions

module.exports.permissions = async (req, res) => {
  let find = {
    deleted: false,
  };
  const records = await Role.find(find);
  res.render("admin/pages/roles/permissions", {
    pageTitle: "Phân quyền",
    records: records,
  });
};

//[Patch] /admin/roles/permissionsPatch

module.exports.permissionsPatch = async (req, res) => {
  try {
    const permissions = JSON.parse(req.body.permissions);

    for (const item of permissions) {
      await Role.updateOne({ _id: item.id }, { permissions: item.permissions });
    }
    req.flash("success", `Cập nhật quyền thành công`);
    res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
  } catch (error) {
    req.flash("error", `Cập nhật quyền thất bại`);
    res.redirect(req.get("referer"));
  }
};
