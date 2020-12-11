module.exports = (
  db,
  bcrypt,
  passport,
  localStrategy,
  passportJWT,
  validate,
  constraints
) => {
  const User = db.User;

  passport.use(
    "register",
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },
      (email, password, done) => {
        // validate email and password
        const validateError = validate({ email, password }, constraints);
        if (validateError) {
          // validation failed
          return done(null, false, { validateError });
        }

        // validation successful, check for duplicate
        User.findOne({ email })
          .then(async (user) => {
            // use async bcrypt function

            if (user) {
              // email already exists
              return done(null, false, { authError: "email" });
            }

            // no duplicate, register new user
            const saltRounds = process.env.SALT_ROUNDS;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            User.create({
              email,
              password: hashedPassword,
            }).then((user) => {
              // db managed to create user successfully
              return done(null, user);
            });
          })
          .catch((err) => {
            // catch db errors
            done(err);
          });
      }
    )
  );

  passport.use(
    "login",
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },
      (email, password, done) => {
        User.findOne({ email })
          .then(async (user) => {
            if (!user) {
              // email not in database
              return done(null, false, { authError: "email" });
            }

            const response = await bcrypt.compare(password, user.password);

            if (!response) {
              // password does not match
              return done(null, false, { authError: "password" });
            } else {
              // password matches, return user and proceed to login
              return done(null, user);
            }
          })
          .catch((err) => {
            // catch db errors
            done(err);
          });
      }
    )
  );

  // ---------------------------  JWT STRATEGIES  ---------------------------

  const jwtCallback = (jwt_payload, done) => {
    // jsonwebtoken verify callback
    // token is valid, check if user exists in db
    User.findById(jwt_payload.id)
      .then((user) => {
        if (!user) {
          //  user not found in db
          const message = `User ID: ${jwt_payload.id} not found in database`;
          return done(null, false, { message });
        }
        if (jwt_payload.email !== user.email) {
          // user found but email does not match
          const message = `Token email (${jwt_payload.email}) does not match database email (${user.email})`;
          return done(null, false, { message });
        }
        // user found in db
        return done(null, user);
      })
      .catch((err) => done(err));
  };

  // --------- access token ---------
  passport.use(
    "jwtAccess",
    new passportJWT.Strategy(
      {
        // look for Authorization: `Bearer ${token}` in the request header
        jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      },

      jwtCallback(jwt_payload, done)
    )
  );

  // -------- refresh token -------

  passport.use(
    "jwtRefresh",
    new passportJWT.Strategy(
      {
        // look for jwt in cookies
        jwtFromRequest: (req) =>
          req && req.cookies ? req.cookies["jwt"] : null,
        secretOrKey: process.env.REFRESH_TOKEN_SECRET,
      },
      jwtCallback(jwt_payload, done)
    )
  );
};
