module.exports = (db) => {
  return {
    User: require("./User")(db),
    Datapoint: require("./Datapoint")(db),
  };
};
