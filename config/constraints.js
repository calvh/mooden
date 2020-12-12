module.exports = {
    email: {
      email: true,
      presence: { allowEmpty: false },
    },
    password: {
      presence: { allowEmpty: false },
      length: {
        minimum: 8,
        maximum: 20,
      },
      format: {
        pattern: "^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+).{7,20}$",
        message:
          "must be 8-20 characters long, contain letters and numbers, and must not contain spaces, special characters, or emoji",
      },
    },
  };
  