import { Router } from 'express';
import bcrypt from 'bcryptjs';
import authConfig from '@/config/auth';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Mailer from '@/modules/Mailer';
import User from '@/app/schemas/User';

const router = new Router();

const generateToken = (params) => {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
};

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email })
    .then((userData) => {
      if (userData) {
        return res.status(400).send({
          error: 'This user already exists',
        });
      } else {
        User.create({ name, email, password })
          .then((user) => {
            user.password = undefined;

            return res.status(200).send(user);
          })
          .catch((err) => {
            console.error('Error saving the new user', err);

            return res.status(400).send({
              error: 'Registration failed',
            });
          });
      }
    })
    .catch((err) => {
      console.error('Error querying user in database', err);

      return res.status(500).send({
        error: 'Failed to register',
      });
    });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (user) {
        bcrypt
          .compare(password, user.password)
          .then((result) => {
            if (result) {
              const token = generateToken({ uid: user.id });

              return res.status(200).send({
                token,
                tokenExpiration: '1d',
              });
            } else {
              return res.status(400).send({
                error: 'Invalid password',
              });
            }
          })
          .catch((err) => {
            console.error('Error checking password', err);

            return res.status(500).send({
              error: 'Internal server error',
            });
          });
      } else {
        return res.status(404).send({
          error: 'User not found',
        });
      }
    })
    .catch((err) => {
      console.error('Error logging in', err);

      return res.status(500).send({
        error: 'Internal server error',
      });
    });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const token = crypto.randomBytes(20).toString('hex');
        const expiration = new Date();
        expiration.setHours(new Date().getHours() + 3);

        User.findByIdAndUpdate(user.id, {
          $set: {
            passwordResetToken: token,
            passwordResetTokenExpiration: expiration,
          },
        })
          .then(() => {
            Mailer.sendMail(
              {
                to: email,
                from: 'vinicaomails@teste.com',
                template: 'auth/forgot_password',
                context: { token },
              },
              (err) => {
                if (err) {
                  console.error('Error sending email to change password', err);

                  return res.status(400).send({
                    error: 'Fail sending recover password mail',
                  });
                } else {
                  return res.send();
                }
              },
            );
          })
          .catch((err) => {
            console.error('Error saving password recovery token', err);

            return res.status(500).send({
              error: 'Internal server error',
            });
          });
      } else {
        return res.status(404).send({
          error: 'User not found',
        });
      }
    })
    .catch((err) => {
      console.error('Error sending email to change password', err);

      return res.status(500).send({
        error: 'Internal server error',
      });
    });
});

router.post('/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;

  User.findOne({ email })
    .select('+passwordResetToken passwordResetTokenExpiration')
    .then((user) => {
      if (user) {
        if (
          token != user.passwordResetToken ||
          new Date().now > user.passwordResetTokenExpiration
        ) {
          return res.status(400).send({
            error: 'Invalid token',
          });
        } else {
          user.passwordResetToken = undefined;
          user.passwordResetTokenExpiration = undefined;
          user.password = newPassword;

          user
            .save()
            .then(() => {
              return res.send({
                message: 'Password changed successfully',
              });
            })
            .catch((err) => {
              console.error('Error saving new user password', err);

              return res.status(500).send({
                error: 'Internal server error',
              });
            });
        }
      } else {
        return res.status(404).send({
          error: 'User not found',
        });
      }
    })
    .catch((err) => {
      console.error('Error reseting the password', err);

      return res.status(500).send({
        error: 'Internal server error',
      });
    });
});

export default router;
