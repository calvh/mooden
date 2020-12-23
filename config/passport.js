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
            const saltRounds = parseInt(process.env.SALT_ROUNDS);
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

  // --------- access token ---------
  passport.use(
    "jwtAccess",
    new passportJWT.Strategy(
      {
        // look for Authorization: `Bearer ${token}` in the request header
        jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      },
      (jwt_payload, done) => {
        // jsonwebtoken verify callback
        // token is valid, check if user exists in db

        User.findById(jwt_payload.id)
          .then((user) => {
            if (!user) {
              //  user not found in db
              return done(null, false, { authError: "id" });
            }
            if (jwt_payload.email !== user.email) {
              // user found but email does not match
              return done(null, false, { authError: "email" });
            }
            // user found in db and email matches
            return done(null, user);
          })
          .catch((err) => {
            // db error
            done(err);
          });
      }

    )
  );

  // -------- refresh token -------

  passport.use(
    "jwtRefresh",
    new passportJWT.Strategy(
      {
        // look for jwt in cookies, key is "refreshToken"
        jwtFromRequest: (req) =>
          req && req.cookies ? req.cookies["refreshToken"] : null,

        secretOrKey: process.env.REFRESH_TOKEN_SECRET,

        // needed to check token with database
        passReqToCallback: true,
      },
      (req, jwt_payload, done) => {
        // jsonwebtoken verify callback
        // token is valid, check if user exists in db
        User.findById(jwt_payload.id)
          .then((user) => {
            if (!user) {
              //  user not found in db
              return done(null, false, { authError: "id" });
            }
            if (jwt_payload.email !== user.email) {
              // user found but email does not match
              return done(null, false, { authError: "email" });
            }

            if (req.cookies["refreshToken"] !== user.refreshToken) {
              // user found and email matches but refreshToken does not match
              return done(null, false, { authError: "token" });
            }
            // user found in db, email, refresh token both match
            return done(null, user);
          })
          .catch((err) => {
            // db error
            done(err);
          });
      }
    )
  );
};
