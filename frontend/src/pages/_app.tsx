
import {AppProps} from "next/app"
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primeicons/primeicons.css";
import '../static/jank-empty.css';
/* import '../../public/styles/edit-asset.css';
import '../../public/styles/create-form.css';
import '../../public/styles/templates.css'; */

// Import your custom components or layout components
function MyApp({ Component, pageProps }:AppProps) {
  // Additional setup or global configurations can be added here
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
