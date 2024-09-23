import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditDailyPayment = () => {
    const initialPayment = {
        date: "",
        user: "",
        carAssign: "",
        totalEarning: "",
        cashCollected: "",
        totalcash: "",
        CNG: "",
        tollTax: "",
        payment: "",
        benefit: "",
        trips: "",
        description: "",
        percentage: "", // Added percentage field
        isDelete: false,
        isEdit: false
    };

    const { id } = useParams();
    const [payment, setPayment] = useState(initialPayment);
    const [users, setUsers] = useState([]);
    const [cars, setCars] = useState([]);
    const navigate = useNavigate();

    const inputChangeHandler = (e) => {
        const { name, value } = e.target;
        setPayment(prevState => {
            const newPayment = { ...prevState, [name]: value };

            // Calculate payment when percentage or totalEarning changes
            if (name === 'percentage' || name === 'totalEarning') {
                const percentageValue = newPayment.percentage || 0;
                const earningValue = newPayment.totalEarning || 0;

                if (percentageValue && earningValue) {
                    newPayment.payment = ((earningValue * percentageValue) / 100).toFixed(2);
                }
            }

            // Calculate cashCollected and benefit
            if (newPayment.payment && newPayment.CNG && newPayment.tollTax && newPayment.totalcash) {
                newPayment.cashCollected = (newPayment.totalcash - newPayment.payment - newPayment.CNG - newPayment.tollTax).toFixed(2);
            }
            if (newPayment.payment && newPayment.CNG) {
                newPayment.benefit = (newPayment.totalEarning - newPayment.payment - newPayment.CNG).toFixed(2);
            }

            return newPayment;
        });
    };

    const updateForm = async (e) => {
        e.preventDefault();
        await axios.put(`http://localhost:8000/api/dailyPayments/update/${id}`, payment)
            .then((response) => {
                toast.success(response.data.message, { position: "top-right" });
                navigate("/dailypayments");
            })
            .catch(error => console.log(error));
    };

    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/dailyPayments/fetchById/${id}`);
                const fetchedPayment = response.data;
                const formattedDate = new Date(fetchedPayment.date).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
                setPayment({ ...fetchedPayment, date: formattedDate });
            } catch (error) {
                console.log(error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/user/getAllUser");
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        const fetchCars = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/car/getAllCars");
                setCars(response.data);
            } catch (error) {
                console.error("Error fetching cars:", error);
            }
        };

        fetchPaymentData();
        fetchUsers();
        fetchCars();
    }, [id]);

    return (
        <div className='addUser'>
            <h3 style={{ textAlign: 'center' }}>Update Daily Payment</h3>
            <form className='addUserForm' onSubmit={updateForm}>
                <div className='inputGroup'>
                    <label htmlFor='date'>Date</label>
                    <input type='date' value={payment.date} onChange={inputChangeHandler} id="date" name="date" autoComplete='off' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='user'>User</label>
                    <select
                        id="user"
                        name="user"
                        value={payment.user}
                        onChange={inputChangeHandler}
                    >
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user._id} value={user.name}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='inputGroup'>
                    <label htmlFor='carAssign'>Car Assign</label>
                    <select
                        id="carAssign"
                        name="carAssign"
                        value={payment.carAssign}
                        onChange={inputChangeHandler}
                    >
                        <option value="">Select Car</option>
                        {cars.map((car) => (
                            <option key={car._id} value={car.carNumber}>
                                {car.carNumber}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='inputGroup'>
                    <label htmlFor='totalEarning'>Total Earning</label>
                    <input type='number' value={payment.totalEarning} onChange={inputChangeHandler} id="totalEarning" name="totalEarning" autoComplete='off' placeholder='Enter Total Earning' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='totalcash'>Total Cash</label>
                    <input type='number' value={payment.totalcash} onChange={inputChangeHandler} id="totalcash" name="totalcash" autoComplete='off' placeholder='Enter Total Cash' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='CNG'>CNG</label>
                    <input type='number' value={payment.CNG} onChange={inputChangeHandler} id="CNG" name="CNG" autoComplete='off' placeholder='Enter CNG' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='tollTax'>Toll Tax</label>
                    <input type='number' value={payment.tollTax} onChange={inputChangeHandler} id="tollTax" name="tollTax" autoComplete='off' placeholder='Enter Toll Tax' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='percentage'>Percentage</label>
                    <select
                        id="percentage"
                        name="percentage"
                        value={payment.percentage}
                        onChange={inputChangeHandler}
                    >
                        <option value="">Select Percentage</option>
                        <option value="30">30%</option>
                        <option value="35">35%</option>
                        <option value="40">40%</option>
                        <option value="45">45%</option>
                        <option value="50">50%</option>
                    </select>
                </div>
                <div className='inputGroup'>
                    <label htmlFor='payment'>Payment</label>
                    <input type='number' value={payment.payment} readOnly id="payment" name="payment" autoComplete='off' placeholder='Payment calculated here' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='cashCollected'>Cash Collected</label>
                    <input type='number' value={payment.cashCollected} readOnly id="cashCollected" name="cashCollected" autoComplete='off' placeholder='Cash Collected calculated here' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='benefit'>Benefit</label>
                    <input type='number' value={payment.benefit} readOnly id="benefit" name="benefit" autoComplete='off' placeholder='Benefit calculated here' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='trips'>Trips</label>
                    <input type='number' value={payment.trips} onChange={inputChangeHandler} id="trips" name="trips" autoComplete='off' placeholder='Enter Trips' />
                </div>
                <div className='inputGroup'>
                    <label htmlFor='description'>Description</label>
                    <input type='text' value={payment.description} onChange={inputChangeHandler} id="description" name="description" autoComplete='off' placeholder='Enter Description' />
                </div>
                <div className='inputGroup'>
                    <button className="submit">Update Payment</button>
                </div>
                <div className='inputGroup'>
                    <button type="button" className="cancel" onClick={() => navigate("/dailypayments")}> Cancel </button>
                </div>
            </form>
        </div>
    );
};

export default EditDailyPayment;
