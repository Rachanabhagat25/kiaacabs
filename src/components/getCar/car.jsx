import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import "../../App.css";
import axios from 'axios';
import toast from 'react-hot-toast';

const Car = () => {

    const [cars, setCars] = useState([]);
    const [selectedCars, setSelectedCars] = useState(new Set());
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get("http://localhost:8000/api/car/getAllCars");
            setCars(response.data);
        }
        fetchData();
    }, [])

    const toggleUserSelection = (carId) => {
        setSelectedCars((prev) => {
            const newSelection = new Set(prev);
            if (newSelection.has(carId)) {
                newSelection.delete(carId);
            } else {
                newSelection.add(carId);
            }
            return newSelection;
        });
    };
    //<Link to={"/editCar/" + carData._id}><i className="fa-solid fa-pen-to-square"></i> </Link>
    const editCar = () => {
        if (selectedCars.size === 1) {
            const carId = Array.from(selectedCars)[0];
            // Navigate to the edit page (you might want to use history.push or navigate)
            window.location.href = `/editCar/${carId}`;
        }
    };
    const deleteCar= async () => {
        const confirmed = window.confirm("Are you sure you want to delete selected cars?");
        if (confirmed && selectedCars.size > 0) {
            try {
                const deleteRequests = Array.from(selectedCars).map(carId =>
                    axios.delete(`http://localhost:8000/api/car/delete/${carId}`)
                );
                await Promise.all(deleteRequests);
                toast.success("Selected Car deleted successfully!", { position: "top-right" });
                setCars((prevUsers) => prevUsers.filter(user => !selectedCars.has(user._id)));
                setSelectedCars(new Set());
            } catch (error) {
                console.error("Error deleting users:", error);
            }
        }
    };

    return (
        <div className='carTable'>
             <div >
            <h1 style={{ textAlign: 'center', fontWeight: 'bold', textShadow: '1px 1px 2px rgb(63, 7, 78)' }}>
                --- Cars Data ---
            </h1>
                <div className="actionButtons">
                    <button onClick={editCar} disabled={selectedCars.size !== 1}>Edit Selected</button>
                    <button onClick={deleteCar} disabled={selectedCars.size === 0}>Delete Selected</button>
                </div>
            </div>
            <div className="tableContainer">
                <table border={1} cellPadding={10} cellSpacing={0}>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>SL/No</th>
                            <th>Car Number</th>
                            <th>Car Name</th>
                            <th>Car Company</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            cars.map((carData, index) => {
                                return (
                                    <tr key={carData._id}>
                                        <td style={{textAlign:'center'}}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCars.has(carData._id)}
                                                onChange={() => toggleUserSelection(carData._id)}
                                            />
                                        </td>
                                        <td>{index + 1}</td>
                                        <td>{carData.carNumber}</td>
                                        <td>{carData.carName}</td>
                                        <td>{carData.carCompany}</td>
                                        <td>{carData.status}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            <br></br>
            <Link to={"/addCar"} className='addButton'>Add Car</Link>
        </div>
    )
}

export default Car;