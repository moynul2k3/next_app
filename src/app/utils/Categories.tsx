import Link from "next/link";

const API_URL = "http://127.0.0.1:8000/api"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
    NavigationMenuContent,
    // NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


export default async function Categories() {
  const res = await fetch(`${API_URL}/categories/`, {
    next: {
      revalidate: 15,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch data");

  const categories = await res.json();

  const navCategoriesStyle = {
    width: '600px',
    height: 'auto',
    maxHeight: '300px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    overflow: 'auto',
    gap: '40px',
    justifyItems: 'center',
    alignItems: 'start',
  };

  return (
      <div className="flex justify-between items-center">
        <NavigationMenu>
            <NavigationMenuList className="flex flex-nowrap overflow-x-auto w-auto">
                <NavigationMenuItem>
                    <Link href="/" className={navigationMenuTriggerStyle()}>Home</Link>
                    <Link href="/about" className={navigationMenuTriggerStyle()}>About</Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>

      <NavigationMenu>
          <Carousel className="w-[600px] me-16">
            <NavigationMenuList >
              <CarouselContent className="">
                {categories.map((category: { id: number; name: string; subcategories: { id: number; name: string; image: string }[] }) => (
                    <CarouselItem key={category.id} className="basis-auto">
                      <NavigationMenuItem >
                          <NavigationMenuTrigger className="select-none ">{category.name}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                              <div  className="p-5" style={navCategoriesStyle}>
                                  {category.subcategories.map((subcat) => (
                                      <Link href="/" key={subcat.id} className="flex justify-center items-center flex-col">
                                        <Avatar>
                                          <AvatarImage src={subcat.image} alt="{subcat.name}" />
                                          <AvatarFallback>{subcat.name}</AvatarFallback>
                                        </Avatar>
                                        <p>{subcat.name}</p>
                                      </Link>
                                  ))}
                                </div>
                            </NavigationMenuContent>
                      </NavigationMenuItem>
                    </CarouselItem>
                ))}
              </CarouselContent>
            </NavigationMenuList>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </NavigationMenu>
      </div>
    );
}
