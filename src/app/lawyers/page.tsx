
"use client";

import React from "react";
import { Landmark, Star, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import Link from "next/link";
import { lawyers, Lawyer } from "@/lib/lawyers-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const LawyerProfileCard = ({ lawyer }: { lawyer: Lawyer }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={lawyer.photoUrl}
            alt={`Photo of ${lawyer.name}`}
            layout="fill"
            objectFit="cover"
            className="bg-muted"
          />
        </div>
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-bold">{lawyer.name}</h3>
          <div className="flex items-center gap-1 text-sm text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span>{lawyer.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({lawyer.reviewCount} reviews)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lawyer.specialties.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary">{spec}</Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {lawyer.bio}
          </p>
          <Button className="w-full mt-2">View Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
};


export default function LawyersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center">
            <Landmark className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">LexiGuide</h1>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Analyze</Link>
            <Link href="/compare" className="text-muted-foreground hover:text-foreground">Compare</Link>
            <Link href="/lawyers" className="text-foreground">Find a Lawyer</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight">Find Your Legal Expert</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with experienced lawyers specializing in Indian corporate and contract law.
            </p>
          </div>

          <div className="mb-8 p-4 border rounded-lg bg-card flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search by name, specialty, or keyword..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-between">
                    Sort by: Rating <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Rating</DropdownMenuItem>
                  <DropdownMenuItem>Experience</DropdownMenuItem>
                  <DropdownMenuItem>Price</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-5 w-5" />
                <span className="sr-only">Filters</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lawyers.map((lawyer) => (
              <LawyerProfileCard key={lawyer.id} lawyer={lawyer} />
            ))}
          </div>
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                DISCLAIMER: This tool provides automated analysis and is for informational purposes only. It is not a substitute for professional legal advice. Always consult with a qualified attorney for legal matters.
            </p>
        </div>
      </footer>
    </div>
  );
}
