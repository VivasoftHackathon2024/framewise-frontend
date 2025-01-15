import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from 'react-toastify'
import App from './App.jsx'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 0,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <ToastContainer/>
        {/* <ReactQueryDevtools 
          initialIsOpen={false}
          toggleButtonProps={{
            style: {
              marginLeft: '5px',
              transform: 'scale(0.8)',
            },
          }}
        /> */}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
