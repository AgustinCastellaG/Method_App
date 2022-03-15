import './App.scss';
import { useState } from 'react';

import * as filestack from 'filestack-js';

import Navbar from './components/Navbar/Navbar';
import CustomButton from './components/Button/CustomButton';
import Footer from './components/Footer/Footer';
import CircularProgress from '@mui/material/CircularProgress';

const client = filestack.init('A7iZhVwjGSDqjgTckWnTyz');

const App = () => {
  const [loading, setLoading] = useState(false)
  //This is to prevent having two spinners at the same because the modal has it's own
  const [pickerLoading, setPickerLoading] = useState(false)

  const handleLoadButton = () => {
    setPickerLoading(true)
    const options = {
      maxFiles: 1,      
      uploadInBackground: false,
      onOpen: () => console.log('opened!'),
      onUploadDone: (res) =>  {
        setPickerLoading(false)
        //send to backend to process data
        console.log(res)
        setLoading(true)
      },
    };
    client.picker(options).open();
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
