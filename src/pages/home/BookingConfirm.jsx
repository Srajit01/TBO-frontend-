import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const BookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { prebookData, room } = location.state || {};
    const [customerDetails, setCustomerDetails] = useState([
        {
            CustomerNames: [{ Title: "Mr", FirstName: "", LastName: "", Type: "Adult" }],
        },
    ]);
    const [paymentMode, setPaymentMode] = useState("NewCard"); // Default to NewCard
    const [paymentInfo, setPaymentInfo] = useState({
        CvvNumber: "",
        CardNumber: "",
        CardExpirationMonth: "",
        CardExpirationYear: "",
        CardHolderFirstName: "",
        CardHolderLastName: "",
        BillingAmount: "",
        BillingCurrency: "",
        CardHolderAddress: {
            AddressLine1: "",
            City: "",
            PostalCode: "",
            CountryCode: ""
        }

    });
    const [bookingResponse, setBookingResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({}); // To store form errors


    useEffect(() => {
        if (prebookData && prebookData.HotelResult && prebookData.HotelResult[0]?.Rooms && prebookData.HotelResult[0].Rooms[0]?.TotalFare) {
            setPaymentInfo(prev => ({...prev, BillingAmount: prebookData.HotelResult[0].Rooms[0].TotalFare, BillingCurrency: prebookData.HotelResult[0].Currency }));
        }
    }, [prebookData]);

    const handleCustomerChange = (index, field, value, customerIndex) => {
        const updatedCustomerDetails = [...customerDetails];
        if(field==="FirstName" || field==="LastName" || field==="Title" || field==="Type"){
            updatedCustomerDetails[index].CustomerNames[customerIndex] = {...updatedCustomerDetails[index].CustomerNames[customerIndex], [field]:value}
        }else{
            updatedCustomerDetails[index] = { ...updatedCustomerDetails[index], [field]: value };
        }

        setCustomerDetails(updatedCustomerDetails);
        setFormErrors(prev => ({...prev, [`customer-${index}-${customerIndex}-${field}`] : null }))
    };
    const addCustomer = (index) => {
        const updatedCustomerDetails = [...customerDetails];
        if(updatedCustomerDetails[index].CustomerNames.length >= 4){
            alert("You can only add maximum 4 guest per room");
            return;
        }
        updatedCustomerDetails[index] = {
            ...updatedCustomerDetails[index],
            CustomerNames:[...updatedCustomerDetails[index].CustomerNames,{ Title: "Mr", FirstName: "", LastName: "", Type: "Adult" }]
        };
        setCustomerDetails(updatedCustomerDetails);
    };
    const addRoom = () => {
        setCustomerDetails([...customerDetails,{
            CustomerNames:[{ Title: "Mr", FirstName: "", LastName: "", Type: "Adult" }]
        }])
    }

    const handlePaymentInfoChange = (e) => {
        const { name, value } = e.target;
         if(name.startsWith("CardHolderAddress.")){
           const addressField = name.split(".").pop();
           setPaymentInfo((prev)=> ({...prev, CardHolderAddress:{...prev.CardHolderAddress, [addressField]:value}}));
         }else {
            setPaymentInfo((prev) => ({ ...prev, [name]: value }));
        }
        setFormErrors(prev => ({...prev, [name]: null}))
    };

    const validateForm = () => {
      let isValid = true;
      const newErrors = {};

         customerDetails.forEach((customer, index) => {
             customer.CustomerNames.forEach((name, customerIndex) => {
                 if(!name.FirstName){
                   newErrors[`customer-${index}-${customerIndex}-FirstName`] = "First Name is required";
                   isValid = false;
                 }
                 if(!name.LastName){
                   newErrors[`customer-${index}-${customerIndex}-LastName`] = "Last Name is required";
                   isValid = false;
                 }
             });
         });

        const requiredPaymentFields = [
          "CardNumber",
          "CardExpirationMonth",
          "CardExpirationYear",
          "CardHolderFirstName",
          "CardHolderLastName",
          "CvvNumber",
          "CardHolderAddress.AddressLine1",
          "CardHolderAddress.City",
          "CardHolderAddress.PostalCode",
          "CardHolderAddress.CountryCode",
        ];

        requiredPaymentFields.forEach(field => {
          const value = field.includes('.') ? getNestedValue(paymentInfo, field) : paymentInfo[field]

          if (!value) {
            newErrors[field] = `${field.split('.').pop().replace(/([A-Z])/g, ' $1').trim()} is required`;
            isValid = false;
          }
        });
       setFormErrors(newErrors);
        return isValid;
    };
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };


    const handleBook = async () => {
      if(!validateForm()){
          return;
      }
        setLoading(true);
        setError(null);
        setBookingResponse(null);

        try {
             const bookingDataToSave = {
                 BookingCode: room.BookingCode,
                 CustomerDetails: customerDetails,
                 BookingType: "Voucher",
                 PaymentMode: paymentMode,
                 PaymentInfo: paymentInfo,
                 ClientReferenceId: "1626265961573-16415097",
                 BookingReferenceId: "AVw123218",
                 TotalFare: paymentInfo.BillingAmount,
                 EmailId: "apisupport@tboholidays.com",
                 PhoneNumber: "918448780621"
             };
               await axios.post(
                "http://localhost:9090/api/Book",
                   bookingDataToSave,
                    {
                     headers: {
                         "Content-Type": "application/json",
                       }
                 }
            );
            const bookResponse = await axios.post(
                "http://localhost:9090/api/Book",
                {
                    BookingCode: room.BookingCode,
                    CustomerDetails: customerDetails,
                    BookingType: "Voucher",
                    PaymentMode: paymentMode,
                    PaymentInfo: paymentInfo,
                    ClientReferenceId: "1626265961573-16415097",
                    BookingReferenceId: "AVw123218",
                    TotalFare:paymentInfo.BillingAmount,
                    EmailId: "apisupport@tboholidays.com",
                    PhoneNumber: "918448780621"
                }
                , {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });


            setBookingResponse(bookResponse.data);
            navigate("/bookings",{ state: { bookingData: bookResponse.data } });

        } catch (err) {
            setError(
                err.response ? err.response.data.error : "An unexpected error occurred during booking."
            );
            console.error("Error in handleBook:", err)
        } finally {
            setLoading(false);
        }
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Complete Your Booking</h2>

                {prebookData && prebookData.HotelResult && prebookData.HotelResult[0]?.Rooms && prebookData.HotelResult[0].Rooms[0]?.TotalFare &&(
                    <p className="text-xl font-semibold text-gray-700 mb-4 text-center">
                        Total Fare: ${prebookData.HotelResult[0].Rooms[0].TotalFare}
                    </p>
                )}
                <h3 className="text-xl font-bold text-gray-700 mb-4">Customer Details</h3>
                {customerDetails.map((customer, index) => (
                    <div key={index} className="mb-6 p-4 border border-gray-300 rounded-lg">
                        {customer.CustomerNames && customer.CustomerNames.map((names, customerIndex) => (
                            <div key={customerIndex} className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-600 mb-2">Guest {customerIndex+1} Details:</h4>
                                <div className="flex flex-wrap gap-4">
                                    <div className="w-full sm:w-auto flex-grow">
                                        <label htmlFor={`title-${index}-${customerIndex}`} className="block text-sm font-medium text-gray-700">Title</label>
                                        <select
                                            id={`title-${index}-${customerIndex}`}
                                            value={names.Title}
                                            onChange={(e) => handleCustomerChange(index, "Title", e.target.value, customerIndex)}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="Mr">Mr</option>
                                            <option value="Mrs">Mrs</option>
                                            <option value="Ms">Ms</option>
                                        </select>
                                    </div>
                                    <div  className="w-full sm:w-auto flex-grow">
                                        <label htmlFor={`firstName-${index}-${customerIndex}`} className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            id={`firstName-${index}-${customerIndex}`}
                                            value={names.FirstName}
                                            onChange={(e) => handleCustomerChange(index, "FirstName", e.target.value, customerIndex)}
                                            className={`mt-1 block w-full p-2 border ${formErrors[`customer-${index}-${customerIndex}-FirstName`] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                                        />
                                         {formErrors[`customer-${index}-${customerIndex}-FirstName`] && (
                                          <p className="text-red-500 text-sm">{formErrors[`customer-${index}-${customerIndex}-FirstName`]}</p>
                                        )}
                                    </div>
                                    <div  className="w-full sm:w-auto flex-grow">
                                        <label htmlFor={`lastName-${index}-${customerIndex}`} className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            id={`lastName-${index}-${customerIndex}`}
                                            value={names.LastName}
                                            onChange={(e) => handleCustomerChange(index, "LastName", e.target.value, customerIndex)}
                                             className={`mt-1 block w-full p-2 border ${formErrors[`customer-${index}-${customerIndex}-LastName`] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                                        />
                                         {formErrors[`customer-${index}-${customerIndex}-LastName`] && (
                                           <p className="text-red-500 text-sm">{formErrors[`customer-${index}-${customerIndex}-LastName`]}</p>
                                         )}
                                    </div>
                                    <div className="w-full sm:w-auto flex-grow">
                                        <label htmlFor={`type-${index}-${customerIndex}`} className="block text-sm font-medium text-gray-700">Type</label>
                                        <select
                                            id={`type-${index}-${customerIndex}`}
                                            value={names.Type}
                                            onChange={(e) => handleCustomerChange(index, "Type", e.target.value, customerIndex)}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addCustomer(index)}
                                className="mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            Add Guest
                        </button>
                    </div>
                ))}

                <button
                    onClick={() => addRoom()}
                    className="mb-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Add Room
                </button>
                <h3 className="text-xl font-bold text-gray-700 mb-4">Payment Information</h3>
                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700">Payment Mode</label>
                        <select
                            id="paymentMode"
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="Limit">Limit</option>
                            <option value="SavedCard">Saved Card</option>
                            <option value="NewCard">New Card</option>
                        </select>
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="CardNumber"
                            value={paymentInfo.CardNumber}
                            onChange={handlePaymentInfoChange}
                             className={`mt-1 block w-full p-2 border ${formErrors.CardNumber ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                         />
                       {formErrors.CardNumber && <p className="text-red-500 text-sm">{formErrors.CardNumber}</p>}
                    </div>
                    <div className="w-full sm:w-1/4">
                        <label htmlFor="cardExpirationMonth" className="block text-sm font-medium text-gray-700">Expiration Month</label>
                        <input
                            type="text"
                            id="cardExpirationMonth"
                            name="CardExpirationMonth"
                            value={paymentInfo.CardExpirationMonth}
                            onChange={handlePaymentInfoChange}
                            className={`mt-1 block w-full p-2 border ${formErrors.CardExpirationMonth ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}

                         />
                       {formErrors.CardExpirationMonth && <p className="text-red-500 text-sm">{formErrors.CardExpirationMonth}</p>}
                    </div>
                    <div className="w-full sm:w-1/4">
                        <label htmlFor="cardExpirationYear" className="block text-sm font-medium text-gray-700">Expiration Year</label>
                        <input
                            type="text"
                            id="cardExpirationYear"
                            name="CardExpirationYear"
                            value={paymentInfo.CardExpirationYear}
                            onChange={handlePaymentInfoChange}
                             className={`mt-1 block w-full p-2 border ${formErrors.CardExpirationYear ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}

                        />
                       {formErrors.CardExpirationYear && <p className="text-red-500 text-sm">{formErrors.CardExpirationYear}</p>}
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="cardHolderFirstName" className="block text-sm font-medium text-gray-700">Card Holder First Name</label>
                        <input
                            type="text"
                            id="cardHolderFirstName"
                            name="CardHolderFirstName"
                            value={paymentInfo.CardHolderFirstName}
                            onChange={handlePaymentInfoChange}
                             className={`mt-1 block w-full p-2 border ${formErrors.CardHolderFirstName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                           />
                       {formErrors.CardHolderFirstName && <p className="text-red-500 text-sm">{formErrors.CardHolderFirstName}</p>}
                    </div>
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="cardHolderLastName" className="block text-sm font-medium text-gray-700">Card Holder Last Name</label>
                        <input
                            type="text"
                            id="cardHolderLastName"
                            name="CardHolderLastName"
                            value={paymentInfo.CardHolderLastName}
                            onChange={handlePaymentInfoChange}
                            className={`mt-1 block w-full p-2 border ${formErrors.CardHolderLastName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                           />
                      {formErrors.CardHolderLastName && <p className="text-red-500 text-sm">{formErrors.CardHolderLastName}</p>}
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="cvvNumber" className="block text-sm font-medium text-gray-700">CVV</label>
                        <input
                            type="text"
                            id="cvvNumber"
                            name="CvvNumber"
                            value={paymentInfo.CvvNumber}
                            onChange={handlePaymentInfoChange}
                              className={`mt-1 block w-full p-2 border ${formErrors.CvvNumber ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                            />
                         {formErrors.CvvNumber && <p className="text-red-500 text-sm">{formErrors.CvvNumber}</p>}
                    </div>
                </div>
                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                        <input
                            type="text"
                            id="addressLine1"
                            name="CardHolderAddress.AddressLine1"
                            value={paymentInfo.CardHolderAddress.AddressLine1}
                            onChange={handlePaymentInfoChange}
                              className={`mt-1 block w-full p-2 border ${formErrors["CardHolderAddress.AddressLine1"] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                            />
                         {formErrors["CardHolderAddress.AddressLine1"] && <p className="text-red-500 text-sm">{formErrors["CardHolderAddress.AddressLine1"]}</p>}
                    </div>
                </div>
                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-1/3">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            id="city"
                            name="CardHolderAddress.City"
                            value={paymentInfo.CardHolderAddress.City}
                            onChange={handlePaymentInfoChange}
                            className={`mt-1 block w-full p-2 border ${formErrors["CardHolderAddress.City"] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                            />
                      {formErrors["CardHolderAddress.City"] && <p className="text-red-500 text-sm">{formErrors["CardHolderAddress.City"]}</p>}
                    </div>
                    <div className="w-full sm:w-1/3">
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                        <input
                            type="text"
                            id="postalCode"
                            name="CardHolderAddress.PostalCode"
                            value={paymentInfo.CardHolderAddress.PostalCode}
                            onChange={handlePaymentInfoChange}
                            className={`mt-1 block w-full p-2 border ${formErrors["CardHolderAddress.PostalCode"] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                           />
                        {formErrors["CardHolderAddress.PostalCode"] && <p className="text-red-500 text-sm">{formErrors["CardHolderAddress.PostalCode"]}</p>}
                    </div>
                    <div className="w-full sm:w-1/3">
                        <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700">Country Code</label>
                        <input
                            type="text"
                            id="countryCode"
                            name="CardHolderAddress.CountryCode"
                            value={paymentInfo.CardHolderAddress.CountryCode}
                            onChange={handlePaymentInfoChange}
                             className={`mt-1 block w-full p-2 border ${formErrors["CardHolderAddress.CountryCode"] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}
                           />
                       {formErrors["CardHolderAddress.CountryCode"] && <p className="text-red-500 text-sm">{formErrors["CardHolderAddress.CountryCode"]}</p>}
                    </div>

                </div>
                <button
                    onClick={handleBook}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                    disabled={loading}
                >
                    {loading ? "Booking..." : "Book Now"}
                </button>

                {error && (
                    <div className="mt-6 bg-red-50 border border-red-400 text-red-700 p-4 rounded-lg">
                        <h3 className="font-bold">Error</h3>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;