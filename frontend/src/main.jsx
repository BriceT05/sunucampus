import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: { borderRadius: '12px', fontFamily: 'Inter', fontSize: '14px', fontWeight: 500 },
        success: { style: { background: '#10B981', color: '#fff' } },
        error:   { style: { background: '#EF4444', color: '#fff' } },
      }}
    />
  </BrowserRouter>
);
