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
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$",
        message:
          "must contain at least one each of the following: uppercase letters, lowercase letters, numbers, and special characters",
      },
    },
  };
  