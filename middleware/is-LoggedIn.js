
module.exports = (req,res,next)=>{
    const isLoggedIn = req.session.isLoggedIn ? true : false;
   if(!isLoggedIn)
        return res.redirect('/login');
    next();
}