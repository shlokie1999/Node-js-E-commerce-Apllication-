const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodeMailer = require('nodeMailer');
const crypto = require('crypto')
const { validationResult } = require('express-validator')
// const sendgridTransport = require('nodemailer-sendgrid-transport')

var userEmail = process.env.userEmail;
var userPassword = process.env.userPassword;
// 'farhanbajwa46@gmail.com'
// 'emejxqlvclttlrka'


var transporter = nodeMailer.createTransport(`smtps://${userEmail}:${userPassword}@smtp.gmail.com`);



exports.getLogin = (req, res, next) => {

  console.log(res.locals)
  const isLoggedIn = req.session.isLoggedIn ? true : false;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: isLoggedIn,
    errorMessage: req.flash('error')
  });
};

exports.postLogin = (req, res, next) => {



  const email = req.body.email;
  const password = req.body.password;



  User.findOne({ email: email })
    .then((user) => {
      console.log('ss', user)
      if (!user) {
        req.flash('error', 'Email Address Not Found')
        return res.redirect('/login')
      }

      bcrypt.compare(password, user.password).then((matched) => {

        if (matched) {
          req.session.isLoggedIn = true;
          req.session.user = user;

          return req.session.save(() => {

            return res.redirect('/')
          })

        } else {
          req.flash('error', 'Incorrect password')

          return res.status('422').redirect('/login');
        }

      }).catch((err) => {
        console.log(err);
        res.redirect('/login')
      })


    }).catch((err) => {
      console.log(err)
    })
  // res.setHeader('Set-Cookie','loggedIn=true')

}

exports.postLogout = (req, res, next) => {
  console.log(res.csrfToken)
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/')
  })
}

exports.getSignup = ((req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: req.flash('error'),
    oldInput: {
      email: "",
      password: undefined,
      confirmPassword: undefined
    },
    validationErrors: []
  })
})

exports.postSignup = (req, res, next) => {

  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      validationErrors: errors.errors 
    })
  }



  User.findOne({ email: email }).then((user) => {
    if (user) {
      req.flash('error', 'Email Address Already exists')
      res.redirect('/signup')
      return;
    }

    bcrypt.hash(password, 12).then((pswrd) => {
      const newUser = new User({
        email: email,
        password: pswrd,
        cart: { items: [], cartPrice: 0 },

      })

      return newUser.save().then(() => {
        res.redirect('/login');
      });
    })


  }).catch((error) => {
    console.log(error)
  })
}

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: false,
    errorMessage: req.flash('error')
  });
}

exports.postReset = (req, res, reset) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        req.flash('error', 'No account with email found.');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    }).then((user) => {
      if (user == undefined) {
        return;
      }
      var mailOptions = {
        from: 'boom@gmail.com',    // sender address
        to: req.body.email, // list of receivers
        subject: 'password reset', // Subject line
        text: 'Hello world from Node.js',       // plaintext body
        html: `<p>you requested a password reset</p>
                <p>click this link <a href="http://localhost:3000/reset/${token}">reset password</a> to set password. </p>` // html body
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.redirect('/');
    }).catch((error) => {
      console.log(error)
    })
  })


}


exports.setNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then((user) => {
    console.log(user)
    res.render('auth/setPassword', {
      path: '/reset',
      pageTitle: 'Reset Password',
      isAuthenticated: false,
      errorMessage: [],
      userId: user._id.toString(),
      token: token
    });
  }).catch((err) => {
    console.log(err)
  })

}

exports.updatePassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  const isLoggedIn = req.session.isLoggedIn ? true : false;

  let newUser;
  User.findOne({ resetToke: token, resetTokenExpiration: { $gt: Date.now() }, _id: userId }).then((user) => {
    if (user == undefined || user == null) {

      res.render('auth/setPassword', {
        path: '/reset',
        pageTitle: 'Reset Password',
        isAuthenticated: false,
        errorMessage: 'link is expired retry reset password',
        userId: userId,
        token: token
      });
      return;
    }
    newUser = user
    return bcrypt.hash(newPassword, 12)
  }).then((pswrd) => {
    newUser.password = pswrd;
    newUser.resetToken = undefined;
    newUser.resetTokenExpiration = undefined
    return newUser.save();
  }).then(() => {
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: isLoggedIn,
      errorMessage: 'password successfully updated'
    });
    return;
  }).catch((err) => {
    console.log(err)
  })
}