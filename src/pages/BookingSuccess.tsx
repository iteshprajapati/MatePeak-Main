
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";

const BookingSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-mentor-light rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-mentor-primary" />
              </div>
              
              <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
              <p className="text-gray-600 mb-8">
                Your mentoring session has been successfully booked. We've sent a confirmation email with all the details.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Session Details</h2>
                
                <div className="text-left max-w-sm mx-auto space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mentor:</span>
                    <span className="font-medium">Dr. Priya Sharma</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">April 25, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">3:00 PM (IST)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">60 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topic:</span>
                    <span className="font-medium">Data Structures Help</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/dashboard">
                  <Button className="bg-mentor-primary hover:bg-mentor-secondary text-white w-full">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-mentor-primary text-mentor-primary">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingSuccess;
