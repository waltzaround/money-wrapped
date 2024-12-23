import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Wallet, ClipboardList, LineChart } from "lucide-react";
import { useNavigate } from "react-router";
import "~/styles/animations.css";

interface ListItem {
  rank: number;
  name: string;
  detail: string;
}

// Add before the interfaces
const slideAnimations = [
  "slide-fade",
  "slide-up",
  "slide-down",
  "zoom-fade",
  "rotate-fade",
  "bounce-fade",
] as const;

type SlideAnimation = (typeof slideAnimations)[number];

// Update the BaseSlide interface
interface BaseSlide {
  gradient: string;
  textColor: string;
  animation?: SlideAnimation;
}

interface StandardSlide extends BaseSlide {
  type?: "standard";
  title: string;
  value: string;
  subtitle: string;
  description?: string;
}

interface ListSlide extends BaseSlide {
  type: "list";
  title: string;
  items: ListItem[];
}

type Slide = StandardSlide | ListSlide;

function fadeOutAudio(audio: HTMLAudioElement, duration: number = 8000) {
  const startVolume = audio.volume;
  const steps = 20;
  const volumeStep = startVolume / steps;
  const stepDuration = duration / steps;

  const fadeInterval = setInterval(() => {
    if (audio.volume > volumeStep) {
      audio.volume -= volumeStep;
    } else {
      audio.volume = 0;
      audio.pause();
      clearInterval(fadeInterval);
    }
  }, stepDuration);
}

function useBackgroundAudio(): React.RefObject<HTMLAudioElement | null> {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio("/bg.mp3");
    audioRef.current.loop = true;

    // Add interaction listener to document
    const startAudio = () => {
      if (!hasInteractedRef.current && audioRef.current) {
        hasInteractedRef.current = true;
        audioRef.current.play().catch((error) => {
          console.log("Audio playback failed:", error);
        });
        // Remove listener after first interaction
        document.removeEventListener("click", startAudio);
        document.removeEventListener("touchstart", startAudio);
      }
    };

    document.addEventListener("click", startAudio);
    document.addEventListener("touchstart", startAudio);

    // Cleanup function
    return () => {
      document.removeEventListener("click", startAudio);
      document.removeEventListener("touchstart", startAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return audioRef;
}

// Add this new component before ResultsPage
function TimelineSlider({
  totalSlides,
  currentSlide,
  onSlideClick,
}: {
  totalSlides: number;
  currentSlide: number;
  onSlideClick: (index: number) => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();
    const duration = 8000;

    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(animationFrame);
      }
    };

    const animation = requestAnimationFrame(animationFrame);
    return () => cancelAnimationFrame(animation);
  }, [currentSlide]);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-1 px-4 w-full max-w-[90%] sm:max-w-[600px] md:max-w-[720px] justify-center">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSlideClick(index)}
          className="group relative h-1 flex-1 min-w-[20px] max-w-[40px] bg-white/30 rounded-full overflow-hidden cursor-pointer"
        >
          <div
            className={`absolute inset-0 bg-white rounded-full origin-left
              ${index < currentSlide ? "scale-x-100" : "scale-x-0"}
              ${
                index === currentSlide
                  ? "transition-transform duration-100"
                  : "transition-transform duration-200"
              }
              ${index === currentSlide ? "opacity-100" : "opacity-75"}`}
            style={{
              transform:
                index === currentSlide
                  ? `scaleX(${progress})`
                  : index < currentSlide
                  ? "scaleX(1)"
                  : "scaleX(0)",
            }}
          />
          <div
            className={`absolute inset-0 bg-white/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out rounded-full
              ${index <= currentSlide ? "opacity-0" : ""}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const navigate = useNavigate();
  const audioRef = useBackgroundAudio();
  const timerRef = useRef<any>(null);

  const slides: Slide[] = [
    {
      type: "standard",
      gradient: "from-emerald-500 to-emerald-700",
      title: "This year you spent",
      value: "$12,300",
      subtitle: "on purchases",
      textColor: "emerald",
    },
    {
      type: "standard",
      gradient: "from-blue-500 to-blue-700",
      title: "You shopped at",
      value: "301",
      subtitle: "different businesses",
      textColor: "blue",
    },
    {
      type: "standard",
      gradient: "from-purple-500 to-purple-700",
      title: "You made",
      value: "1,230",
      subtitle: "transactions",
      textColor: "purple",
    },
    {
      type: "standard",
      gradient: "from-pink-500 to-pink-700",
      title: "Your biggest spending day was",
      value: "$432",
      subtitle: "24 December",
      description: "That's more than 87% of your daily spending",
      textColor: "pink",
    },
    {
      type: "standard",
      gradient: "from-orange-500 to-orange-700",
      title: "Your favorite restaurant was",
      value: "McDonald's",
      subtitle: "$1,230 spent on 42 visits",
      description: "That's 3x more than your second most visited restaurant",
      textColor: "orange",
    },
    {
      type: "standard",
      gradient: "from-lime-500 to-lime-700",
      title: "Your biggest purchase",
      value: "$12,432",
      subtitle: "NVIDIA GPU RENTALS",
      description: "That's more than 87% of your average purchase",
      textColor: "lime",
    },
    {
      type: "standard",
      gradient: "from-cyan-500 to-cyan-700",
      title: "Weekend warrior",
      value: "$110",
      subtitle: "average weekend spending",
      description: "You tend to spend 40% more on weekends",
      textColor: "cyan",
    },
    {
      type: "standard",
      gradient: "from-violet-500 to-violet-700",
      title: "You visitied a cafe",
      value: "110 times",
      subtitle: "this year",
      description: "That's about 2 cafe visits per week",
      textColor: "violet",
    },
    {
      type: "list",
      gradient: "from-rose-500 to-rose-700",
      title: "Your Top 5 Restaurants",
      textColor: "rose",
      items: [
        { rank: 1, name: "McDonald's", detail: "$1,230 spent" },
        { rank: 2, name: "Domino's Pizza", detail: "$890 spent" },
        { rank: 3, name: "Burger Fuel", detail: "$750 spent" },
        { rank: 4, name: "Hell Pizza", detail: "$680 spent" },
        { rank: 5, name: "Subway", detail: "$520 spent" },
      ],
    },
    {
      type: "list",
      gradient: "from-amber-500 to-amber-700",
      title: "Most Expensive Months",
      textColor: "amber",
      items: [
        { rank: 1, name: "December", detail: "$2,430 spent" },
        { rank: 2, name: "July", detail: "$1,890 spent" },
        { rank: 3, name: "November", detail: "$1,750 spent" },
        { rank: 4, name: "August", detail: "$1,680 spent" },
        { rank: 5, name: "March", detail: "$1,520 spent" },
      ],
    },
    {
      type: "list",
      gradient: "from-teal-500 to-teal-700",
      title: "Top Shopping Categories",
      textColor: "teal",
      items: [
        { rank: 1, name: "Groceries", detail: "$3,230 spent" },
        { rank: 2, name: "Dining Out", detail: "$2,890 spent" },
        { rank: 3, name: "Entertainment", detail: "$1,750 spent" },
        { rank: 4, name: "Transport", detail: "$1,680 spent" },
        { rank: 5, name: "Shopping", detail: "$1,520 spent" },
      ],
    },
    {
      type: "standard",
      gradient: "from-indigo-500 to-indigo-700",
      title: "Thanks for watching",
      value: "2024",
      subtitle: "Money Wrapped",
      description:
        "We hope you enjoyed your 2024 Money Wrapped. This was made possible by Akahu.",
      textColor: "indigo",
    },
  ];

  // Assign random animations to slides
  const slidesWithAnimations = useMemo(() => {
    return slides.map((slide) => ({
      ...slide,
      animation:
        slideAnimations[Math.floor(Math.random() * slideAnimations.length)],
    }));
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev + 1;
        if (nextSlide >= slides.length - 1) {
          if (audioRef.current) {
            fadeOutAudio(audioRef.current);
          }
        }
        if (nextSlide >= slides.length) {
          navigate("/final-results");
          return prev;
        }
        return nextSlide;
      });
    }, 8000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [navigate, slides.length]);

  const renderSlideContent = (slide: Slide) => {
    if (slide.type === "list") {
      return (
        <div
          className={`w-full h-full rounded-xl p-8 bg-gradient-to-b ${slide.gradient} text-white flex flex-col shadow-lg`}
        >
          <p
            className={`text-2xl font-bold text-${slide.textColor}-100 mb-6 text-center`}
          >
            {slide.title}
          </p>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {slide.items.map((item: ListItem) => (
              <div
                key={item.rank}
                className="flex items-center gap-4 p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
              >
                <span
                  className={`text-${
                    4 - item.rank + 1
                  }xl font-bold min-w-[2rem]`}
                >
                  {item.rank}
                </span>
                <div className="flex-1">
                  <p className={`text-${4 - item.rank + 1}xl font-semibold`}>
                    {item.name}
                  </p>
                  <p className={`text-${slide.textColor}-100 opacity-90`}>
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`w-full h-full rounded-xl p-8 bg-gradient-to-b ${slide.gradient} text-white flex flex-col items-center justify-center shadow-lg`}
      >
        <p className={`text-lg text-${slide.textColor}-100 mb-2`}>
          {slide.title}
        </p>
        <p className="text-6xl font-bold mb-2">{slide.value}</p>
        <p className={`text-lg text-${slide.textColor}-100`}>
          {slide.subtitle}
        </p>
        {slide.description && (
          <p className={`text-lg text-${slide.textColor}-100 mt-4 text-center`}>
            {slide.description}
          </p>
        )}
      </div>
    );
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimelineClick = (index: number) => {
    setCurrentSlide(index);
    // Reset the timer when manually changing slides
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev + 1;
        if (nextSlide >= slides.length - 1) {
          if (audioRef.current) {
            fadeOutAudio(audioRef.current);
          }
        }
        if (nextSlide >= slides.length) {
          navigate("/final-results");
          return prev;
        }
        return nextSlide;
      });
    }, 8000);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 relative p-12 max-md:p-0">
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 bg-black/10 backdrop-blur-sm hover:bg-white/20 border-none text-blue-400"
        onClick={toggleMute}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      <TimelineSlider
        totalSlides={slides.length}
        currentSlide={currentSlide}
        onSlideClick={handleTimelineClick}
      />

      <div className="relative h-full w-full ">
        {slidesWithAnimations.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 ${
              currentSlide === index ? `${slide.animation}-enter` : "opacity-0"
            }`}
            style={{
              willChange: "transform, opacity",
              transformOrigin: "center center",
            }}
          >
            {renderSlideContent(slide)}
          </div>
        ))}
      </div>
    </div>
  );
}
