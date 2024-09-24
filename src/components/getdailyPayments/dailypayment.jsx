import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../../App.css";
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '../../Spinner';
import { useNavigate } from 'react-router-dom';


const DailyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState(new Set());
    const [heading, setHeading] = useState("--- Daily Payments ---"); 

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const response = await axios.get("https://cabtest.onrender.com/api/dailyPayments/getAllPayments");
                const sortedPayments = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setPayments(sortedPayments);
                setFilteredPayments(sortedPayments);

            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false); // Hide spinner after fetching
            }
        };

        fetchData();
    }, []);

    const getStartOfWeek = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // When it's Sunday, subtract 6 days, else start on Monday
        return new Date(date.setDate(diff));
    };
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const filterPayments = (weekOffset) => {
        const today = new Date();
        const startOfWeek = getStartOfWeek(new Date(today));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7); // End of the week is 6 days later

        // Adjust for previous week
        startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7);
        endOfWeek.setDate(endOfWeek.getDate() + weekOffset * 7);

        const filtered = payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= startOfWeek && paymentDate <= endOfWeek;
        });

        setFilteredPayments(filtered);

          // Update the heading based on the weekOffset value
          if (weekOffset === 0) {
            setHeading("--- Current Week Payments ---");
        } else if (weekOffset === -1) {
            setHeading("--- Previous Week Payments ---");
        }
    };

    const showAllPayments = () => {
        setFilteredPayments(payments);
        setHeading("--- Daily Payments ---");
    };

    const calculateTotals = () => {
        return filteredPayments.reduce((totals, payment) => {
            totals.totalEarning += Number(payment.totalEarning) || 0;
            totals.totalCash += Number(payment.totalcash) || 0;
            totals.CNG += Number(payment.CNG) || 0;
            totals.tollTax += Number(payment.tollTax) || 0;
            totals.payment += Number(payment.payment) || 0;
            totals.cashCollected += Number(payment.cashCollected) || 0;
            totals.benefit += Number(payment.benefit) || 0;
            totals.trips += Number(payment.trips) || 0;
            return totals;
        }, {
            totalEarning: 0,
            totalCash: 0,
            CNG: 0,
            tollTax: 0,
            payment: 0,
            cashCollected: 0,
            benefit: 0,
            trips: 0,
        });
    };
    const totals = calculateTotals();

    const toggleUserSelection = (carId) => {
        setSelectedPayments((prev) => {
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
    const navigate = useNavigate();

    const editPayment = () => {
        if (selectedPayments.size === 1) {
            const paymentId = Array.from(selectedPayments)[0];
            // Use navigate to redirect without page refresh
            navigate(`/editDailyPayment/${paymentId}`);
        } else if (selectedPayments.size === 0) {
            alert("Select at least one record to edit");
        }
    };
    
    const deletePayment = async () => {
        if (selectedPayments.size > 0) {
            const confirmed = window.confirm("Are you sure you want to delete selected Payment?");
            if (confirmed && selectedPayments.size > 0) {
                setLoading(true);
                try {
                    const deleteRequests = Array.from(selectedPayments).map(carId =>
                        axios.delete(`https://cabtest.onrender.com/api/dailyPayments/delete/${carId}`)
                    );
                    await Promise.all(deleteRequests);
                    toast.success("Selected payments deleted successfully!", { position: "top-right" });

                    // Update both payments and filteredPayments
                    const updatedPayments = payments.filter(payment => !selectedPayments.has(payment._id));
                    setPayments(updatedPayments);
                    setFilteredPayments(updatedPayments); // Ensure filteredPayments is updated

                    // Clear the selection
                    setSelectedPayments(new Set());
                } catch (error) {
                    console.error("Error deleting payments:", error);
                }
                finally {
                    setLoading(false); // Stop spinner when operation completes
                }
            }
        }
        if (selectedPayments.size === 0) {
            alert("Select at least one record to Delete")
        }
    };

    return (
        <div className='userTable'>
            <div className="loading-bar-container">
                <div id="loading-bar" className="loading-bar"></div>
            </div>
            <div>
                <h1 style={{ textAlign: 'center', fontWeight: 'bold', textShadow: '1px 1px 2px rgb(63, 7, 78)' }}>
                {heading}
                </h1>
                <br></br>
                <div className="actionButtons">
                    <button onClick={editPayment}>Edit Selected</button>
                    <button onClick={deletePayment} >Delete Selected</button>
                    <Link to={"/addDailyPayment"} className='addButton'>Add Daily Payment</Link>
                    <button type="button" className="cancel" onClick={() => filterPayments(0)}>Show This Week</button>
                    <button type="button" className="cancel" onClick={() => filterPayments(-1)}>Show Previous Week</button>
                    <button type="button" className="cancel" onClick={showAllPayments}>Show All Data</button>
                </div>

            </div>
            {loading ? (
                <Spinner loading={loading} />
            ) : (
                <div className="tableContainer">
                    <table border={1} cellPadding={10} cellSpacing={0}>
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>SL/No</th>
                                <th>Date</th>
                                <th>User</th>
                                <th>Car Assign</th>
                                <th>Total Earning</th>
                                <th>Total Cash</th>
                                <th>CNG</th>
                                <th>Toll Tax</th>
                                <th>Payment</th>
                                <th>Cash Collected</th>
                                <th>Benefit</th>
                                <th>Trips</th>
                                <th>Percentage</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                !loading && filteredPayments.map((payment, index) => {
                                    const isNegativeBenefit = Number(payment.benefit) < 0;
                                    return (
                                        <tr key={payment._id} style={{ backgroundColor: isNegativeBenefit ? 'rgb(225, 102, 102)' : '' }}>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPayments.has(payment._id)}
                                                    onChange={() => toggleUserSelection(payment._id)}
                                                />
                                            </td>
                                            <td>{index + 1}</td>
                                            <td>{formatDate(payment.date)}</td>
                                            <td>{payment.user}</td>
                                            <td>{payment.carAssign}</td>
                                            <td>{payment.totalEarning}</td>
                                            <td>{payment.totalcash}</td>
                                            <td>{payment.CNG}</td>
                                            <td>{payment.tollTax}</td>
                                            <td>{payment.payment}</td>
                                            <td>{payment.cashCollected}</td>
                                            <td>{payment.benefit}</td>
                                            <td>{payment.trips}</td>
                                            <td>{payment.percentage}</td>
                                            <td>{payment.description}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>)}
            <br></br>
            <div className="totaltable">
                <table border={1} cellPadding={20} cellSpacing={0}>
                    <thead >
                        <tr>
                            <th>Total</th>
                            <th>Total Earning</th>
                            <th>Total Cash</th>
                            <th>CNG</th>
                            <th>Toll Tax</th>
                            <th>Payment</th>
                            <th>Cash Collected</th>
                            <th>Benefit</th>
                            <th>Trips</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total</td>
                            <td>{totals.totalEarning.toFixed(2)}</td>
                            <td>{totals.totalCash.toFixed(2)}</td>
                            <td>{totals.CNG}</td>
                            <td>{totals.tollTax}</td>
                            <td>{totals.payment.toFixed(2)}</td>
                            <td>{totals.cashCollected.toFixed(2)}</td>
                            <td>{totals.benefit.toFixed(2)}</td>
                            <td>{totals.trips}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br></br>

        </div>
    );
};

export default DailyPayments;
