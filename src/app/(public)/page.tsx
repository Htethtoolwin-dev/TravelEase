import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/shared/button-link";
import { BlogCard } from "@/features/blog/components/blog-card";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { HeroSection } from "@/features/home/components/hero-section";
import { NewsletterSection } from "@/features/home/components/newsletter-section";
import { StatsSection } from "@/features/home/components/stats-section";
import { WhyChooseUsSection } from "@/features/home/components/why-choose-us-section";
import { TourCard } from "@/features/tours/components/tour-card";
import { APP_NAME, ROUTES, WHY_CHOOSE_US } from "@/constants";
import { getPublishedBlogs } from "@/services/blogs.service";
import { getFeaturedDestinations } from "@/services/destinations.service";
import { getApprovedTestimonials } from "@/services/reviews.service";
import { getPublicStats } from "@/services/settings.service";
import { getFeaturedTours } from "@/services/tours.service";

export const metadata: Metadata = {
  title: "Home",
  description: `Discover amazing destinations and book unforgettable tours with ${APP_NAME}.`,
};

export const revalidate = 300;

export default async function HomePage() {
  const [featuredDestinations, featuredTours, latestBlogs, testimonials, siteStats] =
    await Promise.all([
      getFeaturedDestinations(6),
      getFeaturedTours(6),
      getPublishedBlogs(3),
      getApprovedTestimonials(3),
      getPublicStats(),
    ]);

  return (
    <>
      <HeroSection />

      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            Featured Destinations
          </h2>
          <p className="text-muted-foreground mt-3">
            Explore our most popular travel destinations
          </p>
        </div>
        {featuredDestinations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDestinations.map(({ destination, tourCount }) => (
              <DestinationCard
                key={destination.id}
                slug={destination.slug}
                name={destination.name}
                country={destination.country}
                city={destination.city}
                image={destination.image}
                tourCount={Number(tourCount)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No destinations yet.</p>
        )}
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">
                Featured Tours
              </h2>
              <p className="text-muted-foreground mt-3">
                Handpicked experiences for your next adventure
              </p>
            </div>
            <ButtonLink href={ROUTES.tours} variant="outline" className="hidden sm:inline-flex">
              View All
              <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
          {featuredTours.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredTours.map(({ tour, destination }) => (
                <TourCard
                  key={tour.id}
                  slug={tour.slug}
                  title={tour.title}
                  coverImage={tour.coverImage}
                  duration={tour.duration}
                  price={tour.price}
                  discountPrice={tour.discountPrice}
                  averageRating={tour.averageRating}
                  reviewCount={tour.reviewCount}
                  availableSeats={tour.availableSeats}
                  destinationName={destination.name}
                  country={destination.country}
                  difficulty={tour.difficulty}
                  featured={tour.featured}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No tours yet.</p>
          )}
        </div>
      </section>

      <WhyChooseUsSection items={WHY_CHOOSE_US} />
      <StatsSection stats={siteStats} />

      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            What Our Travelers Say
          </h2>
        </div>
        {testimonials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map(({ review, userName, tourTitle }) => (
              <div key={review.id} className="rounded-2xl border bg-card p-6 shadow-sm">
                <p className="text-muted-foreground leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="mt-4">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-muted-foreground text-sm">{tourTitle}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Sarah Johnson", text: "An absolutely incredible experience! Every detail was perfectly planned." },
              { name: "Michael Chen", text: "TravelEase made our honeymoon unforgettable. Professional service throughout." },
              { name: "Emma Williams", text: "Best travel agency I've used. Affordable prices without compromising quality." },
            ].map((item) => (
              <div key={item.name} className="rounded-2xl border bg-card p-6 shadow-sm">
                <p className="text-muted-foreground leading-relaxed">&ldquo;{item.text}&rdquo;</p>
                <p className="mt-4 font-semibold">{item.name}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-bold">Latest from Our Blog</h2>
          </div>
          {latestBlogs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {latestBlogs.map(({ blog, authorName }) => (
                <BlogCard
                  key={blog.id}
                  slug={blog.slug}
                  title={blog.title}
                  excerpt={blog.excerpt}
                  coverImage={blog.coverImage}
                  publishedAt={blog.publishedAt}
                  authorName={authorName}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">
              No blog posts yet.{" "}
              <Link href={ROUTES.blog} className="text-primary hover:underline">
                Visit our blog
              </Link>
            </p>
          )}
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}
