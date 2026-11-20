import { useMemo } from "react";
import DocViewer from "./DocViewer";
import ImageViewer from "./ImageViewer";
import PdfViewer from "./PdfViewer";


const FilePreview = ({ fileUrl }) => {
  const extension = useMemo(() => {
    return fileUrl
      ?.split(".")
      ?.pop()
      ?.split("?")[0]
      ?.toLowerCase();
  }, [fileUrl]);
  console.log(fileUrl, "fileUrl");

  console.log(extension, "extension");


  switch (extension) {
    case "png":
    case "jpg":
    case "jpeg":
      return <ImageViewer fileUrl={fileUrl} />;

    case "pdf":
      return <PdfViewer fileUrl={fileUrl} />;
    // case "pdf":
    case "doc":
    case "docx":
      return <DocViewer fileUrl={fileUrl} />;

    default:
      return (
        <div className="text-center p-5">
          Preview not available
        </div>
      );
  }
};

export default FilePreview;