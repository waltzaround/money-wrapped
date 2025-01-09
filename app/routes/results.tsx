import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Button } from "~/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Volume2,
  VolumeX,
  Download,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Wallet, ClipboardList, LineChart } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router";
import "~/styles/animations.css";
// import FloatingLogos from "~/components/slides/FloatingLogos";
// import TransactionSparkLine from "~/components/slides/TransactionSparkLine";
// import TransactionMonthBars from "~/components/slides/TransactionMonthBars";

interface ListItem {
  rank: number;
  name: string;
  detail: string;
  logo?: string;
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
  backgroundElm?: () => React.ReactNode;
}

// Update the StandardSlide interface
interface StandardSlide extends BaseSlide {
  type?: "standard";
  title: string;
  value: string;
  subtitle: string;
  description?: string;
}

// Update the ListSlide interface
interface ListSlide extends BaseSlide {
  type: "list";
  title: string;
  items: ListItem[];
}

// Update the Slide type to be a union
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

function useBackgroundAudio(): [
  React.RefObject<HTMLAudioElement | null>,
  boolean,
  () => void
] {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio("/bg.mp3");
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;

    const startAudio = async () => {
      if (!hasStartedRef.current && audio) {
        hasStartedRef.current = true;
        try {
          await audio.play();
        } catch (error) {
          console.log("Autoplay failed, waiting for interaction:", error);
          // If autoplay fails, fall back to click/touch interaction
          document.addEventListener("click", handleInteraction);
          document.addEventListener("touchstart", handleInteraction);
        }
      }
    };

    const handleInteraction = () => {
      if (audio && !hasStartedRef.current) {
        hasStartedRef.current = true;
        audio.play().catch(console.error);
        document.removeEventListener("click", handleInteraction);
        document.removeEventListener("touchstart", handleInteraction);
      }
    };

    // Try to start audio immediately
    startAudio();

    // Cleanup function
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Update audio mute state whenever isMuted changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  return [audioRef, isMuted, toggleMute];
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
  const [audioRef, isMuted, toggleMute] = useBackgroundAudio();
  const navigate = useNavigate();
  const rawData = localStorage.getItem("results");
  const rawTransactions = rawData
    ? JSON.parse(rawData)
        .raw_transactions.filter((t) => {
          const date = new Date(t.date);
          return (
            date.getFullYear() === 2024 &&
            date <= new Date("2024-12-31T23:59:59.999Z")
          );
        })
        // Keep only debit transactions (negative amounts)
        .filter((t) => t.amount < 0)
    : null;

  const analytics = useMemo(() => {
    if (!rawTransactions) return null;

    // Process transactions
    const totalSpent = rawTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const uniqueMerchants = new Set(
      rawTransactions
        .map((t) => {
          // For ANZ transactions without merchant data, use the description
          if (!t.merchant?.name) {
            // Clean up the description (remove location details after the first space)
            const cleanDesc = t.description.split(/\s{2,}/)[0].trim();
            return cleanDesc;
          }
          return t.merchant.name;
        })
        .filter(Boolean)
    ).size;

    const merchantLogos = Array.from(
      new Set<string>(
        rawTransactions
          .filter((t) => t.merchant?.logo)
          .map((t) => t.merchant.logo)
      )
    );

    console.log(rawTransactions);

    const transactionCount = rawTransactions.length;

    // Find biggest purchase
    const biggestPurchase = rawTransactions.reduce((max, t) => {
      const amount = Math.abs(t.amount);
      return amount > Math.abs(max?.amount || 0) ? t : max;
    }, null);

    const averagePurchase = totalSpent / transactionCount;
    const percentAboveAverage = biggestPurchase
      ? Math.round(
          ((Math.abs(biggestPurchase.amount) - averagePurchase) /
            averagePurchase) *
            100
        )
      : 0;

    // Group by month
    const monthlySpending = rawTransactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthKey] = (acc[monthKey] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

    const monthlySpendingArray = Object.entries(monthlySpending)
      .map(([month, total]) => ({
        month,
        monthName: new Intl.DateTimeFormat("en-US", {
          month: "long",
          year: "numeric",
        }).format(new Date(month + "-01")),
        total,
      }))
      .sort((a, b) => b.total - a.total);

    const highestSpendingMonth = monthlySpendingArray[0] || null;

    // Group by merchant
    const merchantSpending = rawTransactions
      .filter((t) => t.merchant?.name)
      .reduce((acc, t) => {
        const name = t.merchant.name;
        if (!acc[name]) {
          acc[name] = { amount: 0, visits: 0, logo: t.merchant.logo };
        }
        acc[name].amount += Math.abs(t.amount);
        acc[name].visits += 1;
        return acc;
      }, {});

    const topMerchants = Object.entries(merchantSpending)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 5)
      .map(([name, stats]) => ({
        name,
        amount: stats.amount,
        visits: stats.visits,
        logo: stats.logo,
      }));

    // Calculate cafe statistics
    const cafeTransactions = rawTransactions.filter(
      (t) => t.category?.name === "Cafes and restaurants"
    );

    const cafeVisits = cafeTransactions.length;
    const cafeSpending = cafeTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );
    const weeklyAverage = Math.round((cafeVisits / 52) * 10) / 10; // Round to 1 decimal place

    // Calculate spending by category
    const categorySpending = rawTransactions
      .filter((t) => t.category?.name)
      .reduce((acc, t) => {
        const categoryName = t.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += Math.abs(t.amount);
        return acc;
      }, {});

    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({
        name,
        amount,
      }));

    // Calculate weekend vs weekday spending
    const weekendSpending = rawTransactions.reduce(
      (acc, t) => {
        const date = new Date(t.date);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const amount = Math.abs(t.amount);

        if (isWeekend) {
          acc.weekendTotal += amount;
          acc.weekendDays += 1;
        } else {
          acc.weekdayTotal += amount;
          acc.weekdayDays += 1;
        }

        return acc;
      },
      { weekendTotal: 0, weekdayTotal: 0, weekendDays: 0, weekdayDays: 0 }
    );

    const averageWeekendSpending =
      weekendSpending.weekendTotal / weekendSpending.weekendDays;
    const averageWeekdaySpending =
      weekendSpending.weekdayTotal / weekendSpending.weekdayDays;
    const percentageHigher =
      ((averageWeekendSpending - averageWeekdaySpending) /
        averageWeekdaySpending) *
      100;

    return {
      totalSpent,
      uniqueMerchants,
      transactionCount,
      highestSpendingMonth,
      topMerchants,
      biggestPurchase,
      averagePurchase,
      cafeVisits,
      cafeSpending,
      weeklyAverage,
      topCategories,
      monthlySpendingArray,
      weekendSpending: {
        averagePerDay: averageWeekendSpending,
        percentageHigher,
      },
      merchantLogos,
    };
  }, [rawTransactions]);

  const timerRef = useRef<any>(null);

  // If no analytics data, redirect to upload page
  useEffect(() => {
    if (!analytics) {
      navigate("/csv");
    }
  }, [analytics, navigate]);

  // Helper function to format currency consistently
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const slides: Slide[] = useMemo(() => {
    const placeholderSlides: Slide[] = [
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
        title: "You visited cafes & restaurants",
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
        title: "Top Spending Categories",
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

    if (!analytics) return placeholderSlides;

    // Create a new array for the updated slides
    // const updatedSlides = [...placeholderSlides];

    const updatedSlides: (StandardSlide | ListSlide)[] = []; // Reusing the placeholder slides caused confusion

    // Update total spent slide
    updatedSlides.push({
      type: "standard",
      gradient: placeholderSlides[0].gradient,
      title: placeholderSlides[0].title,
      value: formatCurrency(analytics.totalSpent),
      subtitle:
        "standard" in placeholderSlides[0]
          ? (placeholderSlides[0] as StandardSlide).subtitle
          : "",
      textColor: placeholderSlides[0].textColor,
      // backgroundElm: () => <TransactionSparkLine transactions={rawTransactions} />,
    });

    // Update unique businesses slide
    updatedSlides.push({
      type: "standard",
      gradient: placeholderSlides[1].gradient,
      title: placeholderSlides[1].title,
      value: analytics.uniqueMerchants?.toString() || "0",
      subtitle: "different businesses",
      textColor: placeholderSlides[1].textColor,
      // backgroundElm: () => <FloatingLogos logos={analytics.merchantLogos} />,
    });

    // Update transaction count slide
    updatedSlides.push({
      ...placeholderSlides[2],
      type: "standard",
      value: (analytics.transactionCount || 0).toLocaleString("en-US"),
      subtitle: "transactions",
    });

    // If we have highest spending month data
    if (analytics.highestSpendingMonth) {
      updatedSlides.push({
        type: "standard",
        gradient: "from-pink-500 to-pink-700",
        title: "Your highest spending month was",
        value: analytics.highestSpendingMonth.monthName,
        subtitle:
          "You spent " + formatCurrency(analytics.highestSpendingMonth.total),
        description: "That's your biggest spending month!",
        textColor: "pink",
        // backgroundElm: () => <TransactionMonthBars transactions={rawTransactions} />,
      });
    }

    // If we have top merchants data
    if (analytics.topMerchants?.length > 0) {
      const topMerchant = analytics.topMerchants[0];
      updatedSlides.push({
        type: "standard",
        gradient: "from-orange-500 to-orange-700",
        title: "Your favorite merchant was",
        value: topMerchant.name,
        subtitle: `${formatCurrency(topMerchant.amount)} spent on ${
          topMerchant.visits
        } transactions`,
        description: `That's where you spent the most money this year `,
        textColor: "orange",
      });

    }

    // Update biggest purchase slide if we have the data
    if (analytics.biggestPurchase) {
      const purchase = analytics.biggestPurchase;
      updatedSlides.push({
        type: "standard",
        gradient: "from-lime-500 to-lime-700",
        title: "Your biggest purchase",
        value: formatCurrency(Math.abs(purchase.amount)),
        subtitle: purchase.merchant?.name || purchase.description,
        description: `That's ${Math.round(
          ((Math.abs(purchase.amount) - analytics.averagePurchase) /
            analytics.averagePurchase) *
            100
        )}% more than your average purchase`,
        textColor: "lime",
      });
    }

    // If we have weekend spending data
    if (analytics.weekendSpending) {
      updatedSlides.push({
        type: "standard",
        gradient: "from-cyan-500 to-cyan-700",
        title: "Weekend warrior",
        value: formatCurrency(analytics.weekendSpending.averagePerDay),
        subtitle: "average weekend spending",
        description:
          analytics.weekendSpending.percentageHigher > 0
            ? `You tend to spend ${Math.round(
                analytics.weekendSpending.percentageHigher
              )}% more on weekends`
            : `You actually spend ${Math.round(
                Math.abs(analytics.weekendSpending.percentageHigher)
              )}% less on weekends`,
        textColor: "cyan",
      });
    }

    // If we have cafe visits data
    if (analytics.cafeVisits) {
      updatedSlides.push({
        type: "standard",
        gradient: "from-violet-500 to-violet-700",
        title: "You visited cafes & restaurants",
        value: `${analytics.cafeVisits} times`,
        subtitle: `spending ${formatCurrency(analytics.cafeSpending)}`,
        description: `That's about ${formatCurrency(
          analytics.cafeSpending / 52
        )} per week over ${analytics.weeklyAverage} visits `,
        textColor: "violet",
      });
    }

    // Also update the top restaurants list if we have enough merchants
    if (analytics.topMerchants?.length >= 5) {
      updatedSlides.push({
        type: "list",
        gradient: "from-rose-500 to-rose-700",
        title: "Your Top 5 Merchants",
        textColor: "rose",
        items: analytics.topMerchants.map(
          (
            merchant: { name: any; amount: number | bigint; logo: string },
            index: number
          ) => ({
            rank: index + 1,
            name: merchant.name,
            detail: `${formatCurrency(Number(merchant.amount))} spent`,
            logo: merchant.logo,
          })
        ),
      });
    }
    

    // If we have monthly spending data
    if (analytics.monthlySpendingArray?.length > 0) {
      updatedSlides.push({
        type: "list",
        gradient: "from-amber-500 to-amber-700",
        title: "Most Expensive Months",
        textColor: "amber",
        items: analytics.monthlySpendingArray
          .slice(0, 5)
          .map(
            (
              month: { monthName: any; total: number | bigint },
              index: number
            ) => ({
              rank: index + 1,
              name: month.monthName,
              detail: `${formatCurrency(Number(month.total))} spent`,
            })
          ),
      });
    }

    // If we have top categories data
    if (analytics.topCategories?.length > 0) {
      updatedSlides.push({
        type: "list",
        gradient: "from-teal-500 to-teal-700",
        title: "Top Spending Categories",
        textColor: "teal",
        items: analytics.topCategories.map((category, index) => ({
          rank: index + 1,
          name: category.name,
          detail: formatCurrency(category.amount),
        })),
      });
    }

    return updatedSlides;
  }, [analytics]);

  // Assign random animations to slides
  const slidesWithAnimations = useMemo(() => {
    return slides.map((slide) => ({
      ...slide,
      animation:
        slideAnimations[Math.floor(Math.random() * slideAnimations.length)],
    }));
  }, [slides]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNextSlide();
      } else if (event.key === "ArrowLeft") {
        handlePrevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev + 1 >= slides.length - 1) {
        if (audioRef.current) {
          fadeOutAudio(audioRef.current);
        }
      }

      if (prev + 1 >= slides.length) {
        navigate("/final-results", {
          state: { analytics },
        });
      }

      return Math.min(prev + 1, slides.length - 1);
    });
  };

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
          navigate("/final-results", {
            state: { analytics },
          });
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
  }, [navigate, slides.length, audioRef, analytics]);

  const renderSlideContent = (slide: Slide) => {
    if (slide.type === "list") {
      return (
        <div
          className={`w-full h-full rounded-xl p-8 bg-gradient-to-b ${slide.gradient} text-white flex flex-col shadow-lg`}
        >
          {slide.backgroundElm && slide.backgroundElm()}
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
                  }xl font-bold min-w-[1.5rem]`}
                >
                  {item.rank}
                </span>
                {item.logo && (
                  <img
                    src={item.logo}
                    className="h-16 max-md:h-10 rounded shadow-lg"
                  />
                )}
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
        <p className={`text-lg mb-2 opacity-80 text-center`}>{slide.title}</p>
        <p className="text-6xl font-bold mb-2 text-center">{slide.value}</p>
        <p className={`text-lg opacity-80 text-center`}>{slide.subtitle}</p>
        {slide.description && (
          <p className={`text-lg opacity-80 mt-4 text-center`}>
            {slide.description}
          </p>
        )}
      </div>
    );
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
          navigate("/final-results", {
            state: { analytics },
          });
          return prev;
        }
        return nextSlide;
      });
    }, 8000);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 relative p-12 max-md:p-0 z-20">
      <div className="fixed bottom-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="z-50 bg-black/10 backdrop-blur-sm hover:bg-white/20 border-none text-blue-400"
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>
      <Button
        variant="outline"
        className="fixed bottom-4 left-28 z-50 bg-black/10 backdrop-blur-sm hover:bg-white/20 border-none text-blue-400"
        asChild
      >
        <Link
          to="/final-results"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = true;
              setIsMuted(true);
            }
          }}
        >
          Skip to results
        </Link>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-50 bg-black/10 backdrop-blur-sm hover:bg-white/70 hover:text-black border-none text-blue-400"
        onClick={handlePrevSlide}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-14 z-50 bg-black/10 backdrop-blur-sm hover:bg-white/20 border-none text-blue-400"
        onClick={handleNextSlide}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </Button>

      <TimelineSlider
        totalSlides={slides.length}
        currentSlide={currentSlide}
        onSlideClick={handleTimelineClick}
      />

      <div className="relative h-full w-full -z-10 ">
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
