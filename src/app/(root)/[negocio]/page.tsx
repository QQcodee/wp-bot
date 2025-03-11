"use client";
import React, { useState } from "react";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const page = () => {
  const [rating, setRating] = useState(0);
  const [isPositive, setIsPositive] = useState(null);

  const router = useRouter();

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleFeedback = (isPositiveFeedback: boolean) => {
    setIsPositive(isPositiveFeedback);
  };

  return (
    <div className="poppins w-full h-screen flex flex-col gap-4 items-center justify-center">
      <div className="flex flex-col gap-4 items-center justify-center px-2 py-5">
        <Avatar className="w-40 h-40 shadow-xl">
          <AvatarImage src="https://ivltiudjxnrytalzxfwr.supabase.co/storage/v1/object/public/imagenes-rifas/Dentistas/Screenshot%202025-03-05%20124651.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h2 className="font-bold poppins">Dra. Cristina Chao</h2>
        <h1 className="font-bold poppins text-center text-2xl sm:text-3xl">
          ¿Que tal fue tu experiencia con nosotros?
        </h1>

        {isPositive === null ? (
          <div className="flex gap-20 justify-center items-center mt-10">
            <div className="flex flex-col gap-2 items-center">
              <ThumbsUp
                size={50}
                onClick={() => handleFeedback(true)}
                className={
                  isPositive === true
                    ? "text-green-500 fill-current"
                    : "text-gray-300 hover:text-green-500"
                }
              />
              <p className="text-lg text-gray-500 ">Buena</p>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <ThumbsDown
                size={50}
                onClick={() => handleFeedback(false)}
                className={
                  isPositive === false
                    ? "text-red-500 fill-current"
                    : "text-gray-300 hover:text-red-500"
                }
              />
              <p className="text-lg text-gray-500">Mala</p>
            </div>
          </div>
        ) : null}
        {isPositive ? (
          <div className="flex gap-2 mt-10">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={50}
                onClick={() => handleRatingChange(i + 1)}
                className={
                  rating > i
                    ? "text-yellow-500 fill-current"
                    : "text-gray-300 hover:text-yellow-500"
                }
              />
            ))}
          </div>
        ) : null}
        {rating > 3 ? (
          <button
            onClick={() =>
              router.push(
                "https://search.google.com/local/writereview?placeid=ChIJpWodSvND6oYRsV8xqQDhmQU"
              )
            }
            className="text-lg bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-10"
          >
            Continuar
          </button>
        ) : null}

        {rating < 4 && rating > 0 ? (
          <button className="text-lg bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-10">
            Continuar
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default page;
