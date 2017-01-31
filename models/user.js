'use strict';

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
 var user = sequelize.define('user', {
   email: {
   type: DataTypes.STRING,
   validate: {
       isEmail: {
           msg: 'Invalid email address'
           }
       }
   },
   name: {
       type: DataTypes.STRING,
       validate: {
           len: {
               args: [1, 99],
               msg: 'Name must be between 1 and 99'
           }
       }
   },
   password: {
       type: DataTypes.STRING,
       validate: {
           len: {
               args: [8, 99],
               msg: 'Password must be at least 8 digits long'
           }
       }
   },
   facebookId: {
       type: DataTypes.STRING
   },
   facebookToken: {
       type: DataTypes.STRING
   },
   facebookPicture: {
       type: DataTypes.STRING
   },
   googleId: {
       type: DataTypes.STRING
   },
   googleToken: {
       type: DataTypes.STRING
   },
   googlePicture: {
       type: DataTypes.STRING
   }
 }, {
   hooks: {
   beforeCreate: function(createdUser, options, callback) {
       if (createdUser.password !== undefined) {
           var hash = bcrypt.hashSync(createdUser.password, 10);
           createdUser.password = hash;
       }
       callback(null, createdUser);
   }
},
   classMethods: {
     associate: function(models) {
       // associations can be defined here
     }
   },
   instanceMethods: {
       validPassword: function(password) {
           return bcrypt.compareSync(password, this.password);
       },
       toJSON: function() {
           var jsonUser = this.get();
           delete jsonUser.password;
           return jsonUser;
       }
   }
 });
 return user;
};