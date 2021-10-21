import logo from './logo.svg';
// import './App.css';
import RealtimeLineChart from "./components/RealtimeLineChart";
import {useEffect, useState} from "react";


function App() {
    // const [value, setValue] = useState(14)
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const newValue = Math.floor(Math.random() * 10 + 10);
    //         setValue(newValue);
    //         return () => {
    //             clearInterval(interval)
    //         }
    //     }, 2000)
    // }, [])

    return (
        <div className="App">
            <header className="App-header">
                <RealtimeLineChart
                    lines={[{
                        dataKey: 'H2CH_Temp',
                        name: 'H2CH_Temp',
                        unit: 'irgendwas'
                    }]}

                    currentValues={{"H2CH_Temp": 14}}
                    height={200}
                    width={500}
                    initValues={[]}
                    showLegend={true}
                />
            </header>
        </div>
    );
}

export default App;
