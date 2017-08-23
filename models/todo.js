module.exports = (sequelize, DataTypes) => {
    return sequelize.define('todo', {
        descripcion: {
            // Sustituye Sequelize por DataTypes
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]    //longitud >= 1 && <= 250
            }
        },
        completado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};
