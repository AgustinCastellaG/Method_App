const asyncHandler = require('express-async-handler')

// @desc   Process data from XML
// @route  POST /api/processData
// @access Public
const processData = asyncHandler(async (req, res) => {
  if (!req.body.text) {
    res.status(400)
    throw new Error('No text to process')
  }

  res.status(200).json({ message: 'Process Data' })
})

module.exports = {
  processData,
}