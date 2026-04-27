const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    lastLogin: Date,
    lastLogout: Date,
    lastActive: Date
});

// Update lastActive on every save
userSchema.pre("save", function (next) {
    this.lastActive = new Date();
    next();
});

const User = mongoose.model("User", userSchema);
// LOGIN
app.post("/login", async (req, res) => {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return res.status(404).send("User not found");

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ token, otp: "123456" }); // send OTP (demo)
});

// LOGOUT
app.post("/logout", async (req, res) => {
    const user = await User.findById(req.body.userId);

    user.lastLogout = new Date();
    await user.save();

    res.send("Logged out");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});