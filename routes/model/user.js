/**
 * Created by Home Laptop on 05-Jun-17.
 */
'use strict';

var nwt = require('../src/core/nwt');
var security = require('../src/core/security');

var Schema = mDb.Schema;
var ObjectId = Schema.ObjectId;


var ErrorCode = {
    UserAlreadyExists : 'User Already Exists',
    InvalidRequest : 'Invalid Request',
    RegistrationFailed : 'Registration Failed',
    InvalidPasswordLength : 'Invalid Password Length',
    UserDoesNotExists : 'User Does Not Exists',
    InvalidPassword : 'Invalid Password',
    InternalError : 'Internal Server Error',
    AuthenticationFailed : 'Authentication Failed'
};

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
    
    return security.encryptWithSalt(Password);
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
            var intermediate = security.decrypt(_user.Password, security.Pass2Algo, pvtConfig.TokenKey);
            var index = intermediate.length - pvtConfig.TokenSaltLength;
            var pass = intermediate.substr(0, index);
            var salt = intermediate.substr(index);
            var tempPass = security.encrypt(password, security.Pass1Algo, salt);
            return (pass === tempPass);
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
    
    User.find({ Username : this.Username }).count({}, function (err, count) {
        if (count === 0) {
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    callback(ErrorCode.RegistrationFailed);
                }
                
                var payload = nwt.Payload();
                payload.auth = user.UserId;
                
                try {
                    var Token = nwt.getToken(payload);
                    user.Tokens.push(Token);
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                            callback(ErrorCode.RegistrationFailed);
                        }
                        callback(null, Token, user._id);
                    });
                }
                catch (e) {
                    console.log(e);
                    callback(ErrorCode.RegistrationFailed);
                }
            });
        }
        else callback(ErrorCode.UserAlreadyExists);
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
            console.log(user);
            if (!user) {
                callback(ErrorCode.AuthenticationFailed);
            } else callback(null, user._id);
        })
        .catch(function (e) {
            callback(ErrorCode.InternalError);
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
                                throw ErrorCode.InternalError;
                            });
                    }
                    else {
                        throw ErrorCode.InvalidPassword;
                    }
                })
            
        })
        .catch(function (e) {
            callback(e);
        });
};

/**
 * Logout the user
 * True on Success
 * ThrowsInternal Error, InvalidRequest
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
                    throw ErrorCode.InternalError;
                });
            
        }, function (err) {
            if (err !== ErrorCode.InvalidRequest)
                throw ErrorCode.InternalError;
        })
        .catch(function (e) {
            callback(e);
        });
};

User.DeleteAccount = function (userId, Password, callback) {
    try {
        User.findOne({ UserId : ObjectId(userId) }, { Password : 1 }, function (err, user) {
            if (err) {
                callback(ErrorCode.InternalError);
                return;
            }
            if (!user) {
                callback(ErrorCode.UserDoesNotExists);
                return;
            }
            user.compareHashPassword(Password, function (err, Valid) {
                if (err) {
                    callback(err);
                    return;
                }
                if (Valid) {
                    user.remove(function (err) {
                        if (err) {
                            callback(ErrorCode.InternalError);
                        } else callback(null, true);
                    });
                }
                else {
                    callback(ErrorCode.InvalidPassword);
                }
            });
        });
    }
    catch (e) {
        callback(ErrorCode.InternalError);
    }
};

module.exports = User;

User.ErrorCode = ErrorCode;