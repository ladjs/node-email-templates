import {ensureDirectory} from './util'
import {isFunction, defaults} from 'lodash'
import EmailTemplate from './email-template'
import Debug from 'debug'
import {basename} from 'path'

const debug = Debug('email-templates:creator')

export default function (templateDirectory, options, done) {
  if (isFunction(options)) {
    done = options
    options = {}
  }
  if (!templateDirectory) {
    return done(new Error('templateDirectory is undefined'))
  }

  return ensureDirectory(templateDirectory, function (err) {
    if (err) return done(err)
    debug('Creating Email Templates in %s', basename(templateDirectory))
    return done(null, template(templateDirectory, options))
  })
}

function template (templateDirectory, options) {
  return function _template (directory, locals, callback) {
    if (isFunction(locals)) {
      callback = locals
      locals = {}
    }
    locals = defaults(locals, options)
    if (directory == null) {
      return callback(new Error('templateName was not defined'))
    }

    var et = new EmailTemplate(`${templateDirectory}/${directory}`)
    if (locals === true) {
      return callback(null, function (locals, dir, next) {
        et.render(locals, function (err, result) {
          result = result || {}
          next(err, result.html, result.text)
        })
      })
    }

    et.render(locals, function (err, result) {
      result = result || {}
      callback(err, result.html, result.text)
    })
  }
}