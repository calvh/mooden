module.exports = (db) => {
  const Schema = db.Schema;
  const datasetSchema = new Schema(
    {
      mood: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      time: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
    { timestamps: true }
  );
  return db.model("Datapoint", datasetSchema);
};