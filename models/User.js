module.exports = (db) => {
  const Schema = db.Schema;
  const userSchema = new Schema(
    {
      email: { type: String, required: true },
      password: { type: String, required: true },
      datapoints: {
        type: Schema.Types.ObjectId,
        ref: "Datapoint",
      },
      refreshToken: { type: String },
    },
    { timestamps: true }
  );
  return db.model("User", userSchema);
};
