import './App.scss';
import { useState } from 'react';

import * as filestack from 'filestack-js';
import axios from 'axios';

import Navbar from './components/Navbar/Navbar';
import CustomButton from './components/Button/CustomButton';
import Footer from './components/Footer/Footer';
import CircularProgress from '@mui/material/CircularProgress';

const client = filestack.init('A7iZhVwjGSDqjgTckWnTyz');

const App = () => {
  const [loading, setLoading] = useState(false)
  //This is to prevent having two spinners at the same because the modal has it's own
  const [pickerLoading, setPickerLoading] = useState(false)

  const handleLoadButton = async () => {
    // setPickerLoading(true)
    // const options = {
    //   maxFiles: 1,      
    //   uploadInBackground: false,
    //   onOpen: () => console.log('opened!'),
    //   onUploadDone: (res) =>  {
    //     setPickerLoading(false)
    //     //send to backend to process data
    //     console.log(res)
    //     setLoading(true)
    //   },
    // };
    // client.picker(options).open();
    setLoading(true);
    const data = await axios.post('http://localhost:3001/api/processdata', {
      url: 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/8c08a999-4b9e-44b8-bc17-bbaf8c219101/dunkin.xml?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220316%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220316T155350Z&X-Amz-Expires=86400&X-Amz-Signature=f295edad6aefeab497934844b019e51bf7a5909800b53ea500323311b1cd12c4&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22dunkin.xml%22&x-id=GetObject'
    })
    console.log(data)
  }

  return (
    <div className="App">
      <Navbar/>
      <div className='container'>
        { !pickerLoading && loading && <CircularProgress /> }
        { !pickerLoading && !loading && <CustomButton variant='contained' onClick={handleLoadButton}>Load Payments</CustomButton> }
      </div>
      <Footer/>
    </div>
  );
}

export default App;
