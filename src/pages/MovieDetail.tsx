import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { moviesAPI, showsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Star, Calendar, MapPin, Loader2 } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  language: string;
  genre: string;
  rating: string;
  poster_url: string;
  release_date: string;
}

interface Show {
  id: number;
  show_date: string;
  show_time: string;
  price: number;
  available_seats: number;
  screen_name: string;
  screen_type: string;
}

interface Theater {
  theater_id: number;
  theater_name: string;
  address: string;
  shows: Show[];
}

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (movie && selectedDate) {
      fetchShows();
    }
  }, [selectedDate]);

  const fetchMovieDetails = async () => {
    try {
      const movieData = await moviesAPI.getById(id!);
      setMovie(movieData);
      
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
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

  const fetchShows = async () => {
    try {
      const showsData = await showsAPI.getByMovie(id!, { date: selectedDate });
      setTheaters(showsData.theaters || []);
    } catch (error: any) {
      toast({
        title: "Error loading shows",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getNextDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The movie you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/movies')}>Back to Movies</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Button>
        </div>
      </header>

      <main className="pt-24 px-6 pb-12">
        <div className="container mx-auto max-w-6xl">
          {/* Movie Info */}
          <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
            {/* Poster */}
            <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  🎬
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="outline" className="text-sm">
                    {movie.genre}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {movie.language}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {movie.rating}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{movie.duration} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>8.5/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.description}
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Select Date</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {getNextDates().map((date) => (
                <Button
                  key={date.value}
                  variant={selectedDate === date.value ? "default" : "outline"}
                  onClick={() => setSelectedDate(date.value)}
                  className="whitespace-nowrap"
                >
                  {date.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Theaters & Shows */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Shows</h2>
            {theaters.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No shows available for the selected date.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {theaters.map((theater) => (
                  <Card key={theater.theater_id} className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-1">
                        {theater.theater_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{theater.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {theater.shows.map((show) => (
                        <Link
                          key={show.id}
                          to={`/shows/${show.id}/seats`}
                          className="block"
                        >
                          <Button
                            variant="outline"
                            className="w-full flex flex-col h-auto py-3 hover:border-primary"
                            disabled={show.available_seats === 0}
                          >
                            <span className="font-semibold">
                              {show.show_time}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {show.screen_name}
                            </span>
                            <span className="text-xs text-primary mt-1">
                              ₹{show.price}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {show.available_seats} seats
                            </span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
