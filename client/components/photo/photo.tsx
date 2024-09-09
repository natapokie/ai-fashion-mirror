export const Photo = ({ img }: { img: string }) => {
  if (!img) return null;

  return (
    <div className="fixed top-4 right-4 border border-gray-300 shadow-md">
      <img id="image" alt="Received image" src={img} width={100} />
    </div>
  );
};
