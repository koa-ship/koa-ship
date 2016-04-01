module.exports = {

  multipart: true,

  formidable: {
    hash: 'sha1',
    maxFieldsSize: '2mb',
  },

  uploadPath: 'data/files',

};