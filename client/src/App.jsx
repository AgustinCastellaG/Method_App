import './App.scss';
import { useState, useEffect, useRef } from 'react';

import * as filestack from 'filestack-js';
import axios from 'axios';
import { CSVLink } from "react-csv";


import Navbar from './components/Navbar/Navbar';
import CustomButton from './components/Button/CustomButton';
import Footer from './components/Footer/Footer';
import CircularProgress from '@mui/material/CircularProgress';
import Dashboard from './components/Dashboard/Dashboard';
import TextField from '@mui/material/TextField';

// const client = filestack.init('A7iZhVwjGSDqjgTckWnTyz');

const App = () => {
  const [loading, setLoading] = useState(false)
  //This is to prevent having two spinners at the same because the modal has it's own
  const [pickerLoading, setPickerLoading] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showCsv, setShowCsv] = useState(false)
  const [payments, setPayments] = useState(null)
  const [csvReport, setCsvReport] = useState([])
  const [csvHeaders, setCsvHeaders] = useState([])
  const [fileUrl, setFileUrl] = useState('')

  const csvLink = useRef()

  useEffect(() => {
    if (payments) {
      setShowDashboard(true)
      console.log(payments)
    }
  }, [payments])

  const handleLoadButton = async () => {
    // setPickerLoading(true)
    // const options = {
    //   fromSources: ["local_file_system", "url"],
    //   maxFiles: 1,      
    //   uploadInBackground: false,
    //   onOpen: () => console.log('opened!'),
    //   onUploadDone: async (res) =>  {
    //     setPickerLoading(false)
    //     console.log(res)
    //     setLoading(true)
    //     const data = await axios.post('http://localhost:3001/api/processdata', {
    //       url: res.filesUploaded[0].url
    //     })
    //    setPayments(data)
    //    setLoading(false)
    //   },
    //   onFileUploadFailed: (error) => {
    //     console.log(error)
    //   }
    // };
    // client.picker(options).open();
    setLoading(true);
    const data = await axios.post('http://localhost:3001/api/processdata', {
      url: fileUrl
    })
    setPayments(data)
    setLoading(false)
  }

  const handlePayButton = async () => {
    const data = await axios.post('http://localhost:3001/api/processpayments', {
      payments: payments.data.data
    })

    if (data.status === 200) {
      setShowCsv(true)
    }
  }

  const handleAccountReport = async () => {
    const data = await axios.get('http://localhost:3001/api/fundsperaccountreport', {
      params: {
        batch: payments.data.data[0].BatchId
      }
    })

    if (data.status === 200) {
      const headers = [
        { label: "Source Account", key: "_id" },
        { label: "Total Funds", key: "amount" }
      ];
      await setCsvHeaders(headers)
      await setCsvReport(data.data.data)
      csvLink.current.link.click()
    }
  }

  const handleBranchReport = async () => {
    // TODO
  }

  const handlePaymentsReport = async () => {
    const data = await axios.get('http://localhost:3001/api/paymentstatus', {
      params: {
        batch: payments.data.data[0].BatchId
      }
    })

    if (data.status === 200) {
      const headers = [
        { label: "Status", key: 'status' },
        { label: "From", key: "source" },
        { label: "To", key: "destination" },
        { label: "Amount", key: "amount" },
      ];
      await setCsvHeaders(headers)
      await setCsvReport(data.data.data)
      csvLink.current.link.click()
    }
  }

  return (
    <div className="App">
      <Navbar />
      <div className='container'>
        {!pickerLoading && loading && <CircularProgress />}
        {!pickerLoading && !loading && !showDashboard &&
          <div className='input-file-container'>
            <TextField style={{ marginBottom: 20 }} label='File URL' placeholder='insert XML file' required onChange={(e) => setFileUrl(e.target.value)}></TextField>
            <CustomButton className='load-button' variant='contained' onClick={handleLoadButton}>Load Payments</CustomButton>
          </div>
        }
        {showDashboard && <Dashboard data={payments} />}
        {!showCsv && showDashboard && <CustomButton className='pay-button' variant='contained' onClick={handlePayButton}>Pay</CustomButton>}
        {showCsv &&
          <div className='report-button-container'>
            <CustomButton className='csv source-report' onClick={handleAccountReport}>Get funds per source</CustomButton>
            <CSVLink data={csvReport} headers={csvHeaders} filename='report.csv' style={{ display: 'none' }} ref={csvLink} target='_blank'></CSVLink>

            <CustomButton className='csv branch-report' onClick={handleBranchReport} disabled>Get funds per branch</CustomButton>
            {/* <CSVLink data={csvReport} headers={csvHeaders} filename='report.csv' style={{ display: 'none' }} ref={csvLink} target='_blank'></CSVLink> */}

            <CustomButton className='csv payments-report' onClick={handlePaymentsReport}>Get payment's status</CustomButton>
            <CSVLink data={csvReport} headers={csvHeaders} filename='report.csv' style={{ display: 'none' }} ref={csvLink} target='_blank'></CSVLink>
          </div>
        }

      </div>
      <Footer />
    </div>
  );
}

export default App;
