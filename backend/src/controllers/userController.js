const User = require("../models/user");

exports.createOrLoginUser = async (req, res) => {
  try {
    const { regNum, password } = req.body || {};
    if (!regNum || !password) {
      return res.status(400).json({ error: "regNum and password are required" });
    }

    let user = await User.findOne({ regNum });
    if (!user) {
      user = await User.create({ regNum, password, lastLoginAt: new Date() });
      return res.json({ success: true, isNewUser: true });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();
    return res.json({ success: true, isNewUser: false });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.saveUserState = async (req, res) => {
  try {
    const { regNum, wishlist, selections, ttMap, isFinalized } = req.body || {};
    if (!regNum) return res.status(400).json({ error: "regNum is required" });

    const user = await User.findOneAndUpdate(
      { regNum },
      {
        $set: {
          appState: {
            wishlist: Array.isArray(wishlist) ? wishlist : [],
            selections: Array.isArray(selections) ? selections : [],
            ttMap: ttMap && typeof ttMap === "object" ? ttMap : {},
            isFinalized: Boolean(isFinalized),
          },
        },
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUserState = async (req, res) => {
  try {
    const regNum = req.query?.regNum;
    if (!regNum) return res.status(400).json({ error: "regNum is required" });

    const user = await User.findOne({ regNum });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      success: true,
      appState: user.appState || { wishlist: [], selections: [], ttMap: {}, isFinalized: false },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

