const DocViewer = ({ fileUrl }) => {
  return (
    <iframe
      title="doc-viewer"
      width="100%"
      height="100%"
      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        fileUrl
      )}`}
    />
  );
};

export default DocViewer;