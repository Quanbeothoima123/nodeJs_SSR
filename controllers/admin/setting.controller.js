const SettingGeneral = require("../../models/settings-general.model");
// [GET] /admin/settings/general
module.exports.general = async (req, res) => {
  const settingDoc = await SettingGeneral.findOne({});
  if (settingDoc) {
    res.render("admin/pages/settings/general", {
      pageTitle: "Cài đặt chung",
      settings: settingDoc,
    });
  } else {
    const newSetting = new SettingGeneral();
    await newSetting.save();
    res.render("admin/pages/settings/general", {
      pageTitle: "Cài đặt chung",
    });
  }
};
// [GET] /admin/settings/general
module.exports.generalPatch = async (req, res) => {
  if (!req.body.logo) {
    // Nếu không upload ảnh mới, lấy lại ảnh cũ từ DB
    const oldSetting = await SettingGeneral.findOne({});
    req.body.logo = oldSetting.logo;
  }
  try {
    await SettingGeneral.updateOne(
      {},

      req.body
    );
    req.flash("success", "Cập nhật thông tin web thành công");
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật thông tin web thất bại");
  }

  res.redirect(req.get("referer"));
};
