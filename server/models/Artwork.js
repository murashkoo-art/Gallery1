// server/models/Artwork.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artwork = sequelize.define('Artwork', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  artist_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER
  },
  style: {
    type: DataTypes.STRING
  },
  image_url: {
    type: DataTypes.STRING
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'artworks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Artwork;