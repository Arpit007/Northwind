/**
 * Created by Home Laptop on 05-Jun-17.
 */
var jwt = require('../auth/jwt');
var security = require('../base/security');

var Schema = db.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = Schema({
    UserId : ObjectId,
    Username : { type: String, required: true, unique: true, index :true },
    Password : { type: String, minLength : 8, maxLength : 16, set : Password},
    FirstName : { type : String, required : true },
    MiddleName : String,
    LastName : String,
    IsAdmin : { type : Boolean, default : false },
    CreatedAt : Date,
    LastUpdated : Date,
    Tokens : [ {type : String, index : true} ]
});

function Password(Password) {
    if (Password.length< 8 || Password.length > 16)
        throw ErrorCode.InvalidPasswordLength;
    
    return security.encryptWithSalt(Password);
}

UserSchema.pre('save',function (next) {
    var currentDate = new Date();
    this.LastUpdated = currentDate;
    if (!this.CreatedAt)
        this.CreatedAt = currentDate;
    next();
});

UserSchema.methods.Register = function (callback) {
    var user = this;
    
    User.find({Username : this.Username}).count({},function (err,count) {
       if(count == 0){
           this.save(function (err) {
               if (err){
                   console.log(err);
                   throw ErrorCode.RegistrationFailed;
               }
        
               var payload = jwt.Payload();
               payload.auth = user.UserId;
        
               try {
                   var Token = jwt.getToken(payload);
                   user.Tokens.push(Token);
                   user.save(function (err) {
                       if(err){
                           console.log(err);
                           throw ErrorCode.RegistrationFailed;
                       }
                       callback(Token);
                   });
               }
               catch (e){
                   console.log(e);
                   throw ErrorCode.RegistrationFailed;
               }
           });
       }
       else throw ErrorCode.UserAlreadyExists;
    });
};


var User = db.model('User',UserSchema);

User.Authenticate = function (token, callback) {
    User.findOne({Tokens : token},'_id',function (err, user){
        if (err || !user)
            throw ErrorCode.LoginRequired;
        else {
            callback(user._id);
        }
    })
};

module.exports = User;

var User1 = new User({
    Username : 'Stark1',
    Password : 'HelloThere',
    FirstName : 'Arpit',
    LastName : 'Bhatnagar'
});

try {
    User1.Register(function (Token) {
        console.log(Token);
    });
}
catch (e){
    console.log(e);
}

ErrorCode = {
    UserAlreadyExists : 1,
    AlreadyLoggedOut : 2,
    LoginRequired : 3,
    RegistrationSuccess : 4,
    RegistrationFailed :5,
    InvalidPasswordLength : 6
};

User.ErrorCode = ErrorCode;