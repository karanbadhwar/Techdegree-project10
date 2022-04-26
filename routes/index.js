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
   res.redirect('/books');
});

// The Home Page
router.get('/books', async (req,res,next) =>{
  const headings = await Book.findAll();
  const head = await Book.findAndCountAll({
    limit: 6
  });
  // console.log(head.rows);
  let page = headings.length / 6;
  page = Math.ceil(page);

  res.render('index', { headings: head.rows, page })
});

router.post('/books', async(req,res) =>{
  let value = parseInt(req.body.submit);
  // console.log(value);
  if(value === 1){
    res.redirect('/books');
  }else{
    const head = await Book.findAndCountAll({
      limit: 6,
      offset: 6 * (value - 1)
    });
    // console.log(head.count);
    let page = head.count / 6;
    page = Math.ceil(page);
    res.render('index', {headings: head.rows, page})
  }
});


// Create New Book
router.get('/books/new', asyncHandler((req,res,next) =>{
  res.render('new-book');
}));

//Posting the newly created Book
router.post('/books/new', asyncHandler(async(req,res,next) =>{
  try{
    const book = await Book.create(req.body);
    res.redirect('/');
  } catch(error){
  if(error.name === 'SequelizeValidationError'){
    // console.log(error);
    res.render('createError', {error: error.errors})
  }
  // res.redirect('/');
}
}));

//Getting Book by ID
router.get('/books/:id', asyncHandler(async(req,res) =>{
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render('update-book', { book });
  } else{
    const error = new Error("Sorry! We couldn't find the page you were looking for.");
    error.status = 404;
    res.status(404);
    res.render('page-not-found',{ error } );
  }
}));

//Post data with /id(update and delete)
router.post('/books/:id', asyncHandler(async(req,res) =>{
  const book = await Book.findByPk(req.params.id);
  if(req.body.submit === 'delete'){
    await Book.destroy({
      where:{
        id: req.params.id,
      }
    });
    res.redirect('/books');
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

// Search Router
router.post('/search', async(req,res,next) =>{
  const search = req.body.search;
  if(!search){
    res.redirect('/');
  } else{
    let headings = await Book.findAll({
      where:{
        [Op.or]:[
          {id : search},
          {title: {
            [Op.like]: `%${search}%`
          }},
          {author:{
            [Op.like]: `%${search}%`
          }},
          {genre: {
            [Op.like]: `%${search}%`
          }},
          {year: {
            [Op.like]: `%${search}%`
          }}
        ]
      }
    });
  if(headings.length > 0){
    // console.log(headings.length);
    // let page = headings.length / 6;
    // page = Math.ceil(page);
   res.render('index', { headings });
  } else{
    const error = new Error("Sorry! We couldn't find the page you were looking for.");
    error.status = 404;
    res.render('page-not-found', { error })
  }
  }

});

module.exports = router;
