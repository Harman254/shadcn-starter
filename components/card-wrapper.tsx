import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import Link from 'next/link';

interface CardWrapperType {
  children: React.ReactNode;
  cardTitle: string;
  cardDescription: string;
  cardFooterLinkTitle?: string;
  cardFooterDescription?: string;
  cardFooterLink?: string;
  className?: string;
  onFooterLinkClick?: () => void;
  showFooterAsButton?: boolean;
}

const CardWrapper = ({
  children,
  cardTitle,
  cardDescription,
  cardFooterLinkTitle = 'Learn More', // Default value
  cardFooterDescription = '',
  cardFooterLink,
  className = '',
  onFooterLinkClick,
  showFooterAsButton = false,
}: CardWrapperType) => {
  return (
    <Card className={`w-full max-w-md sm:max-w-lg mx-auto relative rounded-2xl shadow-xl p-4 sm:p-8 ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-bold mb-2 text-center" >{cardTitle}</CardTitle>
        <CardDescription className="text-base sm:text-lg text-center mb-6">{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {(cardFooterLink || onFooterLinkClick) && (
        <CardFooter className="flex items-center justify-center gap-x-1">
          {cardFooterDescription && <span>{cardFooterDescription}</span>}
          {showFooterAsButton && onFooterLinkClick ? (
            <button
              type="button"
              className="underline text-blue-500 hover:text-blue-700 bg-transparent border-none p-0 m-0 cursor-pointer"
              onClick={onFooterLinkClick}
            >
              {cardFooterLinkTitle}
            </button>
          ) : cardFooterLink ? (
            <Link
              href={cardFooterLink}
              className="underline text-blue-500 hover:text-blue-700"
              legacyBehavior>
              {cardFooterLinkTitle}
            </Link>
          ) : null}
        </CardFooter>
      )}
    </Card>
  );
};

export default CardWrapper;