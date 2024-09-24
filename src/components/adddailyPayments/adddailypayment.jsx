import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../App.css";
import toast from 'react-hot-toast';
import Spinner from '../../Spinner';

const AddDailyPayment = () => {
    const initialPayment = {
        date: new Date().toISOString().split('T')[0],
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
        percentage: "",
        isDelete: false,
        isEdit: false
    };

    const [payment, setPayment] = useState(initialPayment);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    //const [existingDates, setExistingDates] = useState([]);
     const [existingPayments, setExistingPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    const inputHandler = (e) => {
        const { name, value } = e.target;
        setPayment(prevState => {
            const newPayment = { ...prevState, [name]: value };


            // Calculate payment when percentage or totalEarning changes
            if (name === 'percentage' || name === 'totalEarning') {
                const percentageValue = name === 'percentage' ? value : newPayment.percentage;
                const earningValue = name === 'totalEarning' ? value : newPayment.totalEarning;

                if (percentageValue && earningValue) {
                    const paymentValue = (earningValue * percentageValue) / 100;
                    newPayment.payment = paymentValue.toFixed(2);
                }
            }

            // Calculate cashCollected and benefit
            if (newPayment.payment && newPayment.CNG && newPayment.tollTax && newPayment.totalcash) {
                newPayment.cashCollected = (newPayment.totalcash - newPayment.payment - newPayment.CNG - newPayment.tollTax).toFixed(2);
            }

            //const isDateExisting = existingDates.includes(payment.date);
             const isExistingPayment = existingPayments.some(payment => 
                payment.date === newPayment.date && payment.carAssign === newPayment.carAssign
            );

            if (newPayment.payment && newPayment.CNG) {
                let benefit = (newPayment.totalEarning - newPayment.payment - newPayment.CNG).toFixed(2);
                if (!isExistingPayment) {
                    benefit = (parseFloat(benefit) - 950).toFixed(2);
                }
                newPayment.benefit = benefit;
            }

            return newPayment;
        });

        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };



    const onClickCancel = () => {
        navigate("/dailypayments");
    };
    const submitForm = async (e) => {
        e.preventDefault();

        const formData = {
            ...payment,
            cashCollected: payment.cashCollected || 0,
            CNG: payment.CNG || 0,
            tollTax: payment.tollTax || 0,
            payment: payment.payment || 0,
            benefit: payment.benefit || 0,
            trips: payment.trips || 0,
            totalcash: payment.totalcash || 0,
            description: payment.description || "",
            percentage: payment.percentage || 0,
        };
        setLoading(true);
        try {
            console.log("Data to be saved:", formData);
            const response = await axios.post("https://cabtest.onrender.com/api/dailyPayments/create", formData);

            console.log("Response received:", response);

            toast.success(response.data.message, { position: "top-right" });
            navigate("/dailypayments");

            console.log("Data saved successfully:", formData);
        } catch (error) {
            console.error('There was an error creating the daily payment:', error);
            toast.error('Failed to create daily payment. Please try again later.', { position: "top-right" });
        }
        finally {
            setLoading(false); // Hide spinner after fetching
        }
    };

    const [users, setUsers] = useState([]);
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get("https://cabtest.onrender.com/api/user/getAllUser");
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
            finally {
                setLoading(false); // Hide spinner after fetching
            }
        };
        const fetchCars = async () => {
            setLoading(true);
            try {
                const response = await axios.get("https://cabtest.onrender.com/api/car/getAllCars");
                setCars(response.data);
            } catch (error) {
                console.error("Error fetching cars:", error);
            } finally {
                setLoading(false); // Hide spinner after fetching
            }
        };
        const fetchExistingPayments = async () => {
              setLoading(true);
           try {
                const response = await axios.get("https://cabtest.onrender.com/api/dailyPayments/getAllPayments");
                const payments = response.data;
                
             
                const paymentDetails = payments.map(payment => ({
                    date: payment.date.split('T')[0],
                    carAssign: payment.carAssign 
                }));
                
                setExistingPayments(paymentDetails);
               
            } catch (error) {
                console.error("Error fetching existing payments:", error);
            }
             finally {
                setLoading(false); // Hide spinner after fetching
            }
        };

        fetchUsers();
        fetchCars();
        fetchExistingPayments();
    }, []);

    return (
        <div className='addUser'>
            <h3 style={{ textAlign: 'center' }}>Add New Daily Payment</h3>
            {/* Show the spinner while loading */}
            {loading ? (
                <Spinner loading={loading} />
            ) : (
                <form className='addUserForm' onSubmit={submitForm}>
                    <table>
                        <tr>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='date'>Date</label>
                                    <input
                                        type='date'
                                        id="date"
                                        name="date"
                                        value={payment.date}
                                        onChange={inputHandler}
                                        autoComplete='off'
                                    />
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>

                                    <label htmlFor='user'>User</label>
                                    <select
                                        id="user"
                                        name="user"
                                        value={payment.user}
                                        onChange={inputHandler}
                                    >
                                        <option value="">Select User</option>
                                        {users.map((user) => (
                                            <option key={user._id} value={user.name}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {/* {errors.user && <p style={{ color: 'red' }}>{errors.user}</p>} */}
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='carAssign'>Car Assign</label>
                                    <select
                                        id="carAssign"
                                        name="carAssign"
                                        value={payment.carAssign}
                                        onChange={inputHandler}
                                    >
                                        <option value="">Select Car</option>
                                        {cars.map((car) => (
                                            <option key={car._id} value={car.carNumber}>
                                                {car.carNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='totalEarning'>Total Earning</label>
                                    <input
                                        type='number'
                                        id="totalEarning"
                                        name="totalEarning"
                                        value={payment.totalEarning}
                                        onChange={inputHandler}
                                        required
                                        autoComplete='off'
                                        placeholder='Enter Total Earning'
                                    />
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='totalcash'>Total Cash</label>
                                    <input
                                        type='number'
                                        id="totalcash"
                                        name="totalcash"
                                        value={payment.totalcash}
                                        onChange={inputHandler}
                                        placeholder='Enter Total cash '
                                    />
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='CNG'>CNG</label>
                                    <input
                                        type='number'
                                        id="CNG"
                                        name="CNG"
                                        value={payment.CNG}
                                        onChange={inputHandler}
                                        placeholder='Enter CNG'
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='tollTax'>Toll Tax</label>
                                    <input
                                        type='number'
                                        id="tollTax"
                                        name="tollTax"
                                        value={payment.tollTax}
                                        onChange={inputHandler}
                                        placeholder='Enter Toll Tax'
                                    />
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='percentage'>Percentage</label>
                                    <select
                                        id="percentage"
                                        name="percentage"
                                        value={payment.percentage}
                                        onChange={inputHandler}
                                    >
                                        <option value="">Select Percentage</option>
                                        <option value="30">30%</option>
                                        <option value="35">35%</option>
                                        <option value="40">40%</option>
                                        <option value="45">45%</option>
                                        <option value="50">50%</option>
                                    </select>
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='payment'>Payment</label>
                                    <input
                                        type='number'
                                        id="payment"
                                        name="payment"
                                        value={payment.payment}
                                        readOnly
                                        onChange={inputHandler}
                                        placeholder='payment calculated here'
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='cashCollected'>Cash Collected</label>
                                    <input
                                        type='number'
                                        id="cashCollected"
                                        name="cashCollected"
                                        value={payment.cashCollected}
                                        readOnly
                                        onChange={inputHandler}
                                        placeholder='cash Collected calculated here'
                                    />
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='benefit'>Benefit</label>
                                    <input
                                        type='number'
                                        id="benefit"
                                        name="benefit"
                                        value={payment.benefit}
                                        readOnly
                                        onChange={inputHandler}
                                        placeholder='benefit calculated here'
                                    />
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='trips'>Trips</label>
                                    <input
                                        type='number'
                                        id="trips"
                                        name="trips"
                                        value={payment.trips}
                                        onChange={inputHandler}
                                        placeholder='Enter Trips'
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='inputGroup'>
                                    <label htmlFor='description'>Description</label>
                                    <input
                                        type='textarea'
                                        id="description"
                                        name="description"
                                        value={payment.description}
                                        onChange={inputHandler}
                                        placeholder='Enter Description'
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='inputGroup'>
                                    <button type="submit" className="submit">Add Payment</button>
                                </div>
                            </td>
                            <td>
                                <div className='inputGroup'>
                                    <button onClick={onClickCancel}>Cancel</button>
                                </div>
                            </td>
                        </tr>
                    </table>
                </form>
            )}
        </div>
    );
};

export default AddDailyPayment;
