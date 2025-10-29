import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, ArrowLeft, Plus, Star, Loader2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { moviesAPI } from "@/lib/api";
import { toast } from "sonner";

const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Movies = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const data = await moviesAPI.getAll();
      setMovies(data.movies);
    } catch (error: any) {
      toast.error("Failed to load movies");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Ticket className="h-5 w-5 text-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Movies</h1>
                <p className="text-xs text-muted-foreground">Latest releases</p>
              </div>
            </div>
          </div>
          <Link to="/admin/create-movie">
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Movie
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-6">
          <div className="max-w-3xl animate-fade-up">
            <h2 className="text-6xl font-bold mb-6">
              Now{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Showing
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover the latest blockbusters and indie films. Book your tickets today.
            </p>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.map((movie, index) => (
              <AnimatedCard key={movie.id} delay={index * 50}>
                <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-500 bg-card">
                  <Link to={`/movies/${movie.id}`}>
                    <div className="aspect-[2/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🎬</span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {movie.title}
                        </h3>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {new Date(movie.release_date).getFullYear()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{movie.genre}</Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="font-medium">{movie.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-medium text-muted-foreground">{movie.duration} min</span>
                        <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Movies;
