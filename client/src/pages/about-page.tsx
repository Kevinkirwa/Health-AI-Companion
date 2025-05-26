import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Heart, Lightbulb, Target, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "am", name: "Amharic", flag: "🇪🇹" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "ar", name: "Arabic", flag: "🇪🇬" }
];

const AboutPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600">
              About AI Health Assistant
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Transforming healthcare access across Africa through innovative AI technology
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mx-auto mb-6">
                  <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold text-center mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                  AI Health Assistant is committed to transforming healthcare access across Africa, where medical resources are often scarce and unevenly distributed. We believe that everyone deserves access to quality healthcare information, regardless of geographic or economic barriers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Language Support Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mx-auto mb-6">
                <Globe className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Language Support</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                AI Health Assistant is available in multiple languages to serve the diverse communities across Africa. Select your preferred language to get health information in a language you understand best.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  className="h-auto py-4 px-6 flex items-center gap-3 text-lg"
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Message */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-6">From the Founder</h2>
                  <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900 mx-auto mb-6 flex items-center justify-center">
                    <Users className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <blockquote className="text-xl text-gray-600 dark:text-gray-300 italic mb-8 text-center leading-relaxed">
                  "Growing up in Africa, I witnessed firsthand the challenges of limited healthcare access. AI Health Assistant is born from my vision to leverage technology to overcome these barriers, providing reliable health information and support to those who need it most."
                </blockquote>
                <div className="text-center">
                  <p className="text-xl font-semibold">— Kirwa</p>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Founder & CEO</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* African Initiative */}
      <section className="py-16 bg-primary-50 dark:bg-primary-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our African Initiative</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join us in our mission to make healthcare accessible to all Africans. Together, we can build a healthier future for our continent.
            </p>
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg">
              Learn More About Our Initiative
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 