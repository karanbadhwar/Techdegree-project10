var express = require('express');
var router = express.Router();
//Importing Books Model
const Book = require('../models').Book;

const {Op} = require('sequelize');

// AsyncHandler

  function asyncHandler (cb){
    return async(req,res,next) => {
      try {
        await cb(req,res,next);
      }catch(error){
        next(error);
      }
    }
}


/* GET home page. */
router.get('/', async function(req, res, next) {
   res.redirect('/book');
});

// The Home Page
router.get('/book', async (req,res,next) =>{
  const headings = await Book.findAll();
  // console.log(headings);
  res.render('index', { headings })
});

// Create New Book
router.get('/book/new', asyncHandler((req,res,next) =>{
  res.render('new');
}));

//Posting the newly created Book
router.post('/book/new', asyncHandler(async(req,res,next) =>{
  try{
    const book = await Book.create(req.body);
  } catch(error){
  if(error.name === 'SequelizeValidationError'){
    // console.log(error);
    res.render('createError', {error: error.errors})
  }
  // res.redirect('/');
}
}));

//Getting Book by ID
router.get('/book/:id', asyncHandler(async(req,res) =>{
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render('id', { book });
  } else{
    const error = new Error("Sorry! We couldn't find the page you were looking for.");
    error.status = 404;
    res.status(404);
    res.render('page-not-found',{ error } );
  }
}));

//Post data with /id(update and delete)
router.post('/book/:id', asyncHandler(async(req,res) =>{
  const book = await Book.findByPk(req.params.id);
  if(req.body.submit === 'delete'){
    await Book.destroy({
      where:{
        id: req.params.id,
      }
    });
    res.redirect('/');
  } else if(req.body.submit === 'update'){
    try{
      await book.update(req.body);
      res.redirect('/');
    }catch(error){
      if(error.name === 'SequelizeValidationError'){
        res.render('updateError', { error: error.errors, book })
      }
    }
  } else if(req.body.submit === 'cancel'){
    res.redirect('/');
  }
}));

router.post('/search', async(req,res,next) =>{
  const search = req.body.search;
  if(!search){
    res.redirect('/');
  } else{
    let book = await Book.findAll({
      where:{
        [Op.or]:[
          {id : search},
          {title: search},
        ]
      }
    });
  book = book[0];
  if(book){
   res.render('id', { book });
  } else{
    const error = new Error('This page is not available');
    error.status = 404;
    next(error);
  }
  }

});

module.exports = router;
