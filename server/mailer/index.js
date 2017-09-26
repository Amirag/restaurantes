import nodemailer from 'nodemailer';
import config from '../config/environment';

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: config.smtp.credentials
});

export default function(mailOptions) {
  return new Promise(function(resolve, reject) {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      }
      resolve(info);
    });
  });
}
