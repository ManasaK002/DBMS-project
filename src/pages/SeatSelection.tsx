import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showsAPI, bookingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Seat {
  id: number;
  seat_number: string;
  row_name: string;
  seat_type: string;
  is_booked: boolean;
}

interface Show {
  id: number;
  show_date: string;
  show_time: string;
  price: number;
  movie_title: string;
  theater_name: string;
  screen_name: string;
  screen_type: string;
}

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    fetchShowDetails();
  }, [showId]);

  const fetchShowDetails = async () => {
    try {
      const data = await showsAPI.getById(showId!);
      setShow(data.show);
      setSeats(data.seats);
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

  const toggleSeat = (seatId: number, isBooked: boolean) => {
    if (isBooked) return;
    
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat",
        variant: "destructive",
      });
      return;
    }

    setBooking(true);
    try {
      const response = await bookingsAPI.create({
        showId: Number(showId),
        seatIds: selectedSeats,
      });
      
      toast({
        title: "Booking created",
        description: `Booking expires in ${Math.floor(response.expiresIn / 60)} minutes`,
      });
      
      navigate(`/booking/${response.booking.id}`);
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row_name]) acc[seat.row_name] = [];
    acc[seat.row_name].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const totalPrice = selectedSeats.length * (show?.price || 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold">{show?.movie_title}</h1>
            <p className="text-sm text-muted-foreground">
              {show?.theater_name} - {show?.screen_name}
            </p>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="pt-24 pb-32 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Screen */}
          <div className="mb-12">
            <div className="w-full h-2 bg-gradient-to-b from-primary/50 to-transparent rounded-t-full mb-2" />
            <p className="text-center text-sm text-muted-foreground">Screen</p>
          </div>

          {/* Seat Map */}
          <div className="space-y-4 mb-8">
            {Object.entries(groupedSeats).map(([row, rowSeats]) => (
              <div key={row} className="flex items-center gap-2">
                <span className="w-8 text-sm font-medium text-muted-foreground">
                  {row}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat.id, seat.is_booked)}
                      disabled={seat.is_booked}
                      className={`
                        w-10 h-10 rounded text-xs font-medium transition-all
                        ${seat.is_booked
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : selectedSeats.includes(seat.id)
                          ? 'bg-primary text-primary-foreground scale-110'
                          : 'bg-card border border-border hover:border-primary'
                        }
                      `}
                    >
                      {seat.seat_number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <Card className="p-4 mb-8">
            <div className="flex gap-6 justify-center flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-card border border-border rounded" />
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded" />
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-muted rounded" />
                <span className="text-sm">Booked</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Bottom Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-2xl font-bold">₹{totalPrice.toFixed(2)}</p>
            </div>
            <Button
              size="lg"
              onClick={handleBooking}
              disabled={booking}
              className="min-w-[150px]"
            >
              {booking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Pay'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
