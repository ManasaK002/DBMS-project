import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Film } from "lucide-react";
import { toast } from "sonner";
import { moviesAPI } from "@/lib/api";
import { BASE_URL } from "../config"; // ✅ added

const CreateMovie = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    rating: "",
    duration: "",
    language: "",
    release_date: "",
    description: "",
    poster_url: "",
    trailer_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await moviesAPI.create({
        title: formData.title,
        description: formData.description,
        duration: parseInt(formData.duration),
        language: formData.language,
        genre: formData.genre,
        release_date: formData.release_date,
        rating: formData.rating,
        poster_url: formData.poster_url,
        trailer_url: formData.trailer_url,
      });
      toast.success("Movie created successfully!");
      navigate("/movies");
    } catch (error: any) {
      toast.error(error.message || "Failed to create movie");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6 flex items-center gap-4">
          <Link to="/movies">
            <Button variant="ghost" size="sm" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Film className="h-5 w-5 text-background" />
            </div>
            <h1 className="text-2xl font-bold">Add New Movie</h1>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-12 max-w-3xl">
        <Card className="border-border animate-fade-up">
          <CardHeader>
            <CardTitle className="text-3xl">Movie Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Movie Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="h-12 border-border"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-base">Genre *</Label>
                  <Input
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="h-12 border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-base">Rating *</Label>
                  <Input
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="U, UA, A"
                    className="h-12 border-border"
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-base">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="135"
                    className="h-12 border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-base">Language *</Label>
                  <Input
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    placeholder="English"
                    className="h-12 border-border"
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="release_date" className="text-base">Release Date *</Label>
                  <Input
                    id="release_date"
                    name="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={handleChange}
                    className="h-12 border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poster_url" className="text-base">Poster URL *</Label>
                  <Input
                    id="poster_url"
                    name="poster_url"
                    value={formData.poster_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="h-12 border-border"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailer_url" className="text-base">Trailer URL</Label>
                <Input
                  id="trailer_url"
                  name="trailer_url"
                  value={formData.trailer_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="h-12 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="border-border resize-none"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Movie"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/movies")}
                  className="border-border h-12"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default CreateMovie;
