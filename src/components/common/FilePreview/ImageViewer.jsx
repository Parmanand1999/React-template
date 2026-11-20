const ImageViewer = ({ fileUrl }) => {
  return (
    <div className="flex justify-center items-center h-full bg-gray-100">
      <img
        src={fileUrl}
        alt="preview"
        className="max-h-[90vh] object-contain"
      />
    </div>
  );
};

export default ImageViewer;