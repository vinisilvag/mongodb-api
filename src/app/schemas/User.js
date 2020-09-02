import mongoose from '@/database';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  passwordResetToken: {
    type: String,
    select: false,
  },

  passwordResetTokenExpiration: {
    type: Date,
    select: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', function (next) {
  bcrypt
    .hash(this.password, 10)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch((err) => {
      console.error('Error hashing password', err);
    });
});

export default mongoose.model('User', UserSchema);
