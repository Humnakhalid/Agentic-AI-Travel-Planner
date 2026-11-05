import Login from "./Login.jsx";
import { useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";


const destinations = [
  {
    name: "Bali",
    country: "Indonesia",
    tag: "Island escape",
    detail: "Tropical beaches, hidden waterfalls and lush rice terraces.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Istanbul",
    country: "Turkey",
    tag: "Culture & history",
    detail: "Colourful bazaars, beautiful mosques and delicious food.",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Swiss Alps",
    country: "Switzerland",
    tag: "Mountain adventure",
    detail: "Snow-capped peaks, scenic trains and peaceful alpine villages.",
    image:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Santorini",
    country: "Greece",
    tag: "Coastal beauty",
    detail: "Whitewashed villages, blue domes and unforgettable sunsets.",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Dubai",
    country: "United Arab Emirates",
    tag: "City & luxury",
    detail: "Skyline views, desert adventures and world-class attractions.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Paris",
    country: "France",
    tag: "Romantic getaway",
    detail: "Charming streets, art, cafés and iconic architecture.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Kyoto",
    country: "Japan",
    tag: "Slow travel",
    detail: "Ancient temples, bamboo forests and traditional gardens.",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Maldives",
    country: "Maldives",
    tag: "Ocean paradise",
    detail: "Turquoise lagoons, white-sand beaches and island retreats.",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=85",
  },
];

const suggestions = [
  "A relaxing beach holiday",
  "A budget-friendly adventure",
  "A romantic weekend away",
];

const steps = [
  {
    number: "01",
    icon: "✍",
    title: "Dream out loud",
    description:
      "Describe your ideal holiday in your own words. Start with a destination, a budget, or simply a mood.",
    background: "bg-[#E8F1E9]",
  },
  {
    number: "02",
    icon: "✦",
    title: "Make it yours",
    description:
      "Bring your interests and travel style into the mix to shape an adventure that suits you.",
    background: "bg-[#FBE9DF]",
  },
  {
    number: "03",
    icon: "↗",
    title: "Get out there",
    description:
      "Turn your idea into a plan and get one step closer to the places you have been dreaming about.",
    background: "bg-[#E8EBF6]",
  },
];

function Home({ currentUser, conversationId, onLogout }) {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assistantReply, setAssistantReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function chooseSuggestion(text) {
    setPrompt(text);
    setNotice("");
    setIsSubmitted(false);

    document.getElementById("travelPrompt")?.focus();
  }

  function chooseDestination(place) {
    setPrompt(
      `Plan a trip to ${place.name}, ${place.country}. Suggest the best time to visit, things to do, places to stay, and an estimated budget.`
    );

    setNotice("");
    setIsSubmitted(false);

    document.getElementById("planner")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function scrollDestinations(direction) {
    document.getElementById("destination-slider")?.scrollBy({
      left: direction * 350,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!prompt.trim()) {
      setNotice("Tell us a little about the trip you have in mind.");
      setIsSubmitted(false);
      return;
    }

    if (!currentUser || !conversationId) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setNotice("Your AI travel planner is preparing your trip...");
    setAssistantReply("");
    setIsSubmitted(false);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            content: prompt.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "The travel planner could not respond."
        );
      }

      setAssistantReply(data.assistant_message.content);
      setNotice("Your travel plan is ready!");
      setIsSubmitted(true);
    } catch (error) {
      setNotice(
        error.message ||
          "Something went wrong. Please check your backend server."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#FAF9F5] text-[#193C38]">
      {/* Navigation */}
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a
            href="#home"
            className="flex items-center gap-2 text-2xl font-black tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176B60] text-xl text-white">
              r
            </span>
            roamly<span className="text-[#F17A61]">.</span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-[#60736C] md:flex">
            <a
              href="#destinations"
              className="transition hover:text-[#176B60]"
            >
              Destinations
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-[#176B60]"
            >
              How it works
            </a>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <span className="hidden text-sm text-[#60736C] sm:inline">
                  Hi, {currentUser.username}
                </span>

                <button
                  type="button"
                  onClick={onLogout}
                  disabled={isLoading}
                  className="rounded-full border border-[#DDE8E0] px-4 py-3 text-sm font-semibold transition hover:bg-[#EAF3ED] disabled:opacity-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-[#DDE8E0] px-5 py-3 text-sm font-semibold transition hover:bg-[#EAF3ED]"
              >
                Log in
              </Link>
            )}

            <a
              href="#planner"
              className="rounded-full bg-[#193C38] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176B60]"
            >
              Plan a trip <span aria-hidden="true">↗</span>
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section
          id="home"
          className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-12 lg:grid-cols-[1fr_0.95fr] lg:gap-16"
        >
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DCE8DF] bg-white px-4 py-2 text-sm font-medium text-[#46756A] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#F17A61]" />
              Your next adventure starts here
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Less planning.
              <br />
              <span className="font-serif font-normal italic text-[#F17A61]">
                More wandering.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-[#718079] sm:text-lg">
              Tell us what your dream trip looks like. We’ll help you turn
              that little spark of wanderlust into a journey worth
              remembering.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#planner"
                className="group inline-flex items-center gap-3 rounded-full bg-[#176B60] px-6 py-4 font-semibold text-white shadow-lg shadow-[#176B60]/20 transition hover:-translate-y-0.5 hover:bg-[#12584F]"
              >
                Plan my adventure
                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#destinations"
                className="px-3 py-3 text-sm font-semibold text-[#526B63] transition hover:text-[#176B60]"
              >
                Explore destinations ↓
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#7C8B83]">
              <span className="flex items-center gap-2">
                <span className="text-[#176B60]">✳</span>
                Made for curious travellers
              </span>

              <span className="flex items-center gap-2">
                <span className="text-[#176B60]">✳</span>
                Your trip, your way
              </span>
            </div>
          </div>

          {/* Hero image collage */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-[#F4D9BB] opacity-70 blur-2xl" />
            <div className="absolute -bottom-5 -left-5 h-36 w-36 rounded-full bg-[#BFDCD0] opacity-70 blur-2xl" />

            <div className="relative grid grid-cols-[1.1fr_0.9fr] items-center gap-3 sm:gap-4">
              <div className="relative mt-10 overflow-hidden rounded-[45%_45%_22px_22px] shadow-xl shadow-[#193C38]/10">
                <img
                  src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85"
                  alt="Tropical Bali coastline"
                  className="h-[340px] w-full object-cover sm:h-[440px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#102E28]/60 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-5 text-white sm:bottom-8 sm:left-7">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/75">
                    Find your somewhere
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    Bali, Indonesia
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    Where the soul slows down
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="overflow-hidden rounded-[100px_100px_22px_22px] shadow-xl shadow-[#193C38]/10">
                  <img
                    src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85"
                    alt="Mountain landscape"
                    className="h-[205px] w-full object-cover sm:h-[255px]"
                  />
                </div>

                <div className="overflow-hidden rounded-[22px_22px_100px_100px] shadow-xl shadow-[#193C38]/10">
                  <img
                    src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=85"
                    alt="Blue ocean waves"
                    className="h-[180px] w-full object-cover sm:h-[220px]"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -left-2 top-8 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl sm:-left-8 sm:top-16">
              <p className="text-xs text-[#87948D]">Your next chapter</p>
              <p className="mt-1 text-sm font-bold">
                Somewhere beautiful ✨
              </p>
            </div>

            <div className="absolute -bottom-5 right-3 rounded-full border border-white/80 bg-white/95 px-4 py-3 text-sm font-semibold shadow-xl sm:right-8">
              <span className="mr-2 text-[#F17A61]">✦</span>
              Follow your curiosity
            </div>
          </div>
        </section>

        {/* AI trip planner */}
        <section
          id="planner"
          className="mx-auto max-w-7xl scroll-mt-8 px-5 py-10 sm:px-8 sm:py-16"
        >
          <div className="grid items-start gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div className="pt-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F17A61]">
                Your journey, your rules
              </p>

              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                If you can
                <br />
                <span className="font-serif font-normal italic text-[#176B60]">
                  dream it,
                </span>
                <br />
                we can plan it.
              </h2>

              <p className="mt-5 max-w-md leading-7 text-[#718079]">
                No complicated forms. Just tell us what you’re imagining —
                the destination, the vibe, your budget, or even just a feeling.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  ["01", "Tell us your idea", "Big plans or tiny escapes."],
                  ["02", "Shape your journey", "Make the details your own."],
                  ["03", "Get ready to go", "Turn inspiration into a plan."],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F0E8] text-sm font-bold text-[#176B60]">
                      {number}
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-1 text-sm text-[#839087]">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-3xl border border-[#DDE8E0] bg-white shadow-[0_20px_70px_-40px_rgba(18,107,96,0.3)]"
              >
                <div className="flex items-center justify-between border-b border-[#EAF0EA] px-6 py-5 sm:px-8">
                  <div>
                    <p className="font-semibold">Your travel wish list</p>
                    <p className="mt-1 text-sm text-[#89958E]">
                      Start with whatever is on your mind
                    </p>
                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F2EC] text-xl">
                    ✨
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  {currentUser && (
                    <p className="mb-5 text-sm text-[#60736C]">
                      Logged in as <strong>{currentUser.username}</strong>
                    </p>
                  )}

                  <label
                    htmlFor="travelPrompt"
                    className="mb-3 block text-sm font-semibold"
                  >
                    What kind of trip are you dreaming of?
                  </label>

                  <textarea
                    id="travelPrompt"
                    name="travelPrompt"
                    rows={5}
                    value={prompt}
                    onChange={(event) => {
                      setPrompt(event.target.value);
                      setNotice("");
                      setIsSubmitted(false);
                    }}
                    placeholder="I want to spend 5 days exploring Turkey with a friend. We love local food, historic places and beautiful views. Keep it affordable..."
                    className="w-full resize-y rounded-2xl border border-[#DDE7DF] bg-[#FBFCF9] p-4 leading-7 text-[#193C38] outline-none transition placeholder:text-[#A2ADA5] focus:border-[#176B60] focus:ring-4 focus:ring-[#176B60]/10"
                  />

                  <p className="mt-2 text-xs text-[#89958E]">
                    A few details help, but you don’t need to have everything
                    figured out.
                  </p>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-[#89958E]">
                      Need a little inspiration?
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => chooseSuggestion(suggestion)}
                          className="rounded-full border border-[#DDE7DF] px-3 py-2 text-xs font-medium text-[#557068] transition hover:border-[#176B60] hover:bg-[#EAF3ED] hover:text-[#176B60] sm:text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#176B60] px-6 py-4 font-semibold text-white shadow-lg shadow-[#176B60]/15 transition hover:-translate-y-0.5 hover:bg-[#12584F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Please wait..." : "Help me plan my trip"}
                    {!isLoading && <span>→</span>}
                  </button>

                  {notice && (
                    <p
                      role="status"
                      className={`mt-4 rounded-xl p-4 text-sm leading-6 ${
                        isSubmitted
                          ? "bg-[#EAF3ED] text-[#176B60]"
                          : "bg-[#FFF0E9] text-[#9B4C36]"
                      }`}
                    >
                      {notice}
                    </p>
                  )}
                </div>
              </form>

              {assistantReply && (
                <div className="mt-6 rounded-2xl border border-[#DDE8E0] bg-[#F0F3EC] p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl">
                      ✨
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">
                        Your AI travel plan
                      </h3>
                      <p className="mt-1 text-sm text-[#718079]">
                        Created for your next adventure
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#193C38]">
                    {assistantReply}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Destination slider */}
        <section
          id="destinations"
          className="scroll-mt-8 bg-[#F0F3EC] py-16 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F17A61]">
                  A little inspiration
                </p>

                <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                  The world is{" "}
                  <span className="font-serif italic">calling.</span>
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-[#718079]">
                  From slow island mornings to cities that never sleep, find a
                  place that feels like you.
                </p>
              </div>

              <a
                href="#planner"
                className="w-fit pb-1 text-sm font-semibold text-[#176B60] underline decoration-[#B5D0C2] underline-offset-8 transition hover:text-[#F17A61]"
              >
                Create your own adventure ↗
              </a>
            </div>

            <div className="relative mt-8">
              <div className="mb-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  aria-label="Scroll destinations left"
                  onClick={() => scrollDestinations(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D7E2D8] bg-white text-xl transition hover:bg-[#176B60] hover:text-white"
                >
                  ←
                </button>

                <button
                  type="button"
                  aria-label="Scroll destinations right"
                  onClick={() => scrollDestinations(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D7E2D8] bg-white text-xl transition hover:bg-[#176B60] hover:text-white"
                >
                  →
                </button>
              </div>

              <div
                id="destination-slider"
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-5"
                style={{ scrollbarWidth: "none" }}
              >
                {destinations.map((place) => (
                  <button
                    type="button"
                    key={place.name}
                    onClick={() => chooseDestination(place)}
                    className="group w-[82vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-3xl border border-[#E1E8DF] bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#193C38]/10 sm:w-[310px]"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={place.image}
                        alt={`${place.name}, ${place.country}`}
                        loading="lazy"
                        className="h-[240px] w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-[#426B60] shadow-sm">
                        {place.tag}
                      </span>

                      <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-[#176B60] shadow-md transition group-hover:bg-[#176B60] group-hover:text-white">
                        ↗
                      </span>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#89958E]">
                        {place.country}
                      </p>

                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                        {place.name}
                      </h3>

                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#7B8981]">
                        {place.detail}
                      </p>

                      <p className="mt-4 text-sm font-semibold text-[#176B60]">
                        Plan a trip here <span className="ml-1">→</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <p className="mt-1 text-xs text-[#89958E]">
                Choose a destination to add it to your travel idea.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F17A61]">
              Easy as one, two, roam
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your kind of trip.
              <br />
              <span className="font-serif font-normal italic text-[#176B60]">
                Without the overwhelm.
              </span>
            </h2>

            <p className="mt-5 leading-7 text-[#718079]">
              Travel planning should feel like the beginning of an adventure,
              not another task on your to-do list.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-[#E6EBE4] bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#193C38]/5 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${step.background}`}
                  >
                    {step.icon}
                  </span>

                  <span className="text-sm font-bold tracking-widest text-[#B5C0B7]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-semibold">{step.title}</h3>

                <p className="mt-3 leading-7 text-[#7B8981]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#193C38] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[#F17A61]/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-[#4F9A82]/25 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F4A18D]">
                Your next story awaits
              </p>

              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Somewhere out there
                <br />
                is{" "}
                <span className="font-serif italic text-[#F4A18D]">
                  your place.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-lg leading-7 text-white/70">
                The best journeys begin with an idea. Let’s start with yours.
              </p>

              <a
                href="#planner"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#FAF9F5] px-7 py-4 font-semibold text-[#193C38] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Start dreaming <span>→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5EAE2]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-[#7B8981] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <a
            href="#home"
            className="w-fit text-xl font-black tracking-tight text-[#193C38]"
          >
            roamly<span className="text-[#F17A61]">.</span>
          </a>

          <p>Made for the places you haven’t been yet.</p>

          <a
            href="#home"
            className="w-fit transition hover:text-[#176B60]"
          >
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}

function AppRoutes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);


  async function handleLogin(user) {
    setCurrentUser(user);
   

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not create your travel conversation."
        );
      }

      setConversationId(data.id);
    } catch (error) {
      setCurrentUser(null);
      setConversationId(null);
      throw error;
    }
  }

  async function handleLogout() {
  
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      setCurrentUser(null);
      setConversationId(null);
    } 

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            currentUser={currentUser}
            conversationId={conversationId}
            onLogout={handleLogout}
          />
        }
      />

      <Route
        path="/login"
        element={
          <Login
            onLogin={handleLogin}
          />
        }
      />

      <Route
        path="*"
        element={
          <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F5] px-6 text-center text-[#193C38]">
            <h1 className="text-4xl font-semibold">Page not found</h1>
            <p className="mt-3 text-[#718079]">
              Sorry, we couldn’t find that page.
            </p>
            <Link
              to="/"
              className="mt-6 rounded-full bg-[#176B60] px-6 py-3 font-semibold text-white"
            >
              Back to Roamly
            </Link>
          </main>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
