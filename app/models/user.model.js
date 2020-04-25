const mongoose = require('mongoose');

const collectionName = "users";
const schema = {
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255,
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
        select: false
    }
};
const UserSchema = mongoose.Schema(schema);
module.exports.User = mongoose.model(collectionName, UserSchema);