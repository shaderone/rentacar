import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from './app/store';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* provider is used to make the Redux store available to react components */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
