import logo from './logo.svg';
import './App.css';
import {  useState } from "react";
import toast from "react-hot-toast";
function App() {
  const [data, setData] = useState({
    retrait: ""
  });
  const handleOnChange = (e) => {
    const { name, value } = e.target;
  
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  console.log("url api : ",process.env.REACT_APP_SERVER_DOMAIN);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { retrait } = data;
  
    if (retrait) {
      try {
        const fetchData = await fetch(`${process.env.REACT_APP_SERVER_DOMAIN}/addretrait`, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(data)
        });
  
        const fetchRes = await fetchData.json();
  
        if (fetchRes.success) {
          // Display a toast for successful request
          toast(fetchRes.message);
  
          // Reset the input value
          setData({ retrait: "" });
        } else {
          toast.error(fetchRes.message);
        }
      } catch (error) {
        console.error('Error while fetching data:', error);
        toast.error('An error occurred');
      }
    } else {
      toast("Enter the required fields");
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
         ANDRIAMIHAJA <code>Joelson</code>Emile
        </p>
        <a
        >
          Retrait normal :
          <form onSubmit={handleSubmit}>
        <label htmlFor="retrait">Retrait normal:</label>
        <input
          type="text"
          name="retrait"
          id="retrait"
          value={data.retrait}
          onChange={handleOnChange}
        />
        <button type="submit">Submit</button>
      </form>
        </a>
      </header>
    </div>
  );
}

export default App;
