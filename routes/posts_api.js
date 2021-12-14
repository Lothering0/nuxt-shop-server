const express = require('express')
const authMiddleware = require('../middleware/auth_middleware')
const {
  fetchAllData,
  fetchDataById,
  fetchBasketPosts,
  fetchDataByUserId,
  fetchDataByCategoryId,
  createData,
  updateData,
  deleteData
} = require('../controllers/post_controller')
const router = express.Router()
const multer = require('multer')
const ApiError = require('../exceptions/api_error')

let storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  },
})

let upload = multer({
  storage,
  limits: {
    fileSize: 15728640
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb)
  }
}).single('image')

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/
  const extname = filetypes.test(file.originalname.toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb('Error: Supports types: .jpeg, .jpg, .png')
  }
}

function validateFormData(req, res, next) {
  try {
    const body = req.body
    const {
      title,
      price,
      description,
      newCategories,
      newCharacters
    } = body
    const categories = JSON.parse(newCategories)
    const characters = JSON.parse(newCharacters)

    const minPrice = 3
    const maxPrice = 30000000

    const minTitleLength = 2
    const maxTitleLength = 35

    const minDescriptionLength = 4
    const maxDescriptionLength = 300

    const maxCategoryLength = maxCharacterTypeLength = maxCharacterValueLength = 15

    if ( price < minPrice
      || price > maxPrice
      || title.length < minTitleLength
      || title.length > maxTitleLength
      || description.length < minDescriptionLength
      || description.length > maxDescriptionLength
    ) throw ApiError.badRequest('Invalid data')

    categories.forEach(({name}) => {
      if (name.length > maxCategoryLength)
        throw ApiError.badRequest('Invalid data')
    })
    characters.forEach(({character_type, character_value}) => {
      if ( character_type.length > maxCharacterTypeLength
        || character_value.length > maxCharacterValueLength
      ) throw ApiError.badRequest('Invalid data')
    })

    next()
  } catch (e) {
    console.log(e.message)
    next(ApiError.badRequest(e.message))
  }
}

router
  .get('/', fetchAllData)
  .get('/basket/', authMiddleware, fetchBasketPosts)
  .get('/:id', fetchDataById)
  .get('/user/:id', fetchDataByUserId)
  .get('/category/:name', fetchDataByCategoryId)
  .post('/',
    authMiddleware,
    upload,
    validateFormData,
    createData
  )
  .patch('/:id',
    authMiddleware,
    upload,
    validateFormData,
    updateData
  )
  .delete('/:id', authMiddleware, deleteData)

module.exports = router
