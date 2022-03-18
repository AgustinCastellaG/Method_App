const asyncHandler = require('express-async-handler');
const xmlToJson = require('../utils/xmlToJson');
const toIso8601 = require('../utils/toIso8601');
const parseAmount = require('../utils/parseAmount');
const Entity = require('../models/entity');
const Account = require('../models/account');
const Payment = require('../models/payment');
const { Method, Environments } = require('method-node');

const { v4: uuidv4 } = require('uuid');

const method = new Method({
  apiKey: process.env.METHOD_API_KEY,
  env: Environments.dev,
});

function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

const processBatch = async (allRows, pageSize, i, batchId) => {
  const currentRows = paginate(allRows, pageSize, i);
  let batchData = await Promise.all(
    currentRows.map(async (item) => {
      try {
        // Create individual entity from Employee  
        const iEntity = await method.entities.create({
          type: 'individual',
          individual: {
            first_name: item.Employee[0].FirstName[0],
            last_name: item.Employee[0].LastName[0],
            phone: item.Employee[0].PhoneNumber[0],
            dob: toIso8601(item.Employee[0].DOB[0])
          }
        })

        if (iEntity) {
          let localIEntity = await Entity.create(iEntity)
          localIEntity.batch_id = batchId
          localIEntity.dunkin_branch = item.Employee[0].DunkinBranch[0]
          await localIEntity.save()
        } else {
          res.status(500)
          throw new Error('Error while creating individual Entity')
        }

        // Create destination account from Payee
        const merchants = await method.merchants.list({ 'provider_id.plaid': item.Payee[0].PlaidId[0] });
        const dAccount = await method.accounts.create({
          holder_id: iEntity.id,
          liability: {
            mch_id: merchants[0].mch_id,
            account_number: item.Payee[0].LoanAccountNumber[0]
          }
        })

        if (dAccount) {
          let localDAccount = await Account.create(dAccount)
          localDAccount.batch_id = batchId
          await localDAccount.save()
        } else {
          res.status(500)
          throw new Error('Error while creating destination account')
        }

        // Create corporation entity from Payor
        const cEntity = await method.entities.create({
          type: 'c_corporation',
          corporation: {
            name: item.Payor[0].Name[0],
            dba: item.Payor[0].DBA[0],
            ein: item.Payor[0].EIN[0],
            owners: []
          },
          address: {
            line1: item.Payor[0].Address[0].Line1[0],
            line2: item.Payor[0].Address[0].Line2 ? item.Payor[0].Address[0].Line2[0] : null,
            city: item.Payor[0].Address[0].City[0],
            state: item.Payor[0].Address[0].State[0],
            zip: item.Payor[0].Address[0].Zip[0],
          }
        })

        if (cEntity) {
          let localCEntity = await Entity.create(cEntity)
          localCEntity.batch_id = batchId
          await localCEntity.save()
        } else {
          res.status(500)
          throw new Error('Error while creating corporation Entity')
        }

        // Create source account from Payor
        const sAccount = await method.accounts.create({
          holder_id: cEntity.id,
          ach: {
            routing: item.Payor[0].ABARouting[0],
            number: item.Payor[0].AccountNumber[0],
            type: 'checking'
          }
        })

        if (sAccount) {
          let localSAccount = await Account.create(sAccount)
          localSAccount.batch_id = batchId
          await localSAccount.save()
        } else {
          res.status(500)
          throw new Error('Error while creating source account')
        }

        // Create Object to show in dashboard
        return {
          Employee: {
            firstName: iEntity.individual.first_name,
            lastName: iEntity.individual.last_name,
            dunkinId: item.Employee[0].DunkinId[0],
            accountId: dAccount.id
          },
          Payor: {
            name: cEntity.corporation.name,
            dunkinId: item.Payor[0].DunkinId[0],
            ein: cEntity.corporation.ein,
            accountId: sAccount.id
          },
          Amount: item.Amount[0],
          BatchId: batchId
        }
      } catch (error) {
        console.log(error)
      }
    })
  )
  return batchData
}

// @desc   Process data from XML
// @route  POST /api/processData
// @access Public
const processData = asyncHandler(async (req, res) => {
  if (!req.body.url) {
    res.status(400)
    throw new Error('No url to process')
  }

  await xmlToJson(req.body.url, async function (err, data) {
    if (err) {
      res.status(500)
      throw new Error('Error parsing XML')
    }

    if (data && data.root && data.root.row) {
      let allRows = data.root.row.slice(0, 20)
      const pageSize = 100
      const pageCount = Math.ceil(allRows.length / pageSize)
      const batchId = uuidv4()

      let processedData = []

      processPage(1, pageCount, allRows, pageSize, res, processedData, batchId)
    }
  })
})

const processPage = async (page, pageCount, allRows, pageSize, res, processedData, batchId) => {
  if (page > pageCount) return;

  setTimeout(async () => {
    let batchData = await processBatch(allRows, pageSize, page, batchId)
    batchData.map(item => {
      processedData.push(item)
    })
    if (page === pageCount) {
      res.status(200).json({ message: 'Process Data', data: processedData.filter(item => !!item) })
    }
    processPage(page + 1, pageCount, allRows, pageSize, res, processedData, batchId)
  }, page === 1 ? 0 : 60000)
}


// @desc   Process payments 
// @route  POST /api/processPayments
// @access Public
const processPayments = asyncHandler(async (req, res) => {
  if (!req.body.payments) {
    res.status(400)
    throw new Error('No payments to process')
  }

  // Create payments 
  req.body.payments.map(async (item) => {
    const payment = await method.payments.create({
      amount: parseAmount(item.Amount),
      source: item.Payor.accountId,
      destination: item.Employee.accountId,
      description: 'Loan'
    })

    if (payment) {
      let localPayment = await Payment.create(payment)
      localPayment.batch_id = item.BatchId
      await localPayment.save()
    } else {
      res.status(500)
      throw new Error('Error while creating payment')
    }
  })

  res.status(200).json({ message: 'Payments created' })

})

// @desc   Get funds per source account report
// @route  POST /api/fundsPerAccountReport
// @access Public
const fundsPerAccountReport = asyncHandler(async (req, res) => {
  if (!req.query.batch) {
    res.status(400)
    throw new Error('Please enter a batch id')
  }

  try {
    const payments = await Payment.aggregate([
      {
        $match: { batch_id: req.query.batch }
      },
      {
        $group: {
          _id: "$source",
          amount: { $sum: "$amount" }
        },

      }
    ])

    res.status(200).json({ message: 'data got successfully', data: payments })

  } catch (error) {
    throw new Error(error)
  }
})

// @desc   Get funds per branch report
// @route  POST /api/fundsPerBranchReport
// @access Public
const fundsPerBranchReport = asyncHandler(async (req, res) => {
  if (!req.query.batch) {
    res.status(400)
    throw new Error('Please enter a batch id')
  }

  try {
    // TODO: Query to retrieve funds per branch

    res.status(200).json({ message: 'data got successfully', data: payments })

  } catch (error) {
    throw new Error(error)
  }
})

// @desc   Get payments status report
// @route  POST /api/paymentsStatus
// @access Public
const paymentsStatus = asyncHandler(async (req, res) => {
  if (!req.query.batch) {
    res.status(400)
    throw new Error('Please enter a batch id')
  }

  try {
    const payments = await Payment.find({ batch_id: req.query.batch}, {'status':1, 'source':1, 'destination':1, 'amount':1, '_id':0})

    res.status(200).json({ message: 'data got successfully', data: payments })

  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  processData,
  processPayments,
  fundsPerAccountReport,
  fundsPerBranchReport,
  paymentsStatus
}