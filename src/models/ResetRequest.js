module.exports = function (sequelize, Sequelize) {
  const ResetRequest = sequelize.define('ResetRequest', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    uuid: {
      type: Sequelize.UUID,
      notEmpty: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },

    userId: {
      type: Sequelize.BIGINT,
    },

    email: {
      type: Sequelize.STRING,
      notEmpty: true,
      allowNull: false,
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    deletedAt: Sequelize.DATE,
  }, {
    timestamps: true,
    paranoid: true,
  });

  ResetRequest.cleanAttributes = [];

  return ResetRequest;
};
