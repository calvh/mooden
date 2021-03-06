module.exports = (db) => {
  const Schema = db.Schema;
  const datasetSchema = new Schema(
    {
      mood: {
        type: Number,
        required: true,
        min: 1,
        max: 9,
      },
      date: {
        type: Date,
        required: true,
        default: Date.now,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    { timestamps: true }
  );
  return db.model("Datapoint", datasetSchema);
};
