const bodyParser = require('body-parser')
const express = require('express')
const helmet = require('helmet')
const HttpStatus = require('http-status')
const morgan = require('morgan')
const { sequelizeErrorHandler } = require('./error-handlers')
const { uncaughtErrorHandler } = require('./error-handlers')
const { apiErrorHandler } = require('./error-handlers')
const { ApiError } = require('./errors')
const {
  authRouter,
  userRouter,
  invoiceRouter
} = require('./routers')

function notFoundHandler (req, res, next) {
  next(new ApiError(HttpStatus.NOT_FOUND))
}

module.exports = express()
  .use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  .use(helmet())
  .use(bodyParser.json({ type: 'application/json' }))
  .use('/auth', authRouter)
  .use('/users', userRouter)
  .use('/invoices', invoiceRouter)
  .use(notFoundHandler)
  .use(sequelizeErrorHandler)
  .use(apiErrorHandler)
  .use(uncaughtErrorHandler)
