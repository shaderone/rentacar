const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Security: Don't return password by default
    },
    role: {
        type: String,
        enum: ['user', 'host', 'admin'], // Strict limit on roles
        default: 'user'
    },
    // 3. Host Specifics (The "Business" Part)
    // This object only gets filled if role === 'host'
    hostProfile: {
        businessName: { type: String },
        licenseNumber: { type: String },
        verified: { type: Boolean, default: false } // Admin has to approve them later
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// 🔒 BEST PRACTICE [Encryption Middleware]: Encrypt password using bcrypt before saving (Runs Automatically) 
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next(); // if password is not modified, move to next middleware
    }
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 Helper method to match user entered password to hashed password in DB
// we use UserSchema.methods to add methods to the user model. we could also use statics for static methods. here's an example : 
// UserSchema.statics.findByEmail = function(email) {
//     return this.findOne({ email });
// };
// but the best practice is to use methods for instance methods and statics for static methods.
// instance methods are methods that operate on a specific document. static methods are methods that operate on the model itself.
// here matchPassword is an instance method because it operates on a specific user document, meaning we need to have access to the specific users' hashed password to compare it with the entered password.

// 'function' keyword is used instead of arrow function to have access to 'this' keyword which refers to the specific user document.

// here's another example of static method:
// UserSchema.statics.findByDomain = function(domain) {
//    return this.find({ email: new RegExp('@' + domain + '$', 'i') });
// };
// what this does is find all users with email addresses that end with the specified domain. For example, User.findByDomain('example.com') would return all users with email addresses ending in @example.com

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);