
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { getMentorById } from "@/data/mentors";
import { MentorProfile } from "@/components/MentorCard";

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      const foundMentor = getMentorById(id);
      if (foundMentor) {
        setMentor(foundMentor);
      }
      setLoading(false);
    }
  }, [id]);

  const handleBookingSubmit = (data: any) => {
    console.log("Booking submitted:", data);
    // In a real app, this would send data to your backend
    setBookingSubmitted(true);
    
    // Simulate a redirect after booking confirmation
    setTimeout(() => {
      navigate("/booking-success");
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading booking page...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-12">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              The mentor you're trying to book a session with doesn't exist or may have been removed.
            </AlertDescription>
          </Alert>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-mentor-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-mentor-primary hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentor Profile
          </button>
          
          <div className="max-w-3xl mx-auto">
            {bookingSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Booking Request Submitted!</h2>
                <p className="text-gray-600 mb-4">
                  Your booking request has been submitted successfully. You'll be redirected to the confirmation page shortly.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <BookingForm 
                    mentorId={mentor.id} 
                    mentorName={mentor.name} 
                    onSubmit={handleBookingSubmit} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

import { CheckCircle } from "lucide-react";

export default BookingPage;
