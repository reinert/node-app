const { ApiError } = require('../errors')
const HttpStatus = require('http-status')
const { Repository } = require('../../db')
const ResourceHandler = require('./resource-handler')
const { User } = require('../../core')

const B64_REGEX = new RegExp(
  '^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$'
)

class UserHandler extends ResourceHandler(User) {
  static retrievePassword (req, res, next) {
    let b64Password = req.get('encp')

    if (b64Password) {
      try {
        if (!B64_REGEX.test(b64Password)) {
          throw new TypeError('Not a base64 string')
        }
        req.password = Buffer.from(b64Password, 'base64').toString()
      } catch (err) {
        const message = 'encp header is not base64 encoded'
        return next(new ApiError(message, HttpStatus.BAD_REQUEST))
      }
    }

    return next()
  }

  // @override
  static create (req, res, next) {
    if (!req.password) {
      const message = 'encp header must be informed'
      return next(new ApiError(message, HttpStatus.BAD_REQUEST))
    }

    let user = new User(req.body)
    user.setPassword(req.password)
      .then(user => Repository.save(user))
      .then(user =>
        res.status(HttpStatus.CREATED)
          .location(`${req.baseUrl}/${user.id}`)
          .json(user))
      .catch(next)
  }

  // @override
  static merge (req, res, next) {
    req.user.merge(req.body)

    return (req.password ? req.user.setPassword(req.password)
                         : Promise.resolve(req.user))
      .then(user => Repository.save(user))
      .then(user => res.json(user))
      .catch(next)
  }
}

module.exports = UserHandler
