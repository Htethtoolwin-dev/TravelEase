"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection({
  stats,
}: {
  stats: {
    happyCustomers: number;
    toursCompleted: number;
    destinations: number;
    yearsExperience: number;
  };
}) {
  const items = [
    { label: "Happy Customers", value: stats.happyCustomers, suffix: "+" },
    { label: "Tours Completed", value: stats.toursCompleted, suffix: "+" },
    { label: "Destinations", value: stats.destinations, suffix: "+" },
    { label: "Years of Experience", value: stats.yearsExperience, suffix: "+" },
  ];

  return (
    <section className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-heading text-4xl font-bold md:text-5xl">
                <AnimatedCounter value={item.value} suffix={item.suffix} />
              </p>
              <p className="mt-2 text-sm text-white/80">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
