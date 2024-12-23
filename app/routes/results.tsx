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

// YouTube IFrame API types
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
            modestbranding?: number;
            loop?: number;
            playlist?: string;
            start?: number;
            mute?: number;
            origin?: string;
            enablejsapi?: number;
          };
          events?: {
            onReady?: (event: {
              target: {
                playVideo: () => void;
                setVolume: (volume: number) => void;
                mute: () => void;
                unMute: () => void;
                isMuted: () => boolean;
                destroy: () => void;
              };
            }) => void;
            onError?: (event: { data: number }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => void;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

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

export default function ResultsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Create a promise to handle when the API is ready
    const loadYouTubeAPI = new Promise<void>((resolve) => {
      // If the API is already loaded, resolve immediately
      if (window.YT) {
        resolve();
        return;
      }

      // Otherwise, load the API script
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Set up the callback for when the API is ready
      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };
    });

    let player: any = null;

    // Initialize the player once the API is ready
    loadYouTubeAPI
      .then(() => {
        try {
          player = new window.YT.Player("youtube-player", {
            videoId: "kANalBOlCOQ",
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
              loop: 1,
              playlist: "kANalBOlCOQ",
              start: 0,
              mute: 0,
              origin: window.location.origin,
              enablejsapi: 1,
            },
            events: {
              onReady: (event) => {
                console.log("YouTube player is ready");
                playerRef.current = event.target;
                event.target.playVideo();
                event.target.setVolume(30);
                setIsPlayerReady(true);
              },
              onError: (event) => {
                console.error("YouTube player error:", event.data);
                setIsPlayerReady(false);
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  if (playerRef.current) {
                    playerRef.current.playVideo();
                  }
                }
              },
            },
          });
        } catch (error) {
          console.error("Error creating YouTube player:", error);
        }
      })
      .catch((error) => {
        console.error("Error loading YouTube API:", error);
      });

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error("Error destroying YouTube player:", error);
        }
      }
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);

  const toggleMute = () => {
    if (playerRef.current && isPlayerReady) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(30);
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

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
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev + 1;
        if (nextSlide >= slides.length) {
          navigate("/final-results");
          return prev;
        }
        return nextSlide;
      });
    }, 8000);

    return () => clearInterval(timer);
  }, [navigate, slides.length]);

  const renderSlideContent = (slide: Slide) => {
    if (slide.type === "list") {
      return (
        <div
          className={`w-full h-full rounded-xl  p-8 bg-gradient-to-b ${slide.gradient} text-white flex flex-col`}
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
        className={`w-full h-full rounded-xl  p-8 bg-gradient-to-b ${slide.gradient} text-white flex flex-col items-center justify-center`}
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

  return (
    <div className="h-[calc(100vh_-_57px)] flex items-center justify-center bg-gray-900 p-6 relative">
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 right-6 z-50 bg-black/10 backdrop-blur-sm hover:bg-white/20 border-none text-blue-400"
        onClick={toggleMute}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      <div className="absolute inset-0" style={{ opacity: "0" }}>
        <div id="youtube-player"></div>
      </div>

      <div className="relative h-full w-full max-w-5xl">
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
