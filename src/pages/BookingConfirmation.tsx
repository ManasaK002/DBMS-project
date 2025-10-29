import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { bookingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentId, setPaymentId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (!paymentId.trim()) {
      toast({
        title: "Payment ID required",
        description: "Please enter a payment ID",
        variant: "destructive",
      });
      return;
    }

    setConfirming(true);
    try {
      await bookingsAPI.confirm(bookingId!, paymentId);
      setConfirmed(true);
      toast({
        title: "Booking confirmed!",
        description: "Your tickets have been booked successfully",
      });
      
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Confirmation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Redirecting to your bookings...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-6">Confirm Payment</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Payment ID
            </label>
            <Input
              placeholder="Enter payment ID"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              This is a demo. In production, integrate with a payment gateway.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/bookings')}
            className="flex-1"
            disabled={confirming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={confirming}
          >
            {confirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
