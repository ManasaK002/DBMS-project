import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Film, Ticket, ArrowRight, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={elementRef}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <Ticket className="h-5 w-5 text-background" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              TicketHub
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/movies" className="text-foreground/70 hover:text-primary transition-colors font-medium">
              Movies
            </Link>
            <Link to="/bookings" className="text-foreground/70 hover:text-primary transition-colors font-medium">
              My Bookings
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Premium Booking Experience</span>
              </div>
              
              <h2 className="text-6xl lg:text-7xl font-bold leading-tight animate-fade-up">
                Book Your
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Next Experience
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-lg animate-fade-up" style={{ animationDelay: '200ms' }}>
                Discover and secure tickets for blockbuster movies and unforgettable live events in one seamless platform
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
                <Link to="/movies" className="flex-1 sm:flex-none">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity group">
                    <Film className="h-5 w-5 mr-2" />
                    Explore Movies
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/bookings" className="flex-1 sm:flex-none">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/50 hover:bg-primary/10 group">
                    <Ticket className="h-5 w-5 mr-2" />
                    My Bookings
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative h-[600px] hidden lg:block animate-slide-left">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-6" />
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-3xl transform -rotate-3" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-9xl">🎬</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection>
        <section className="py-24 border-y border-border">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: "500+", label: "Movies Available" },
                { number: "2M+", label: "Tickets Booked" },
                { number: "50K+", label: "Happy Customers" },
                { number: "99.9%", label: "Uptime" },
              ].map((stat, index) => (
                <div key={index} className="text-center group cursor-default">
                  <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground mt-2 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Features Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-20">
              <h3 className="text-5xl font-bold mb-6">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TicketHub
                </span>
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the future of ticket booking with our cutting-edge platform
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Film className="h-8 w-8" />,
                title: "Latest Releases",
                description: "Get instant access to the newest blockbusters and indie films hitting theaters"
              },
              {
                icon: <Ticket className="h-8 w-8" />,
                title: "Easy Seat Selection",
                description: "Choose your preferred seats with our interactive seat map and secure booking"
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Seamless Experience",
                description: "Enjoy a smooth, secure booking process from selection to confirmation"
              }
            ].map((feature, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h4 className="text-2xl font-semibold mb-4">{feature.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-3xl p-16 overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]" />
              <div className="relative text-center max-w-3xl mx-auto">
                <h3 className="text-5xl font-bold mb-6">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of satisfied customers enjoying seamless ticket booking
                </p>
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 group">
                    Get Started Now
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Ticket className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold">TicketHub</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 TicketHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
