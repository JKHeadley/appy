'use strict'

const Joi = require('joi')
const Boom = require('boom')
const Chalk = require('chalk')
const Uuid = require('node-uuid')
const im = require('imagemagick')
const fs = require('fs')
const errorHelper = require('../utilities/errorHelper')

const AWS = require('aws-sdk')

const Config = require('../../config')

const authStrategy = Config.get('/restHapiConfig/authStrategy')
const S3BucketName = Config.get('/S3BucketName')

const headersValidation = Joi.object({
  authorization: Joi.string().required()
}).options({ allowUnknown: true })

const internals = {}

/**
 * Apply any formatting we want to images.
 * @param image
 * @param Log
 */
internals.formatImage = function(image, Log) {
  return new Promise((resolve, reject) => {
    fs.writeFileSync(image.name, image.file)

    im.identify(image.name, function(err, features) {
      if (err) {
        Log.error(err)
        reject(err)
      } else {
        Log.debug('Original size:', features.width, features.height)
        let width = 350
        let height = 350

        // Resize any profile images to 256x256
        im.resize(
          {
            srcPath: image.name,
            dstPath: image.name,
            width: width,
            height: height,
            quality: 1
          },
          function(err, stdout, stderr) {
            if (err) {
              Log.error(err)
              reject(err)
            } else {
              let resizedImage = {
                name: image.name,
                file: fs.readFileSync(image.name)
              }
              fs.unlink(image.name)
              resolve(resizedImage)
            }
          }
        )
      }
    })
  })
}

module.exports = function(server, mongoose, logger) {
  // NOTE: AWS credentials are automatically loaded from environment variables, otherwise they should be loaded via json
  // EX: AWS.config.loadFromPath(__dirname + '/../aws-upload.json');

  // Upload Profile Image Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Upload File'))

    Log.note('Generating Upload File endpoint')

    const uploadHandler = async function(request, h) {
      try {
        let data = request.payload

        Log.log('Uploading File:', data)

        let fileExtenstion = data.name ? data.name.split('.').pop() : 'png'

        data = await internals.formatImage(data, Log)
        // The filenames should be unique but also tied to the user
        let key =
          request.auth.credentials.user._id +
          '_' +
          Uuid.v4() +
          '.' +
          fileExtenstion

        let s3 = new AWS.S3()
        let params = {
          Bucket: S3BucketName,
          Key: key,
          Body: data.file
        }

        let promise = new Promise((resolve, reject) => {
          s3.putObject(params, function(err, res) {
            if (err) {
              Log.error(err)
              reject(Boom.badData('There was an error uploading the file.'))
            } else {
              Log.log('Upload complete for:', data.name)
              resolve(
                'https://s3-us-west-2.amazonaws.com/' +
                  params.Bucket +
                  '/' +
                  params.Key
              )
            }
          })
        })

        return await promise
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'POST',
      path: '/file/upload/profile-image',
      config: {
        handler: uploadHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'uploadProfileImage', '!-uploadProfileImage']
        },
        description: 'Upload Profile Image to S3.',
        tags: ['api', 'Upload', 'Profile Image'],
        payload: {
          // output: 'stream',
          maxBytes: 30 * 1024 * 1024, // max 30 MB
          parse: true,
          allow: 'multipart/form-data',
          timeout: false
        },
        validate: {
          headers: headersValidation,
          payload: {
            name: Joi.string().required(),
            file: Joi.any()
              .meta({ swaggerType: 'file' })
              .description('File Data')
              .required()
          }
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ],
            payloadType: 'form'
          }
        }
      }
    })
  })()

  // Upload Image Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Upload File'))

    Log.note('Generating Upload File endpoint')

    const uploadHandler = async function(request, h) {
      try {
        var data = request.payload

        Log.log('Uploading File:', data)

        let fileExtenstion = data.name ? data.name.split('.').pop() : 'png'

        // The filenames should be unique but also tied to the user
        let key =
          request.auth.credentials.user._id +
          '_' +
          Uuid.v4() +
          '.' +
          fileExtenstion

        let s3 = new AWS.S3()
        let params = {
          Bucket: S3BucketName,
          Key: key,
          Body: data.file
        }

        let promise = new Promise((resolve, reject) => {
          s3.putObject(params, function(err, res) {
            if (err) {
              Log.error(err)
              reject(Boom.badData('There was an error uploading the file.'))
            } else {
              Log.log('Upload complete for:', data.name)
              resolve(
                'https://s3-us-west-2.amazonaws.com/' +
                  params.Bucket +
                  '/' +
                  params.Key
              )
            }
          })
        })

        return await promise
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'POST',
      path: '/file/upload/image',
      config: {
        handler: uploadHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'uploadImage', '!-uploadImage']
        },
        description: 'Upload Image to S3.',
        tags: ['api', 'Upload', 'Image'],
        payload: {
          // output: 'stream',
          maxBytes: 30 * 1024 * 1024, // max 30 MB
          parse: true,
          allow: 'multipart/form-data',
          timeout: false
        },
        validate: {
          headers: headersValidation,
          payload: {
            name: Joi.string().required(),
            file: Joi.any()
              .meta({ swaggerType: 'file' })
              .description('File Data')
              .required()
          }
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ],
            payloadType: 'form'
          }
        }
      }
    })
  })()
}
