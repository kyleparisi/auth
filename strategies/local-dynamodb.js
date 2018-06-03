const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const AWS = require("aws-sdk");

const dd = new AWS.DynamoDB.DocumentClient();
const tableName = "users";

module.exports = function() {
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      function(req, email, password, done) {
        const params = {
          TableName: tableName,
          Key: {
            email
          }
        };

        // console.log("Scanning for :" + JSON.stringify(params)); //.Items["email"].name)

        dd
          .get(params)
          .promise()
          .then(doc => doc.Item)
          .then(user => {
            console.log(user);
            if (!user) {
              return true;
            }

            done(
              null,
              false,
              req.flash("signupMessage", "That email is already taken.")
            );
          })
          .then(noUser => {
            const params = {
              TableName: tableName,
              Item: {
                id: Math.floor(Math.random() * 4294967296).toString(),
                email: email,
                password: bcrypt.hashSync(password),
                hostname: req.hostname,
                verified: false
              }
            };
            dd
              .put(params)
              .promise()
              .then(() => done(null, params.Item));
          });
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      function(req, email, password, done) {
        // callback with email and password from our form
        const params = {
          TableName: tableName,
          Item: {
            email
          }
        };
        dd.get(params, function(err, data) {
          if (err) {
            return done(err);
          }
          if (data.Items.length === 0) {
            return done(
              null,
              false,
              req.flash("loginMessage", "No user found.")
            );
          }
          dd.get(
            { TableName: tableName, Key: { id: data.Items[0]["id"] } },
            function(err, data) {
              if (err) {
                return done(err);
              }
              if (!bcrypt.compareSync(password, data.Item.pw.S)) {
                return done(
                  null,
                  false,
                  req.flash("loginMessage", "Oops! Wrong password.")
                );
              } else {
                return done(null, data.Item);
              }
            }
          );
        });
      }
    )
  );

  passport.serializeUser(function(user, done) {
    done(null, user.login);
  });

  passport.deserializeUser(function(login, done) {
    //return user by login
    dd.get("users", login, null, {}, function(err, item, cap) {
      done(err, item);
    });
  });

  return passport;
};
