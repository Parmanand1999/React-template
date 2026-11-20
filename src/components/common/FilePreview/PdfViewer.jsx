const PdfViewer = ({ fileUrl }) => {
  return (
    <iframe
      src={fileUrl}
      title="pdf-viewer"
      width="100%"
      height="100%"
      className="border-0"
    />
  );
};

export default PdfViewer;