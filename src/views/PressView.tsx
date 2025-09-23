import type { FC } from "react";
import { useRef } from "react";

const PressView: FC = () => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  const handlePlay = (videoNumber: number) => {
    if (videoNumber === 1 && video2Ref.current) {
      video2Ref.current.pause();
    }
    if (videoNumber === 2 && video1Ref.current) {
      video1Ref.current.pause();
    }
  };

  return (
    <>
      <section className="text-[#f0f0f0] w-[90%] min-h-[80vh] pt-40 flex flex-col justify-center items-center">
        <div className="w-full max-w-[1200px] px-4">
          <h2 className="sm:text-[3.5em] text-[2.5em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
            Prensa
          </h2>
        </div>
        <h3 className="text-xl font-montserrat-light mb-8">
          Edición: <span className="font-montserrat-bold">XVI</span>
        </h3>
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="flex flex-col items-center justify-center">
            <video
              ref={video1Ref}
              className="w-full max-w-md rounded-lg shadow-lg cursor-pointer"
              controls
              src="/videos/XVI ROBLESMUN INAUGURACION.mp4"
              onPlay={() => handlePlay(1)}
            />
            <h2 className="mt-4 text-xl font-montserrat-bold text-center">
              Video de inauguración
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center">
            <video
              ref={video2Ref}
              className="w-full max-w-md rounded-lg shadow-lg cursor-pointer"
              controls
              src="/videos/XVI ROBLESMUN CLAUSURA.mp4"
              onPlay={() => handlePlay(2)}
            />
            <h2 className="mt-4 text-xl font-montserrat-bold text-center">
              Video de clausura
            </h2>
          </div>
        </div>
      </section>

      <section className="text-[#f0f0f0] w-full flex justify-center items-center border-amber-400 border-2">
        <h1>Archive</h1>
      </section>
    </>
  );
};

export default PressView;
