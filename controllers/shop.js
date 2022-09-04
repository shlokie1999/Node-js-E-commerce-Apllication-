const Product = require('../models/product')
const Cart = require('../models/cart')
const User = require('../models/user')
const { Db } = require('mongodb')
// const cart = require('../models/cart');
const Order = require('../models/order')
const { ObjectId } = require('mongoose').Types
const path = require('path')
const fs = require('fs')
const PDF = require('pdfkit')
const stripe = require('stripe')(`${process.env.stripeKey}`)

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((result) => {
      const isLoggedIn = req.session.isLoggedIn ? true : false
      res.render('shop/product-list', {
        prods: result,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: isLoggedIn
      })
    })
    .catch((err) => console.log(err))
}

exports.getProductById = (req, res, next) => {
  const id = req.params.productId
  const isLoggedIn = req.session.isLoggedIn ? true : false
  Product.findById(id)
    .then((product) => {
      // console.log(product)
      res.render('shop/product-detail', {
        prods: [product],
        pageTitle: 'product details',
        path: '/products',
        isAuthenticated: isLoggedIn
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

const ITEM_PER_PAGE = 2

exports.getIndex = (req, res, next) => {
  const page = req.query.page
  let totalProducts
  Product.find()
    .countDocuments()
    .then((numOfProducts) => {
      totalProducts = numOfProducts
      return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
    })
    .then((result) => {
      const isLoggedIn = req.session.isLoggedIn ? true : false
      res.render('shop/index', {
        prods: result,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: isLoggedIn,
        totalPages: Math.ceil(totalProducts / ITEM_PER_PAGE),
        currentPage: page
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.getCart = (req, res, next) => {
  console.log('user', req.user)

  const isLoggedIn = req.session.isLoggedIn ? true : false

  req.user.populate('cart.items.productId').then((product) => {
    console.log('pro', product.cart.items)
    console.log('pro2', product.cart)
    console.log('cart', product)
    res.render('shop/cart', {
      path: '/cart',
      prods: product.cart.items,
      pageTitle: 'Your Cart',
      isAuthenticated: isLoggedIn
    })
  })
}

exports.postCart = (req, res, next) => {
  console.log('boom')
  const pId = req.body.productId
  req.user.addToCart(req)
  res.redirect('/cart')
}

exports.removeItem = (req, res, next) => {
  req.user
    .removeFromCart(req)
    .then(() => {
      res.redirect('/cart')
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.getOrders = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn ? true : false

  Order.find({ 'user.userId': new ObjectId(req.user._id) })
    .then((order) => {
      console.log('order', order)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: order,
        isAuthenticated: isLoggedIn
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.getCheckoutSuccess = (req, res, next) => {
  let products = []
  req.user
    .populate('cart.items.productId')
    .then((product) => {
      //  console.log(product.cart.items.length)

      for (let i = 0; i < product.cart.items.length; i++) {
        products.push({
          product: product.cart.items[i],
          quantity: product.cart.items[i].quantity
        })
      }

      return product
    })
    .then((product) => {
      let newOrder = {
        products,
        user: { email: req.user.email, userId: req.user._id },
        orderTotal: product.cart.cartPrice
      }
      product.cart.cartPrice = 0
      product.cart.items = []
      req.user.save()
      let new1 = new Order(newOrder)
      return new1.save()
    })
    .then((order) => {
      res.redirect('/orders')
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId
  const invoiceName = 'invoice-' + `${orderId}` + '.pdf'
  const invoicePath = path.join('data', 'invoices', invoiceName)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    'attachment;filename ="' + invoiceName + '"'
  )

  const newPdf = new PDF()
  newPdf.pipe(fs.createWriteStream(invoicePath))
  newPdf.pipe(res)

  Order.findById(orderId)
    .then((order) => {
      order.products.forEach((item) => {
        newPdf.text(
          'Product Name : ' +
          'picture' +
          ' Product Price ' +
          item.product.productPrice +
          '$ ' +
          'Quantity : ' +
          item.quantity
        )
      })

      return order
    })
    .then((order) => {
      // console.log(order)
      newPdf.text('Order Total' + ':' + order.orderTotal + '$')
      newPdf.end()
    })
    .catch((err) => {
      console.log(err)
    })

  // fs.readFile(invoicePath,(err,data)=>{
  //     if(err){
  //       // console.log(err)
  //       return next();
  //     }

  //     res.setHeader('Content-Type','application/pdf');
  //     res.setHeader('Content-Disposition','attachment;filename ="' + invoiceName + '"')
  //     res.send(data)

  // })

  // res.setHeader('Content-Type','application/pdf');
  // res.setHeader('Content-Disposition','attachment;filename ="' + invoiceName + '"')
  // const file = fs.createReadStream(invoicePath);
  // file.pipe(res)
  // res.send(data)
}

exports.getCheckout = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn ? true : false
  let products;
  let total = 0;
  let cartPrice = 0;
  req.user.populate('cart.items.productId').then((product) => {
    console.log('pro', product.cart.items)
    console.log('pro2', product.cart)
    console.log('cart', product)

    products = product.cart.items
    cartPrice = product.cart.cartPrice;
    return stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map(p => {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: p.productId.title,
            },
            unit_amount: p.productId.price,
          },
          quantity: p.quantity
        }
      }),
      mode: "payment",
      success_url: 'https://shopingam.herokuapp.com/checkout/success',
      cancel_url: 'https://shopingam.herokuapp.com/checkout/cancel'
    })
    

  }).then((session) => {
    console.log('id', session.id)
    res.render('shop/checkout', {
      path: '/checkout',
      prods: products,
      pageTitle: 'Your Cart',
      isAuthenticated: isLoggedIn,
      total: cartPrice,
      sessionId: session.id
    })
  })
} 