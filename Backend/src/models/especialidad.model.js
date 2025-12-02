import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Especialidad = sequelize.define('Especialidad', {
    id_especialidad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'especialidades', // cambiar si tu tabla se llama diferente
    timestamps: false
  });

  return Especialidad;
};