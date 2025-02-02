import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RoomCard = ({ room, onSelect }) => {
    const roomImages = [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39",
        "https://th.bing.com/th/id/R.25b86c23a77f0e94d5e909cc1b3bceff?rik=Djcc7WwfZAnIjA&riu=http%3a%2f%2fcache.marriott.com%2fmarriottassets%2fmarriott%2fSTFCT%2fstfct-guestroom-0045-hor-clsc.jpg%3finterpolation%3dprogressive-bilinear%26&ehk=Qfi1Qy2RPsgQGGJQ%2bDLh1pnflcQlURsqEc584MAYrZI%3d&risl=&pid=ImgRaw&r=0",
    ];

    const [paymentMethod, setPaymentMethod] = useState("");
    const [bookingStatus, setBookingStatus] = useState(null);
    const [prebookData, setPrebookData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePrebook = async () => {
        setLoading(true);
        setError(null);
        setBookingStatus(null);

        try {
            const prebookResponse = await axios.post(
                "https://tbo-server-v1-0.onrender.com/api/prebook",
                {
                    BookingCode: room.BookingCode,
                    PaymentMode: paymentMethod,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (prebookResponse.data && prebookResponse.data.Status.Code === 200) {
                setPrebookData(prebookResponse.data);
                setBookingStatus("Prebooked successfully");
                setShowConfirmation(true);
            } else {
                setError("Prebook Failed");
                setBookingStatus("Prebook Failed");
            }
        } catch (err) {
            console.error("Error during prebooking:", err);
            setError("Failed to prebook. Please check your connection and try again.");
            setBookingStatus("Prebook Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToBooking = () => {
        navigate('/booking-confirm', { state: { prebookData, room } });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Images Section */}
                <div className="w-full md:w-1/3 grid grid-cols-2 gap-4">
                    {roomImages.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Room ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg transition-transform transform hover:scale-105"
                        />
                    ))}
                </div>

                {/* Room Details Section */}
                <div className="w-full md:w-2/3 flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">{room.Name}</h3>
                        <p className="text-gray-700 mt-2">{room.Description}</p>
                        <p className="text-gray-600 mt-1">Inclusion: {room.Inclusion}</p>
                        <p className="text-gray-600 mt-1">Meal Type: {room.MealType}</p>
                        <p className="text-gray-800 font-bold mt-2">Tax: ${room.TotalTax}</p>
                        <p className={`mt-1 ${room.IsRefundable ? "text-green-600" : "text-red-600"}`}>
                            {room.IsRefundable ? "Refundable" : "Non-Refundable"}
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-4">
                            Room Price: ${room.TotalFare} / night
                        </p>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                        <p className="text-sm text-gray-500">Available Rooms: {room.Availability}</p>
                    </div>
                </div>
            </div>

             {!showConfirmation ? (
                <>
                    <div className="mt-4">
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Select Payment Method:
                            </label>
                            <select
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                value={paymentMethod}
                                onChange={handlePaymentChange}
                                disabled={bookingStatus === "Prebooked successfully"}
                            >
                                <option value="">Select Payment Method</option>
                                <option value="Limit">Limit</option>
                                <option value="Saved Card">Saved Card</option>
                                <option value="New Card">New Card</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        {
                            bookingStatus === "Prebooked successfully" ?
                                (
                                    <button
                                        className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg  transition-colors disabled:opacity-50"
                                        disabled
                                    >
                                        Booked
                                    </button>
                                ) : (
                                    <button
                                        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        onClick={handlePrebook}
                                        disabled={!paymentMethod}
                                    >
                                       {loading ? "Booking..." : "Book Now"}
                                    </button>
                                )
                        }
                    </div>
                     {error && (
                        <p className="mt-4 text-red-600 text-center">Error: {error}</p>
                     )}
                      {bookingStatus && bookingStatus!=="Prebook Failed" && (
                         <p className="mt-4 text-green-600 text-center">{bookingStatus}</p>
                     )}
                        {bookingStatus==="Prebook Failed" && (
                         <p className="mt-4 text-red-600 text-center">Prebook Failed</p>
                        )}
                </>
            ) : (
                // Show confirmation details
               <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Booking Confirmation</h2>
                    {prebookData?.HotelResult?.map((hotel, index) => (
                    <div key={index}>
                         <p><strong>Currency:</strong> {hotel.Currency}</p>
                         {hotel.Rooms && hotel.Rooms.length > 0 && (
                             hotel.Rooms.map((roomDetail, roomIndex) => (
                                 <div key={roomIndex}>
                                     <p><strong>Room Name:</strong> {roomDetail.Name[0]}</p>
                                      {roomDetail.Amenities && roomDetail.Amenities.length > 0 && (
                                          <div>
                                          <strong>Amenities:</strong>
                                               <ul>
                                                {roomDetail.Amenities.slice(0, 10).map((amenity, amenityIndex) => (
                                                  <li key={amenityIndex}>{amenity}</li>
                                                ))}
                                            </ul>
                                          </div>
                                         )}
                                          <p><strong>Total Fare:</strong> ${roomDetail.TotalFare}</p>
                                          <p><strong>Total Tax:</strong> ${roomDetail.TotalTax}</p>
                                            {roomDetail.DayRates && roomDetail.DayRates.length > 0 && (
                                             <div>
                                                 
                                                      <p>
                                                        <strong>Total Base Price:</strong> $
                                                        {roomDetail.DayRates.reduce((sum, dailyRates) =>
                                                          sum + dailyRates.reduce((dailySum, dayRate) => dailySum + dayRate.BasePrice, 0)
                                                        ,0).toFixed(2)}
                                                     </p>

                                               </div>
                                         )}
                                         <p><strong>Inclusion:</strong> {roomDetail.Inclusion}</p>


                                     {roomDetail.CancelPolicies && roomDetail.CancelPolicies.length > 0 && (
                                         <div>
                                             <strong>Cancellation Policies:</strong>
                                             <ul>
                                               {roomDetail.CancelPolicies.map((policy, policyIndex) => (
                                                 <li key={policyIndex}>
                                                   From: {policy.FromDate},
                                                      Charge Type: {policy.ChargeType},
                                                      Cancellation Charge: {policy.CancellationCharge}
                                                </li>
                                                  ))}
                                             </ul>
                                          </div>
                                      )}
                                 </div>
                             ))
                         )}

                    </div>
                   ))}
                    <button
                        onClick={handleProceedToBooking}
                        className="mt-6 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Proceed To Booking
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoomCard;