/**
 * Created by Home Laptop on 05-Jun-17.
 */
var jwt = require('../auth/jwt');
var security = require('../base/security');

var Schema = db.Schema;
var ObjectId = Schema.ObjectId;


ErrorCode = {
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
    Password : { type : String, minLength : 8, maxLength : 16, set : Password },
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

UserSchema.methods.compareHashPassword = function (password, callback) {
    try {
        var intermediate = security.decrypt(this.Password, security.Pass2Algo, pvtConfig.TokenKey);
        var index = intermediate.length - pvtConfig.TokenSaltLength;
        var pass = intermediate.substr(0, index);
        var salt = intermediate.substr(index);
        var tempPass = security.encrypt(password, security.Pass1Algo, salt);
        if (pass == tempPass) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    }
    catch (e) {
        callback(ErrorCode.InternalError);
    }
};

UserSchema.methods.Register = function (callback) {
    var user = this;
    
    User.find({ Username : this.Username }).count({}, function (err, count) {
        if (count == 0) {
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    callback(ErrorCode.RegistrationFailed);
                }
                
                var payload = jwt.Payload();
                payload.auth = user.UserId;
                
                try {
                    var Token = jwt.getToken(payload);
                    user.Tokens.push(Token);
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                            callback(ErrorCode.RegistrationFailed);
                        }
                        callback(null, Token);
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

var User = db.model('User', UserSchema);

User.Authenticate = function (token, callback) {
    User.findOne({ Tokens : token }, '_id', function (err, user) {
        if (err) {
            callback(ErrorCode.InternalError);
            return;
        }
        if (user == null) {
            callback(ErrorCode.AuthenticationFailed);
        } else callback(null, user._id);
    })
};

User.Login = function (username, password, callback) {
    User.findOne({ Username : username }, { Password : 1, Tokens : 1 }, function (err, user) {
        if (err) {
            console.log(err);
            callback(ErrorCode.InternalError);
        }
        if (user == null) {
            callback(ErrorCode.UserDoesNotExists);
            return;
        }
        
        user.compareHashPassword(password, function (err, Valid) {
            if (err) {
                callback(err);
                return;
            }
            if (Valid) {
                try {
                    var payload = jwt.Payload();
                    payload.auth = user.UserId;
                    var Token = jwt.getToken(payload);
                    
                    if (user.Tokens.length == pvtConfig.ConcurrentSessionCount) {
                        user.Tokens.shift();
                    }
                    
                    user.Tokens.push(Token);
                    
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                            callback(ErrorCode.InternalError);
                            return;
                        }
                        callback(null, Token);
                    });
                }
                catch (e) {
                    callback(ErrorCode.InternalError);
                }
            }
            else {
                callback(ErrorCode.InvalidPassword);
            }
        });
    });
};

User.Logout = function (Token, callback) {
    User.findOne({ Tokens : Token }, { Tokens : 1 }, function (err, user) {
        if (err) {
            callback(ErrorCode.InternalError);
            return;
        }
        if (user == null) {
            callback(ErrorCode.InvalidRequest);
        }
        else {
            try {
                var Index = user.Tokens.indexOf(Token);
                user.Tokens.splice(Index, 1);
                user.save(function (err) {
                    if (err) {
                        callback(ErrorCode.InternalError);
                    }
                    else callback(null, true);
                });
            }
            catch (e) {
                callback(ErrorCode.InternalError);
            }
        }
    });
};

User.DeleteAccount = function (userId, Password, callback) {
    try {
        User.findOne({ UserId : ObjectId(userId) }, { Password : 1 }, function (err, user) {
            if (err) {
                callback(ErrorCode.InternalError);
                return;
            }
            if (user == null) {
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
    catch (e){
        callback(ErrorCode.InternalError);
    }
};

module.exports = User;

User.ErrorCode = ErrorCode;