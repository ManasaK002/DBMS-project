import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { bookingsAPI, authHelpers } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Calendar, MapPin, Ticket } from "lucide-react";

interface Booking {
  id: number;
  booking_time: string;
  total_amount: number;
  status: string;
  movie_title: string;
  poster_url: string;
  show_date: string;
  show_time: string;
  theater_name: string;
  address: string;
  screen_name: string;
  seats: string[];
}

export default function Bookings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!authHelpers.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingsAPI.getUserBookings();
      setBookings(data.bookings);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await bookingsAPI.cancel(String(bookingId));
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold">My Bookings</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="pt-24 px-6 pb-12">
        <div className="container mx-auto max-w-4xl">
          {bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
              <p className="text-muted-foreground mb-6">
                Start by booking tickets for your favorite movies
              </p>
              <Button onClick={() => navigate('/movies')}>
                Browse Movies
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-36 bg-muted rounded overflow-hidden flex-shrink-0">
                      {booking.poster_url ? (
                        <img
                          src={booking.poster_url}
                          alt={booking.movie_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🎬
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            {booking.movie_title}
                          </h3>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed'
                                ? 'bg-primary/20 text-primary'
                                : booking.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-destructive/20 text-destructive'
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-2xl font-bold">
                          ₹{booking.total_amount}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(booking.show_date).toLocaleDateString()} at{' '}
                            {booking.show_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {booking.theater_name} - {booking.screen_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Ticket className="w-4 h-4 text-muted-foreground" />
                          <span>Seats: {booking.seats.join(', ')}</span>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/booking/${booking.id}`)}
                          >
                            Complete Payment
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
