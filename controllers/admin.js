const Product = require('../models/product');
const { validationResult } = require('express-validator')


exports.getAddProduct = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn ? true : false;
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    isAuthenticated: isLoggedIn,
    errorMessage: [],
  });
};


exports.postAddProduct = (req, res, next) => {

  const errors = validationResult(req);
  const isLoggedIn = req.session.isLoggedIn ? true : false;
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      isAuthenticated: isLoggedIn,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.errors
    })
  }

  const file = req.file;

  if (!file) {
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      isAuthenticated: isLoggedIn,
      errorMessage: 'Please upload the correct format of image',
      validationErrors: []
    })
  }



  const product = new Product({ title: req.body.title, price: req.body.price, description: req.body.description, imageUrl: file.path,creatorId:req.user._id });
  product.save().then(() => {
    console.log('product created')
    res.redirect("/admin/products");

  }).catch((err) => {
    console.log(err)
  });
};

exports.getProducts = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn ? true : false;
  Product.find().then((result) => {

    res.render('admin/products', {
      prods: result,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      isAuthenticated: isLoggedIn
    });
  }).catch((err) => { console.log(err) });

};


exports.deleteProduct = (req, res, next) => {

  const id = req.body.productId;

  Product.findByIdAndRemove(id).then(() => {
    res.redirect("/admin/products");

  }).catch((err => {
    console.log(err)
  }))
}

exports.editProduct = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn ? true : false;
  const id = req.query.productId;
  console.log(res.locals);
  Product.findById(id).then((products) => {
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      prod: products,
      path: '/admin/edit-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      errorMessage: '',
      isAuthenticated: isLoggedIn
    });
  }).catch((err) => {
    console.log(err)
  });

}

exports.updateProduct = (req, res, next) => {
  const id = req.query.id;

  const errors = validationResult(req);
  const isLoggedIn = req.session.isLoggedIn ? true : false;


  Product.findById(id).then((prod) => {
    if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        prod: prod,
        path: '/admin/edit-product',
        formsCSS: true,
        productCSS: true,
        activeAddProduct: true,
        errorMessage: '',
        isAuthenticated: isLoggedIn,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.errors
      })
    }

    prod.title = req.body.title;
    prod.desc = req.body.description;
    prod.price = req.body.price
    if (req.file != undefined)
      prod.imageUrl = req.file.path;
   

    return prod.save();
  }).then((prod) => {

    res.redirect('/admin/products');

  }).catch((err) => {
    console.log(err)
  })

  // Product.updateOne(id,req.body.title,req.body.imageUrl,req.body.description,req.body.price).then((response)=>{
  //   console.log(response)
  // }).catch((err)=>{
  //   console.log(err)
  // })

}
