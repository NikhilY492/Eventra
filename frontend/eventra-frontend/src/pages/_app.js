import '../styles/globals.css';
// Base URL for the Django API
const API_BASE_URL = "http://localhost:8000/api";
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;