'use client';
 
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Link, MinusIcon, PlusIcon } from 'lucide-react';
 
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'technical' | 'support';
}
 
const faqItems: FaqItem[] = [
  {
    id: '1',
    question: 'What is Mealwise?',
    answer:
      'Mealwise is an intelligent meal planning app that helps you create personalized meal plans, generate grocery lists, and discover new recipes tailored to your dietary preferences and goals.',
    category: 'general',
  },
  {
    id: '2',
    question: 'Is Mealwise free to use?',
    answer:
      'Mealwise offers a free plan with core features. Premium features, such as advanced analytics and priority support, are available with a subscription.',
    category: 'pricing',
  },
  {
    id: '3',
    question: 'How do I generate a meal plan?',
    answer:
      'Simply sign up, set your dietary preferences and goals, and Mealwise will generate a personalized meal plan for you. You can further customize your plan and swap meals as needed.',
    category: 'technical',
  },
  {
    id: '4',
    question: 'Can I customize my meal plan?',
    answer:
      'Yes! You can swap meals, adjust serving sizes, and add or remove recipes to fit your needs. Mealwise is designed for flexibility.',
    category: 'technical',
  },
  {
    id: '5',
    question: 'Does Mealwise support different diets?',
    answer:
      'Absolutely. Mealwise supports a variety of diets including vegetarian, vegan, keto, halal, pescatarian, and more. You can set your preferences during onboarding or in your profile.',
    category: 'general',
  },
  {
    id: '6',
    question: 'How does the grocery list feature work?',
    answer:
      'Mealwise automatically generates a grocery list based on your selected meal plan. You can check off items as you shop and even filter by store or category.',
    category: 'technical',
  },
  {
    id: '7',
    question: 'Is my data secure with Mealwise?',
    answer:
      'Yes, we take your privacy seriously. All your data is securely stored and never shared with third parties without your consent.',
    category: 'support',
  },
  {
    id: '8',
    question: 'How can I contact support?',
    answer:
      'You can reach our support team via the Contact Support button below or by emailing support@mealwise.app. We aim to respond within 24 hours.',
    category: 'support',
  },
];
 
const categories = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'technical', label: 'Technical' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'support', label: 'Support' },
];
 
export default function Faq2() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
 
  const filteredFaqs =
    activeCategory === 'all'
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);
 
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
 
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center">
          <Badge
            variant="outline"
            className="mb-4 border-cyan-400 bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-md"
          >
            FAQs
          </Badge>
 
          <h2 className="mb-6 text-center text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg md:text-5xl">
            Frequently Asked Questions
          </h2>
 
          <p className="max-w-2xl text-center text-pink-500 font-medium">
            Find answers to common questions about Mealwise and how to use our
            AI to extensively plan your Meals
          </p>
        </div>
 
        {/* Category Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-bold transition-all border-2',
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white border-cyan-400 shadow-md scale-105'
                  : 'bg-zinc-100 text-cyan-600 border-cyan-200 hover:bg-cyan-50',
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
 
        {/* FAQ Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  'h-fit overflow-hidden rounded-xl border-2',
                  expandedId === faq.id
                    ? 'shadow-3xl bg-gradient-to-r from-cyan-50 to-pink-50 border-cyan-400'
                    : 'bg-white border-zinc-200',
                )}
                style={{ minHeight: '88px' }}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left group"
                >
                  <h3 className="text-lg font-bold text-cyan-700 group-hover:text-pink-600 transition-colors">
                    {faq.question}
                  </h3>
                  <div className="ml-4 flex-shrink-0">
                    {expandedId === faq.id ? (
                      <MinusIcon className="h-5 w-5 text-pink-500" />
                    ) : (
                      <PlusIcon className="h-5 w-5 text-cyan-500" />
                    )}
                  </div>
                </button>
 
                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-cyan-100 px-6 pb-6 pt-2">
                        <p className="text-pink-700 font-medium">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
 
        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="mb-4 text-cyan-600 font-semibold">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg border-2 border-pink-500 bg-gradient-to-r from-cyan-500 to-pink-500 px-6 py-3 font-bold text-white transition-all hover:scale-105 shadow-lg"
          >
            Contact Support
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
 