'use strict'

const path = require('path')
const Fs = require('fs')
const Q = require('q')
const Handlebars = require('handlebars')
const Hoek = require('hoek')
const Markdown = require('nodemailer-markdown').markdown
const Nodemailer = require('nodemailer')

const Config = require('../config/config')

const internals = {}

internals.transport = Nodemailer.createTransport(Config.get('/nodemailer'))
internals.transport.use('compile', Markdown({ useEmbeddedImages: true }))

internals.templateCache = {}

internals.renderTemplate = function(signature, context, Log) {
  const deferred = Q.defer()

  if (internals.templateCache[signature]) {
    deferred.resolve(internals.templateCache[signature](context))
  }

  const filePath = path(__dirname, '/emails/', signature, '.hbs.md')
  const options = { encoding: 'utf-8' }

  Fs.readFile(filePath, options, (err, source) => {
    if (err) {
      Log.debug('File Read Error:', err)
      deferred.reject(err)
    }

    internals.templateCache[signature] = Handlebars.compile(source)
    deferred.resolve(internals.templateCache[signature](context))
  })

  return deferred.promise
}

internals.sendEmail = function(options, template, context, Log) {
  return internals
    .renderTemplate(template, context, Log)
    .then(function(content) {
      const defaultEmail = Config.get('/defaultEmail')

      // send to the default email address if it exists
      if (
        !(
          Object.keys(defaultEmail).length === 0 &&
          defaultEmail.constructor === Object
        )
      ) {
        options.to.address = defaultEmail
      }

      options = Hoek.applyToDefaults(options, {
        from: Config.get('/system/fromAddress'),
        markdown: content
      })

      return internals.transport.sendMail(options)
    })
    .catch(function(error) {
      throw error
    })
}

exports.register = function(server, options, next) {
  server.expose('sendEmail', internals.sendEmail)
  server.expose('transport', internals.transport)

  next()
}

exports.sendEmail = internals.sendEmail

exports.register.attributes = {
  name: 'mailer'
}
