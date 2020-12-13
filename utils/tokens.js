const createRefreshToken = (user, jwt) => {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const refreshTokenExpires = process.env.REFRESH_TOKEN_EXPIRES_MINUTES;

  // create refresh token
  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    refreshTokenSecret,
    { expiresIn: `${refreshTokenExpires}m` }
  );

  return refreshToken;
};

const storeRefreshToken = async (db, user, refreshToken) => {
  // store refresh token in database
  try {
    await db.User.findByIdAndUpdate(
      user._id,
      { refreshToken },
      {
        upsert: true,
        new: true,
      }
    ).exec();
  } catch (err) {
    // db error; unable to store refresh token in database
    throw err;
  }
};

const sendRefreshToken = (res, refreshToken) => {
  const refreshTokenExpires = process.env.REFRESH_TOKEN_EXPIRES_MINUTES;
  res.cookie("refreshToken", refreshToken, {
    maxAge: refreshTokenExpires * 60 * 1000,

    // make cookie inaccessible by document.cookie
    httpOnly: true,

    // TODO cookies can be sent by HTTPS only, needs to be tested
    // secure: true,

    // default path: "/" will make this a global cookie to be sent by all paths; so that the server will receive the cookie, verify the refresh token and redirect to the desired page from any page)
  });
};

const createAccessToken = (user, jwt) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenExpires = process.env.ACCESS_TOKEN_EXPIRES_MINUTES;

  // create access token
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    accessTokenSecret,
    { expiresIn: `${accessTokenExpires}m` }
  );

  // calculate expiry date of access token
  const accessTokenExpiry = new Date(
    new Date().getTime() + accessTokenExpires * 60 * 1000
  );

  return {
    accessToken,
    accessTokenExpiry,
  };
};

module.exports = {
  createRefreshToken,
  storeRefreshToken,
  sendRefreshToken,
  createAccessToken,
};
