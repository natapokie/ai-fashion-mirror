import Image from 'next/image';

export const Photo = ({ img }: { img: string }) => {
  if (!img) return null;

  return (
    <div className="fixed top-4 right-4 border border-gray-300 shadow-md">
      <Image id="image" alt="Received image" src={img} width={400} height={400} />
    </div>
  );
};
