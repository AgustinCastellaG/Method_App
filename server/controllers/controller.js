const asyncHandler = require('express-async-handler');
const xmlToJson = require('../utils/xmlToJson');
const toIso8601 = require('../utils/toIso8601');
const Entity = require('../models/entity');
const Account = require('../models/account');
const { Method, Environments } = require('method-node');

const method = new Method({
  apiKey: process.env.METHOD_API_KEY,
  env: Environments.dev,
});

const url = 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/8c08a999-4b9e-44b8-bc17-bbaf8c219101/dunkin.xml?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220316%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220316T155350Z&X-Amz-Expires=86400&X-Amz-Signature=f295edad6aefeab497934844b019e51bf7a5909800b53ea500323311b1cd12c4&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22dunkin.xml%22&x-id=GetObject'

// @desc   Process data from XML
// @route  POST /api/processData
// @access Public
const processData = asyncHandler(async (req, res) => {
  if (!req.body.url) {
    res.status(400)
    throw new Error('No url to process')
  }

  
  await xmlToJson(url, function (err, data) {
    if (err) {
      res.status(500)
      throw new Error('Error parsing XML')
    }

    if (data && data.root && data.root.row) {
      let pendingData = data.root.row.map(async (item, index) => {
        if (index === 0) {
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
            await Entity.create(iEntity)
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
            await Account.create(dAccount)
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
            await Entity.create(cEntity)
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
            await Account.create(sAccount)
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
            Amount: item.Amount[0]      
          }
        }
      })
      Promise.all(pendingData).then(function (processedData) {
        res.status(200).json({ message: 'Process Data', data: processedData.filter(item => !!item) })
      })
    }
  })
})

module.exports = {
  processData,
}