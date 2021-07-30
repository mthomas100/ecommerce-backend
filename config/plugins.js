module.exports = ({ env }) => ({
    upload: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {
          folder: env("CLOUDINARY_FOLDER"),
        },
        delete: {},
      },
    },
    email: {
      provider: "nodemailer-v3",
      providerOptions: {},
      settings: {
        host: env("SMTP_HOST"),  
        port: env("SMTP_PORT"),
        username: env("SMTP_USERNAME"),
        password: env("SMTP_PASSWORD"),
        secure: false, // docs suggest keeping this as false when using port 587
      },
    },
  });