/**
 * Created by Home Laptop on 05-Jun-17.
 */
'use strict';

var nwt = require('../src/core/nwt');
var security = require('../src/core/security');

var Schema = mDb.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = Schema({
    UserId : ObjectId,
    Username : { type : String, required : true, unique : true, index : true },
    Password : {
        type : String, required : true, minLength : pubConfig.MinPasswordLength,
        maxLength : pubConfig.MaxPasswordLength, set : Password
    },
    FirstName : { type : String, required : true },
    MiddleName : String,
    LastName : String,
    IsAdmin : { type : Boolean, default : false },
    CreatedAt : Date,
    LastUpdated : Date,
    Tokens : [ { type : String, index : true } ]
});

/**
 * Set User's Password
 * May Throw Error
 * */
function Password(Password) {
    if (Password.length < pubConfig.MinPasswordLength || Password.length > pubConfig.MaxPasswordLength)
        throw Error(ErrorCode.InvalidPasswordLength);
    
    return security.encryptPassword(Password);
}

UserSchema.pre('save', function (next) {
    var currentDate = new Date();
    this.LastUpdated = currentDate;
    if (!this.CreatedAt)
        this.CreatedAt = currentDate;
    next();
});

UserSchema.methods.compareHashPassword = function (password) {
    var _user = this;
    return createPromise()
        .then(function () {
            return security.comparePassword(password, _user.Password);
        })
        .catch(function (e) {
            console.log(e);
            throw ErrorCode.InternalError;
        });
};

/**
 * Sign Up the User
 * Token on Success
 * Throws RegistrationFailed, UserAlreadyExists
 * */
UserSchema.methods.Register = function (callback) {
    var user = this;
    
    User.find({ Username : this.Username })
        .count({})
        .exec()
        .then(function (count) {
            if (count === 0) {
                return user.save()
                    .then(function () {
                        var payload = nwt.Payload();
                        payload.auth = user.UserId;
                        
                        var Token = nwt.getToken(payload);
                        user.Tokens.push(Token);
                        
                        return user.save()
                            .then(function () {
                                callback(null, Token, user._id);
                            })
                            .catch(function (e) {
                                console.log(e);
                                throw ErrorCode.RegistrationFailed;
                            });
                    })
                    .catch(function (e) {
                        console.log(e);
                        throw ErrorCode.RegistrationFailed;
                    });
            }
            else
                throw ErrorCode.UserAlreadyExists;
        }, function (e) {
            console.log(e);
            throw ErrorCode.InternalError;
        })
        .catch(function (e) {
            callback(e);
        });
};

var User = mDb.model('User', UserSchema);

/**
 * Authenticate User based on Token
 * Sets UserId on Success
 * Throws InternalError, Authentication Failed
 **/
User.Authenticate = function (token, callback) {
    User.findOne({ "Tokens" : token }, '_id')
        .exec()
        .then(function (user) {
            if (!user)
                throw ErrorCode.AuthenticationFailed;
            else callback(null, user._id);
        }, function (e) {
            console.log(e);
            throw ErrorCode.InternalError;
        })
        .catch(function (e) {
            callback(e);
        });
};

/**
 *Login the User
 * Returns Token on Success
 * Returns Error InternalError, UserDoesNotExists, InvalidPassword
 **/
User.Login = function (username, password, callback) {
    User.findOne({ Username : username }, { Password : 1, Tokens : 1, CreatedAt : 1 })
        .exec()
        .then(function (user) {
            if (!user) {
                throw ErrorCode.UserDoesNotExists;
            }
            return user.compareHashPassword(password)
                .then(function (Valid) {
                    if (Valid) {
                        var payload = nwt.Payload();
                        payload.auth = user.UserId;
                        var Token = nwt.getToken(payload);
                        
                        while (user.Tokens.length >= pvtConfig.ConcurrentSessionCount) {
                            user.Tokens.shift();
                        }
                        
                        user.Tokens.push(Token);
                        
                        return user.save()
                            .then(function () {
                                callback(null, Token, user._id);
                            }).catch(function (e) {
                                console.log(e);
                                throw ErrorCode.InternalError;
                            });
                    }
                    else {
                        throw ErrorCode.InvalidPassword;
                    }
                });
            
        }, function (e) {
            console.log(e);
            throw ErrorCode.InternalError;
        })
        .catch(function (e) {
            callback(e);
        });
};

/**
 * Logout the user
 * True on Success
 * Throws InternalError, InvalidRequest
 */
User.Logout = function (Token, callback) {
    User.findOne({ Tokens : Token }, { Tokens : 1, CreatedAt : 1 })
        .exec()
        .then(function (user) {
            if (!user)
                throw ErrorCode.InvalidRequest;
            
            var Index = user.Tokens.indexOf(Token);
            user.Tokens.splice(Index, 1);
            
            return user.save()
                .then(function () {
                    callback(null, true);
                }).catch(function (e) {
                    console.log(e);
                    throw ErrorCode.InternalError;
                });
            
        }, function (err) {
            console.log(err);
            throw ErrorCode.InternalError;
        })
        .catch(function (e) {
            callback(e);
        });
};

/**
 * Delete the Account
 * True on Success
 * Throws InternalError, UserDoesNotExists, InvalidPassword
 */
User.DeleteAccount = function (userId, Password, callback) {
    User.findById(userId, { Password : 1 })
        .exec()
        .then(function (user) {
            if (!user)
                throw ErrorCode.UserDoesNotExists;
            
            return user.compareHashPassword(Password)
                .then(function (Valid) {
                    if (Valid) {
                        return user.remove()
                            .then(function () {
                                callback(null, true)
                            })
                            .catch(function (e) {
                                console.log(e);
                                throw ErrorCode.InternalError;
                            });
                    }
                    else {
                        throw ErrorCode.InvalidPassword;
                    }
                });
            
        }, function (e) {
            console.log(e);
            throw ErrorCode.InternalError;
        })
        .catch(function (e) {
            callback(e);
        });
};

/**
 * Change Account Password
 * True on Success, Redundant Tokens
 * Do Remove Tokens from Store, if Signing out others
 * Throws InternalError, UserDoesNotExists, InvalidPassword
 */
User.ChangePassword = function (Token, userId, oldPassword, newPassword, signOutOthers, callback) {
    User.findById(userId, { Password : 1, Tokens : 1 })
        .exec()
        .then(function (user) {
            if (!user)
                throw ErrorCode.UserDoesNotExists;
            
            return user.compareHashPassword(oldPassword)
                .then(function (Valid) {
                    if (Valid) {
                        user.Password = newPassword;
                        
                        var Redundant = null;
                        
                        if (signOutOthers) {
                            user.Tokens.splice(user.Tokens.indexOf(Token), 1);
                            Redundant = [];
                            user.Tokens.forEach(function (_token) {
                                Redundant.push(_token);
                            });
                            user.Tokens = [ Token ];
                        }
                        
                        return user.save()
                            .then(function () {
                                
                                callback(null, true, Redundant);
                            }).catch(function (e) {
                                console.log(e);
                                throw ErrorCode.InternalError;
                            });
                    }
                    else {
                        throw ErrorCode.InvalidPassword;
                    }
                });
            
        }, function (e) {
            console.log(e);
            throw ErrorCode.InternalError;
        })
        .catch(function (e) {
            callback(e);
        });
};

/**
 * Reset Account Password
 * True on Success, Signs Out All, Returns redundant Tokens
 * Do Remove Tokens from Store
 * Throws InternalError
 */
User.ResetPassword = function (userId, newPassword, callback) {
    User.findById(userId, { Password : 1, Tokens : 1 })
        .exec()
        .then(function (user) {
            if (!user)
                throw ErrorCode.UserDoesNotExists;
            
            user.Password = newPassword;
            
            var Redundant = [];
            user.Tokens.forEach(function (_token) {
                Redundant.push(_token);
            });
            
            user.Tokens = [];
            
            return user.save()
                .then(function () {
                    callback(null, true, Redundant);
                }).catch(function (e) {
                    console.log(e);
                    throw ErrorCode.InternalError;
                });
            
        }, function (e) {
            console.log(e);
            throw ErrorCode.InternalError;
        })
        .catch(function (e) {
            callback(e);
        });
};


module.exports = User;