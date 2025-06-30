import ReactDOM from 'react-dom/client';
import './i18n'; // must come before App
import App from './App';
//import 'react-pro-sidebar/dist/css/styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);